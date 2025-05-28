#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 运行npm审计
function runNpmAudit() {
  console.log('Running npm security audit...');
  const audit = spawn('npm', ['audit', '--json']);
  
  let output = '';
  audit.stdout.on('data', (data) => {
    output += data;
  });
  
  audit.on('close', (code) => {
    try {
      const result = JSON.parse(output);
      
      // 输出审计结果摘要
      console.log(`\nSecurity audit found ${result.metadata.vulnerabilities.total} vulnerabilities.`);
      
      // 将详细结果保存到文件
      fs.writeFileSync(
        path.join(__dirname, '../security-audit-result.json'),
        JSON.stringify(result, null, 2)
      );
      
      console.log('Full audit result saved to security-audit-result.json');
      
      // 检查是否有严重漏洞
      if (result.metadata.vulnerabilities.critical > 0 || 
          result.metadata.vulnerabilities.high > 0) {
        console.log('\n⚠️ CRITICAL OR HIGH VULNERABILITIES FOUND! Please fix them immediately.');
      }
    } catch (error) {
      console.error('Error parsing npm audit result:', error);
    }
  });
}

// 检查代码中的潜在安全问题
function checkCodeSecurity() {
  console.log('\nChecking code for potential security issues...');
  
  // 定义要搜索的危险模式
  const dangerousPatterns = [
    { pattern: 'innerHTML', description: 'Potentially dangerous innerHTML usage' },
    { pattern: 'outerHTML', description: 'Potentially dangerous outerHTML usage' },
    { pattern: 'eval(', description: 'Dangerous eval() usage' },
    { pattern: 'document.write(', description: 'Dangerous document.write() usage' },
    { pattern: 'dangerouslySetInnerHTML', description: 'Review React dangerouslySetInnerHTML usage' }
  ];
  
  // 获取所有TS和JS文件
  const getAllFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        fileList = getAllFiles(filePath, fileList);
      } else if (
        stat.isFile() && 
        (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))
      ) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };
  
  const sourceFiles = getAllFiles(path.join(__dirname, '..'));
  
  // 检查每个文件
  let issuesFound = 0;
  sourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    dangerousPatterns.forEach(({ pattern, description }) => {
      if (content.includes(pattern)) {
        console.log(`⚠️ ${description} in ${file}`);
        issuesFound++;
      }
    });
  });
  
  console.log(`\nCode security check complete. ${issuesFound} potential issues found.`);
}

// 执行安全审计
runNpmAudit();
checkCodeSecurity();
