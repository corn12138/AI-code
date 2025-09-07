#!/usr/bin/env node

/**
 * 技能认证系统
 * 用于管理团队成员的测试技能认证
 */

const fs = require('fs');
const path = require('path');

class SkillCertification {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.certificationDir = path.join(this.projectRoot, 'docs', 'certification');
    this.certificatesFile = path.join(this.certificationDir, 'certificates.json');
    this.standards = {
      '测试基础': {
        level: '初级',
        requirements: {
          '理论考试': 70,
          '实践考试': 75,
          '项目实践': 1
        },
        skills: [
          '测试概念理解',
          '单元测试编写',
          '测试覆盖率理解'
        ]
      },
      'React测试': {
        level: '中级',
        requirements: {
          '理论考试': 75,
          '实践考试': 80,
          '项目实践': 2
        },
        skills: [
          'React组件测试',
          '用户交互测试',
          '异步操作测试'
        ]
      },
      '测试策略': {
        level: '高级',
        requirements: {
          '理论考试': 80,
          '实践考试': 85,
          '项目实践': 3
        },
        skills: [
          '测试策略设计',
          'Mock技术应用',
          '性能测试优化'
        ]
      },
      '测试工具专家': {
        level: '专家',
        requirements: {
          '理论考试': 85,
          '实践考试': 90,
          '项目实践': 5
        },
        skills: [
          '工具开发能力',
          '自动化流程设计',
          '团队培训能力'
        ]
      }
    };
  }

  /**
   * 初始化认证系统
   */
  initializeCertification() {
    console.log('🏆 初始化技能认证系统...');

    // 创建认证目录
    if (!fs.existsSync(this.certificationDir)) {
      fs.mkdirSync(this.certificationDir, { recursive: true });
    }

    // 创建证书文件
    if (!fs.existsSync(this.certificatesFile)) {
      const initialData = {
        certificates: [],
        standards: this.standards,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.certificatesFile, JSON.stringify(initialData, null, 2));
    }

    // 创建认证材料
    this.createCertificationMaterials();

    console.log('✅ 认证系统初始化完成');
  }

  /**
   * 创建认证材料
   */
  createCertificationMaterials() {
    console.log('📋 创建认证材料...');

    const materialsDir = path.join(this.certificationDir, 'materials');
    if (!fs.existsSync(materialsDir)) {
      fs.mkdirSync(materialsDir, { recursive: true });
    }

    // 创建各个级别的认证材料
    Object.keys(this.standards).forEach(certName => {
      const certDir = path.join(materialsDir, certName);
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      this.createCertificationMaterial(certName, certDir);
    });

    console.log('✅ 认证材料创建完成');
  }

  /**
   * 创建认证材料
   */
  createCertificationMaterial(certName, certDir) {
    const standard = this.standards[certName];

    // 创建考试大纲
    const syllabus = `# ${certName} 认证考试大纲

## 认证级别
${standard.level}

## 考试要求
${Object.entries(standard.requirements).map(([req, score]) => `- ${req}: ${score}分`).join('\n')}

## 技能要求
${standard.skills.map(skill => `- ${skill}`).join('\n')}

## 考试内容
1. 理论考试 (40%)
   - 测试概念和原理
   - 最佳实践理解
   - 工具使用知识

2. 实践考试 (40%)
   - 实际编码测试
   - 问题解决能力
   - 代码质量评估

3. 项目实践 (20%)
   - 实际项目参与
   - 团队协作能力
   - 持续改进贡献

## 考试时间
- 理论考试: 60分钟
- 实践考试: 120分钟
- 项目实践: 根据项目周期

## 通过标准
所有要求项目均达到最低分数要求，且总分不低于80分。
`;

    fs.writeFileSync(path.join(certDir, 'syllabus.md'), syllabus);

    // 创建考试题库
    const examQuestions = this.generateExamQuestions(certName);
    fs.writeFileSync(path.join(certDir, 'exam-questions.json'), JSON.stringify(examQuestions, null, 2));
  }

  /**
   * 生成考试题库
   */
  generateExamQuestions(certName) {
    const questions = {
      '测试基础': [
        {
          id: 'basic-1',
          type: 'multiple-choice',
          question: '什么是测试金字塔？',
          options: [
            'A. 测试用例的数量金字塔',
            'B. 测试覆盖率的层次结构',
            'C. 单元测试、集成测试、E2E测试的比例关系',
            'D. 测试执行时间的分布'
          ],
          correct: 2,
          explanation: '测试金字塔描述了不同级别测试的理想比例：单元测试最多，集成测试中等，E2E测试最少。'
        },
        {
          id: 'basic-2',
          type: 'true-false',
          question: '测试覆盖率100%意味着代码没有bug。',
          correct: false,
          explanation: '测试覆盖率只表示代码被执行过，不能保证没有bug。'
        }
      ],
      'React测试': [
        {
          id: 'react-1',
          type: 'multiple-choice',
          question: 'React Testing Library的主要原则是什么？',
          options: [
            'A. 测试实现细节',
            'B. 测试用户行为',
            'C. 测试组件内部状态',
            'D. 测试DOM结构'
          ],
          correct: 1,
          explanation: 'React Testing Library鼓励测试用户行为而不是实现细节。'
        }
      ],
      '测试策略': [
        {
          id: 'strategy-1',
          type: 'essay',
          question: '请描述如何为一个新项目设计测试策略。',
          points: 20,
          criteria: [
            '测试类型选择',
            '工具选择',
            '覆盖率目标',
            '执行计划'
          ]
        }
      ],
      '测试工具专家': [
        {
          id: 'expert-1',
          type: 'coding',
          question: '请编写一个测试工具来自动生成测试文件。',
          points: 30,
          requirements: [
            '支持多种组件类型',
            '生成基础测试结构',
            '包含常用断言',
            '支持自定义配置'
          ]
        }
      ]
    };

    return questions[certName] || [];
  }

  /**
   * 申请认证
   */
  applyForCertification(name, email, certName) {
    const data = this.loadCertificates();

    const application = {
      id: `cert-${Date.now()}`,
      name,
      email,
      certName,
      status: 'pending',
      applyDate: new Date().toISOString(),
      exams: {
        theory: { score: 0, completed: false },
        practice: { score: 0, completed: false },
        project: { score: 0, completed: false }
      },
      totalScore: 0,
      certificate: null
    };

    data.certificates.push(application);
    this.saveCertificates(data);

    console.log(`✅ ${name} 已申请 ${certName} 认证`);
    return application;
  }

  /**
   * 参加考试
   */
  takeExam(certId, examType, score) {
    const data = this.loadCertificates();
    const cert = data.certificates.find(c => c.id === certId);

    if (!cert) {
      throw new Error('认证申请不存在');
    }

    if (!cert.exams[examType]) {
      throw new Error('考试类型不存在');
    }

    cert.exams[examType].score = score;
    cert.exams[examType].completed = true;
    cert.exams[examType].completedDate = new Date().toISOString();

    // 计算总分
    cert.totalScore = this.calculateTotalScore(cert);

    // 检查是否通过
    if (this.checkCertificationPassed(cert)) {
      cert.status = 'passed';
      cert.certificate = this.generateCertificate(cert);
    }

    this.saveCertificates(data);

    console.log(`📝 ${cert.name} 完成 ${examType} 考试，得分: ${score}`);
    return cert;
  }

  /**
   * 计算总分
   */
  calculateTotalScore(cert) {
    const weights = {
      theory: 0.4,
      practice: 0.4,
      project: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(cert.exams).forEach(([type, exam]) => {
      if (exam.completed) {
        totalScore += exam.score * weights[type];
        totalWeight += weights[type];
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * 检查是否通过认证
   */
  checkCertificationPassed(cert) {
    const standard = this.standards[cert.certName];
    if (!standard) return false;

    // 检查所有要求是否达到
    const requirements = standard.requirements;
    const exams = cert.exams;

    return Object.entries(requirements).every(([req, minScore]) => {
      const examType = this.mapRequirementToExam(req);
      return exams[examType]?.completed && exams[examType].score >= minScore;
    }) && cert.totalScore >= 80;
  }

  /**
   * 映射要求到考试类型
   */
  mapRequirementToExam(requirement) {
    const mapping = {
      '理论考试': 'theory',
      '实践考试': 'practice',
      '项目实践': 'project'
    };
    return mapping[requirement] || 'theory';
  }

  /**
   * 生成证书
   */
  generateCertificate(cert) {
    return {
      id: `certificate-${Date.now()}`,
      name: cert.name,
      certName: cert.certName,
      level: this.standards[cert.certName].level,
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2年有效期
      score: cert.totalScore,
      skills: this.standards[cert.certName].skills
    };
  }

  /**
   * 查看认证状态
   */
  viewCertificationStatus(certId) {
    const data = this.loadCertificates();
    const cert = data.certificates.find(c => c.id === certId);

    if (!cert) {
      throw new Error('认证申请不存在');
    }

    console.log(`\n🏆 认证状态: ${cert.name}`);
    console.log('='.repeat(40));
    console.log(`认证类型: ${cert.certName}`);
    console.log(`申请日期: ${new Date(cert.applyDate).toLocaleDateString()}`);
    console.log(`当前状态: ${cert.status}`);
    console.log(`总分: ${cert.totalScore.toFixed(1)}`);

    console.log('\n📝 考试详情:');
    Object.entries(cert.exams).forEach(([type, exam]) => {
      const status = exam.completed ? '已完成' : '未完成';
      const score = exam.completed ? exam.score : 'N/A';
      console.log(`  - ${type}: ${status} (${score}分)`);
    });

    if (cert.certificate) {
      console.log('\n🎉 证书信息:');
      console.log(`  证书ID: ${cert.certificate.id}`);
      console.log(`  颁发日期: ${new Date(cert.certificate.issueDate).toLocaleDateString()}`);
      console.log(`  有效期至: ${new Date(cert.certificate.expiryDate).toLocaleDateString()}`);
    }
  }

  /**
   * 生成认证报告
   */
  generateCertificationReport() {
    const data = this.loadCertificates();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalApplications: data.certificates.length,
        pending: data.certificates.filter(c => c.status === 'pending').length,
        passed: data.certificates.filter(c => c.status === 'passed').length,
        failed: data.certificates.filter(c => c.status === 'failed').length,
        averageScore: this.calculateAverageScore(data.certificates)
      },
      certificates: data.certificates.map(cert => ({
        name: cert.name,
        certName: cert.certName,
        status: cert.status,
        totalScore: cert.totalScore,
        applyDate: cert.applyDate
      })),
      recommendations: this.generateCertificationRecommendations(data)
    };

    const reportPath = path.join(this.certificationDir, 'certification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 认证报告已生成: ${reportPath}`);
    return report;
  }

  /**
   * 计算平均分数
   */
  calculateAverageScore(certificates) {
    const completedCerts = certificates.filter(c => c.totalScore > 0);
    if (completedCerts.length === 0) return 0;

    const totalScore = completedCerts.reduce((sum, cert) => sum + cert.totalScore, 0);
    return totalScore / completedCerts.length;
  }

  /**
   * 生成认证建议
   */
  generateCertificationRecommendations(data) {
    const recommendations = [];

    // 基于通过率的建议
    const passRate = data.certificates.filter(c => c.status === 'passed').length / data.certificates.length;
    if (passRate < 0.7) {
      recommendations.push({
        type: 'pass-rate',
        priority: 'high',
        message: '认证通过率较低，建议优化培训内容',
        action: '加强培训，调整考试难度'
      });
    }

    // 基于平均分数的建议
    const averageScore = this.calculateAverageScore(data.certificates);
    if (averageScore < 75) {
      recommendations.push({
        type: 'average-score',
        priority: 'medium',
        message: '平均分数较低，建议加强学习指导',
        action: '提供更多学习资源，增加辅导时间'
      });
    }

    return recommendations;
  }

  /**
   * 加载证书数据
   */
  loadCertificates() {
    if (!fs.existsSync(this.certificatesFile)) {
      this.initializeCertification();
    }
    return JSON.parse(fs.readFileSync(this.certificatesFile, 'utf8'));
  }

  /**
   * 保存证书数据
   */
  saveCertificates(data) {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.certificatesFile, JSON.stringify(data, null, 2));
  }
}

// 命令行接口
if (require.main === module) {
  const certification = new SkillCertification();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'init':
      certification.initializeCertification();
      break;

    case 'apply':
      if (args.length < 3) {
        console.error('❌ 请提供姓名、邮箱和认证类型');
        process.exit(1);
      }
      certification.applyForCertification(args[0], args[1], args[2]);
      break;

    case 'exam':
      if (args.length < 3) {
        console.error('❌ 请提供认证ID、考试类型和分数');
        process.exit(1);
      }
      certification.takeExam(args[0], args[1], parseInt(args[2]));
      break;

    case 'status':
      if (args.length < 1) {
        console.error('❌ 请提供认证ID');
        process.exit(1);
      }
      certification.viewCertificationStatus(args[0]);
      break;

    case 'report':
      certification.generateCertificationReport();
      break;

    default:
      console.log(`
🏆 技能认证系统使用说明:

用法: node scripts/skill-certification.js <command> [args]

命令:
  init                    初始化认证系统
  apply <name> <email> <certType>  申请认证
  exam <certId> <examType> <score>  参加考试
  status <certId>         查看认证状态
  report                  生成认证报告

认证类型:
  - 测试基础
  - React测试
  - 测试策略
  - 测试工具专家

考试类型:
  - theory (理论考试)
  - practice (实践考试)
  - project (项目实践)

示例:
  node scripts/skill-certification.js init
  node scripts/skill-certification.js apply "张三" "zhangsan@example.com" "测试基础"
  node scripts/skill-certification.js exam cert-123 theory 85
  node scripts/skill-certification.js status cert-123
      `);
  }
}

module.exports = SkillCertification;
