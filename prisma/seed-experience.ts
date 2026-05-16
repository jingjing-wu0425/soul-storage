import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.experienceEntry.deleteMany();

  const entries = [
    // 01 EDUCATION
    { sectionId: "education", sectionNum: "01", sectionLabel: "EDUCATION", date: "2025.09 – 2029.06", title: "浙江大学", subtitle: "工商管理 · 本科", tags: "SPSS, 哲学思辨", detail: "管理统计 — 因子分析实战，通过降维理解多变量潜在结构，将直觉判断转化为可量化决策依据。\n哲学思辨 — 马克思主义与孔子思想在 AI 时代应用，异化理论解释 AI 替代劳动双重性，“仁”作为 AI 伦理底层框架。", order: 0 },
    // 02 PROJECTS
    { sectionId: "projects", sectionNum: "02", sectionLabel: "PROJECTS", date: "2026.03", title: "AdvisorFlow", subtitle: "导师发现与学术外联系统", tags: "递归搜索, AI 驱动权重", detail: "多源信息检索 → 自动候选池生成 → AI 加权分发\n用户画像匹配 → 导师推荐排序 → 外联信生成", order: 0 },
    { sectionId: "projects", sectionNum: "02", sectionLabel: "PROJECTS", date: "2026.04", title: "AI Agent 开发实战", subtitle: "", tags: "Dify, 社群分析", detail: "校园兼职筛选 Agent — 信息采集 → 条件过滤 → 智能推荐排序\nAI Talk 社群分析 Agent — 对话数据分析 → 活跃度评分 → 运营策略建议", order: 1 },
    // 03 INTERNSHIP
    { sectionId: "intern", sectionNum: "03", sectionLabel: "INTERNSHIP", date: "2026", title: "求是潮产品研发中心", subtitle: "课程表 App · 选课插件", tags: "", detail: "· 选课插件 — 基于学生反馈迭代搜索体验，优化课程冲突检测\n· 课程表 App — 用户调研驱动 UI 简化，减少核心操作路径点击次数", order: 0 },
    { sectionId: "intern", sectionNum: "03", sectionLabel: "INTERNSHIP", date: "2026 summer →", title: "产品经理 · 职业路径", subtitle: "", tags: "PM", detail: "大一暑假 → 中厂 PM → 大二深化产品能力 → 大三大厂 PM", order: 1 },
    { sectionId: "intern", sectionNum: "03", sectionLabel: "INTERNSHIP", date: "2028", title: "大厂 PM", subtitle: "目标占位", tags: "", detail: "目标节点 — 待实现", placeholder: true, order: 2 },
    // 04 GROWTH
    { sectionId: "growth", sectionNum: "04", sectionLabel: "GROWTH", date: "2026.04", title: "小红书增长实验", subtitle: "", tags: "自媒体, 数据驱动", detail: "20 天涨粉 300+，累计播放 5w+\n增长模型：选题定位 → 内容生产 → A/B 封面测试 → 发布节奏优化 → 数据反馈\n内容更新倒逼成长", order: 0 },
    // 05 ORGANIZATION
    { sectionId: "org", sectionNum: "05", sectionLabel: "ORGANIZATION", date: "2026", title: "求是潮产品研发中心", subtitle: "用户调研与产品维护", tags: "", detail: "选课插件与课程表 App 的用户调研与迭代维护。", order: 0 },
    { sectionId: "org", sectionNum: "05", sectionLabel: "ORGANIZATION", date: "2026", title: "校园大使", subtitle: "扣子空间 · Second Me", tags: "", detail: "品牌传播与社区运营 — 连接产品团队与校园用户，收集反馈驱动产品迭代。", order: 1 },
    { sectionId: "org", sectionNum: "05", sectionLabel: "ORGANIZATION", date: "2026", title: "KAB 创业社", subtitle: "创业课程参与及实战训练", tags: "", detail: "创业课程参与及实战训练\nProcessing... 创业实战项目方案撰写中", pending: true, order: 2 },
  ];

  for (const entry of entries) {
    await prisma.experienceEntry.create({ data: entry });
  }

  console.log(`Seeded ${entries.length} experience entries`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
