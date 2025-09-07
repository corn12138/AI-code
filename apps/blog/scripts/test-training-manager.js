#!/usr/bin/env node

/**
 * 测试培训管理脚本
 * 用于管理团队测试培训流程和进度
 */

const fs = require('fs');
const path = require('path');

class TestTrainingManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.trainingDir = path.join(this.projectRoot, 'docs', 'training');
    this.progressFile = path.join(this.trainingDir, 'training-progress.json');
    this.materials = {
      basic: [
        '测试基础概念',
        'React组件测试',
        '测试驱动开发',
        '测试覆盖率'
      ],
      advanced: [
        '测试策略设计',
        'Mock和Stub技术',
        '集成测试',
        'E2E测试'
      ],
      tools: [
        '测试工具使用',
        '性能监控',
        '自动化测试',
        'CI/CD集成'
      ]
    };
  }

  /**
   * 初始化培训环境
   */
  initializeTraining() {
    console.log('🎓 初始化测试培训环境...');

    // 创建培训目录
    if (!fs.existsSync(this.trainingDir)) {
      fs.mkdirSync(this.trainingDir, { recursive: true });
    }

    // 创建培训进度文件
    if (!fs.existsSync(this.progressFile)) {
      const initialProgress = {
        participants: [],
        modules: this.generateModules(),
        assessments: [],
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.progressFile, JSON.stringify(initialProgress, null, 2));
    }

    // 创建培训材料
    this.createTrainingMaterials();

    console.log('✅ 培训环境初始化完成');
  }

  /**
   * 生成培训模块
   */
  generateModules() {
    const modules = [];

    // 基础模块
    this.materials.basic.forEach((topic, index) => {
      modules.push({
        id: `basic-${index + 1}`,
        name: topic,
        level: 'basic',
        duration: 2, // 小时
        status: 'pending',
        completedBy: [],
        materials: this.generateMaterials(topic, 'basic')
      });
    });

    // 高级模块
    this.materials.advanced.forEach((topic, index) => {
      modules.push({
        id: `advanced-${index + 1}`,
        name: topic,
        level: 'advanced',
        duration: 3, // 小时
        status: 'pending',
        completedBy: [],
        materials: this.generateMaterials(topic, 'advanced')
      });
    });

    // 工具模块
    this.materials.tools.forEach((topic, index) => {
      modules.push({
        id: `tools-${index + 1}`,
        name: topic,
        level: 'tools',
        duration: 2, // 小时
        status: 'pending',
        completedBy: [],
        materials: this.generateMaterials(topic, 'tools')
      });
    });

    return modules;
  }

  /**
   * 生成培训材料
   */
  generateMaterials(topic, level) {
    const materials = {
      documents: [
        `${topic}-guide.md`,
        `${topic}-examples.md`,
        `${topic}-exercises.md`
      ],
      videos: [
        `${topic}-introduction.mp4`,
        `${topic}-hands-on.mp4`
      ],
      exercises: [
        `${topic}-practice.tsx`,
        `${topic}-assignment.md`
      ]
    };

    return materials;
  }

  /**
   * 创建培训材料
   */
  createTrainingMaterials() {
    console.log('📚 创建培训材料...');

    const materialsDir = path.join(this.trainingDir, 'materials');
    if (!fs.existsSync(materialsDir)) {
      fs.mkdirSync(materialsDir, { recursive: true });
    }

    // 创建基础培训材料
    this.createBasicMaterials(materialsDir);

    // 创建高级培训材料
    this.createAdvancedMaterials(materialsDir);

    // 创建工具培训材料
    this.createToolsMaterials(materialsDir);

    console.log('✅ 培训材料创建完成');
  }

  /**
   * 创建基础培训材料
   */
  createBasicMaterials(materialsDir) {
    const basicDir = path.join(materialsDir, 'basic');
    if (!fs.existsSync(basicDir)) {
      fs.mkdirSync(basicDir, { recursive: true });
    }

    // 测试基础概念指南
    const basicGuide = `# 测试基础概念

## 概述
本模块介绍软件测试的基本概念和原理。

## 学习目标
- 理解测试的类型和分类
- 掌握测试金字塔理论
- 了解测试驱动开发(TDD)
- 理解测试覆盖率概念

## 内容大纲
1. 测试类型和分类
2. 测试金字塔理论
3. 测试驱动开发基础
4. 测试覆盖率概念

## 实践练习
- 编写简单的单元测试
- 使用测试框架(Vitest)
- 理解测试覆盖率报告

## 考核标准
- 能够编写基本的单元测试
- 理解测试覆盖率报告
- 掌握测试命名规范
`;

    fs.writeFileSync(path.join(basicDir, '测试基础概念-guide.md'), basicGuide);
  }

  /**
   * 创建高级培训材料
   */
  createAdvancedMaterials(materialsDir) {
    const advancedDir = path.join(materialsDir, 'advanced');
    if (!fs.existsSync(advancedDir)) {
      fs.mkdirSync(advancedDir, { recursive: true });
    }

    // 测试策略设计指南
    const strategyGuide = `# 测试策略设计

## 概述
本模块介绍如何设计有效的测试策略。

## 学习目标
- 掌握测试策略设计方法
- 了解测试数据管理
- 掌握Mock和Stub技术
- 理解测试环境配置

## 内容大纲
1. 测试策略设计
2. 测试数据管理
3. Mock和Stub技术
4. 测试环境配置

## 实践练习
- 设计测试策略
- 创建测试工具
- 优化测试性能

## 考核标准
- 能够设计测试策略
- 掌握Mock技术
- 优化测试执行
`;

    fs.writeFileSync(path.join(advancedDir, '测试策略设计-guide.md'), strategyGuide);
  }

  /**
   * 创建工具培训材料
   */
  createToolsMaterials(materialsDir) {
    const toolsDir = path.join(materialsDir, 'tools');
    if (!fs.existsSync(toolsDir)) {
      fs.mkdirSync(toolsDir, { recursive: true });
    }

    // 测试工具使用指南
    const toolsGuide = `# 测试工具使用

## 概述
本模块介绍项目中使用的各种测试工具。

## 学习目标
- 熟练使用测试监控工具
- 掌握覆盖率分析工具
- 了解性能测试工具
- 学会生成测试报告

## 内容大纲
1. 测试监控工具
2. 覆盖率分析工具
3. 性能测试工具
4. 测试报告生成

## 实践练习
- 使用测试监控工具
- 分析测试趋势
- 生成测试报告

## 考核标准
- 熟练使用测试工具
- 能够分析测试数据
- 生成有效报告
`;

    fs.writeFileSync(path.join(toolsDir, '测试工具使用-guide.md'), toolsGuide);
  }

  /**
   * 添加培训参与者
   */
  addParticipant(name, email, role = 'developer') {
    const progress = this.loadProgress();

    const participant = {
      id: `participant-${Date.now()}`,
      name,
      email,
      role,
      joinDate: new Date().toISOString(),
      progress: {
        completedModules: [],
        currentModule: null,
        totalHours: 0,
        score: 0
      },
      assessments: []
    };

    progress.participants.push(participant);
    this.saveProgress(progress);

    console.log(`✅ 已添加培训参与者: ${name}`);
    return participant;
  }

  /**
   * 开始模块培训
   */
  startModule(participantId, moduleId) {
    const progress = this.loadProgress();

    const participant = progress.participants.find(p => p.id === participantId);
    const module = progress.modules.find(m => m.id === moduleId);

    if (!participant) {
      throw new Error('参与者不存在');
    }

    if (!module) {
      throw new Error('模块不存在');
    }

    participant.progress.currentModule = moduleId;
    module.status = 'in-progress';

    this.saveProgress(progress);

    console.log(`🎯 ${participant.name} 开始学习模块: ${module.name}`);
  }

  /**
   * 完成模块培训
   */
  completeModule(participantId, moduleId, score = 0) {
    const progress = this.loadProgress();

    const participant = progress.participants.find(p => p.id === participantId);
    const module = progress.modules.find(m => m.id === moduleId);

    if (!participant || !module) {
      throw new Error('参与者或模块不存在');
    }

    // 更新参与者进度
    if (!participant.progress.completedModules.includes(moduleId)) {
      participant.progress.completedModules.push(moduleId);
      participant.progress.totalHours += module.duration;
      participant.progress.score = Math.max(participant.progress.score, score);
    }

    // 更新模块状态
    if (!module.completedBy.includes(participantId)) {
      module.completedBy.push(participantId);
    }

    // 检查模块是否所有人都完成了
    if (module.completedBy.length === progress.participants.length) {
      module.status = 'completed';
    }

    participant.progress.currentModule = null;

    this.saveProgress(progress);

    console.log(`✅ ${participant.name} 完成模块: ${module.name} (得分: ${score})`);
  }

  /**
   * 添加评估
   */
  addAssessment(participantId, moduleId, assessment) {
    const progress = this.loadProgress();

    const participant = progress.participants.find(p => p.id === participantId);

    if (!participant) {
      throw new Error('参与者不存在');
    }

    const assessmentRecord = {
      id: `assessment-${Date.now()}`,
      participantId,
      moduleId,
      ...assessment,
      date: new Date().toISOString()
    };

    participant.assessments.push(assessmentRecord);
    progress.assessments.push(assessmentRecord);

    this.saveProgress(progress);

    console.log(`📝 已添加评估记录: ${assessmentRecord.id}`);
    return assessmentRecord;
  }

  /**
   * 生成培训报告
   */
  generateTrainingReport() {
    const progress = this.loadProgress();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalParticipants: progress.participants.length,
        totalModules: progress.modules.length,
        completedModules: progress.modules.filter(m => m.status === 'completed').length,
        averageScore: this.calculateAverageScore(progress.participants),
        totalTrainingHours: progress.participants.reduce((sum, p) => sum + p.progress.totalHours, 0)
      },
      participants: progress.participants.map(p => ({
        name: p.name,
        role: p.role,
        completedModules: p.progress.completedModules.length,
        totalHours: p.progress.totalHours,
        score: p.progress.score,
        currentModule: p.progress.currentModule
      })),
      modules: progress.modules.map(m => ({
        name: m.name,
        level: m.level,
        status: m.status,
        completedBy: m.completedBy.length,
        totalParticipants: progress.participants.length
      })),
      recommendations: this.generateRecommendations(progress)
    };

    const reportPath = path.join(this.trainingDir, 'training-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 培训报告已生成: ${reportPath}`);
    return report;
  }

  /**
   * 计算平均分数
   */
  calculateAverageScore(participants) {
    const scores = participants.map(p => p.progress.score).filter(s => s > 0);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * 生成建议
   */
  generateRecommendations(progress) {
    const recommendations = [];

    // 基于完成情况的建议
    const completionRate = progress.modules.filter(m => m.status === 'completed').length / progress.modules.length;
    if (completionRate < 0.5) {
      recommendations.push({
        type: 'completion',
        priority: 'high',
        message: '模块完成率较低，建议加强培训督促',
        action: '增加培训频率，设置里程碑检查'
      });
    }

    // 基于分数的建议
    const averageScore = this.calculateAverageScore(progress.participants);
    if (averageScore < 70) {
      recommendations.push({
        type: 'score',
        priority: 'medium',
        message: '平均分数较低，建议加强学习指导',
        action: '提供更多练习材料，增加一对一指导'
      });
    }

    // 基于参与度的建议
    const activeParticipants = progress.participants.filter(p => p.progress.completedModules.length > 0).length;
    if (activeParticipants < progress.participants.length * 0.8) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: '参与度不够，建议提高培训吸引力',
        action: '优化培训内容，增加互动环节'
      });
    }

    return recommendations;
  }

  /**
   * 加载进度
   */
  loadProgress() {
    if (!fs.existsSync(this.progressFile)) {
      this.initializeTraining();
    }
    return JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
  }

  /**
   * 保存进度
   */
  saveProgress(progress) {
    progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
  }

  /**
   * 显示培训状态
   */
  showTrainingStatus() {
    const progress = this.loadProgress();

    console.log('\n🎓 测试培训状态报告');
    console.log('='.repeat(50));

    console.log(`📊 总体统计:`);
    console.log(`  - 参与者数量: ${progress.participants.length}`);
    console.log(`  - 模块总数: ${progress.modules.length}`);
    console.log(`  - 已完成模块: ${progress.modules.filter(m => m.status === 'completed').length}`);
    console.log(`  - 平均分数: ${this.calculateAverageScore(progress.participants).toFixed(1)}`);

    console.log(`\n👥 参与者进度:`);
    progress.participants.forEach(p => {
      const completedCount = p.progress.completedModules.length;
      const totalCount = progress.modules.length;
      const percentage = ((completedCount / totalCount) * 100).toFixed(1);
      console.log(`  - ${p.name} (${p.role}): ${completedCount}/${totalCount} (${percentage}%)`);
    });

    console.log(`\n📚 模块状态:`);
    progress.modules.forEach(m => {
      const completedCount = m.completedBy.length;
      const totalCount = progress.participants.length;
      const percentage = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;
      console.log(`  - ${m.name} (${m.level}): ${completedCount}/${totalCount} (${percentage}%) - ${m.status}`);
    });
  }
}

// 命令行接口
if (require.main === module) {
  const manager = new TestTrainingManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'init':
      manager.initializeTraining();
      break;

    case 'add-participant':
      if (args.length < 2) {
        console.error('❌ 请提供姓名和邮箱');
        process.exit(1);
      }
      manager.addParticipant(args[0], args[1], args[2]);
      break;

    case 'start-module':
      if (args.length < 2) {
        console.error('❌ 请提供参与者ID和模块ID');
        process.exit(1);
      }
      manager.startModule(args[0], args[1]);
      break;

    case 'complete-module':
      if (args.length < 2) {
        console.error('❌ 请提供参与者ID和模块ID');
        process.exit(1);
      }
      const score = args[2] ? parseInt(args[2]) : 0;
      manager.completeModule(args[0], args[1], score);
      break;

    case 'add-assessment':
      if (args.length < 3) {
        console.error('❌ 请提供参与者ID、模块ID和评估内容');
        process.exit(1);
      }
      const assessment = {
        type: args[3] || 'quiz',
        score: parseInt(args[4]) || 0,
        feedback: args[5] || ''
      };
      manager.addAssessment(args[0], args[1], assessment);
      break;

    case 'report':
      manager.generateTrainingReport();
      break;

    case 'status':
      manager.showTrainingStatus();
      break;

    default:
      console.log(`
🎓 测试培训管理工具使用说明:

用法: node scripts/test-training-manager.js <command> [args]

命令:
  init                    初始化培训环境
  add-participant <name> <email> [role]  添加培训参与者
  start-module <participantId> <moduleId>  开始模块培训
  complete-module <participantId> <moduleId> [score]  完成模块培训
  add-assessment <participantId> <moduleId> <type> [score] [feedback]  添加评估
  report                  生成培训报告
  status                  显示培训状态

示例:
  node scripts/test-training-manager.js init
  node scripts/test-training-manager.js add-participant "张三" "zhangsan@example.com" "developer"
  node scripts/test-training-manager.js start-module participant-123 basic-1
  node scripts/test-training-manager.js complete-module participant-123 basic-1 85
      `);
  }
}

module.exports = TestTrainingManager;
