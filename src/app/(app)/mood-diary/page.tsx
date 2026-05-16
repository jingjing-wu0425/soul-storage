'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// ─── Colors ───
const C = {
  bg: '#FFFFFF',
  black: '#000000',
  secondary: '#666666',
  faint: '#999999',
  line: '#E5E7EB',
  lineLight: '#F0F0F0',
  accent: '#002FA7',
  accentSoft: 'rgba(0,47,167,0.07)',
};

// ─── Types ───
interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  tools: string[];
  color: string;
  href?: string;
}

// ─── Data ───
const CATEGORIES = ['ALL', '产品设计', '视觉设计', '文档'];

const PROJECTS: Project[] = [
  {
    id: 'soul-storage',
    title: 'The Soul Storage',
    subtitle: '个人网站 · 全栈开发',
    category: '产品设计',
    year: '2026',
    description: '基于生命切片理念的个人数字空间。Next.js + Prisma + Framer Motion，暗色主题与极简交互。',
    tools: ['Next.js', 'Tailwind', 'Prisma'],
    color: '#002FA7',
    href: '/dashboard',
  },
  {
    id: 'course-plugin',
    title: '选课插件',
    subtitle: '求是潮 · 产品设计',
    category: '产品设计',
    year: '2026',
    description: '基于学生反馈迭代搜索体验，优化课程冲突检测与筛选流程，减少核心操作路径点击次数。',
    tools: ['Figma', '用户调研'],
    color: '#1a1a2e',
  },
  {
    id: 'schedule-app',
    title: '课程表 App',
    subtitle: '求是潮 · 移动端设计',
    category: '产品设计',
    year: '2026',
    description: '用户调研驱动 UI 简化，从信息架构层面重构课表展示，实现一键导入与智能提醒。',
    tools: ['Figma', 'React Native'],
    color: '#16213e',
  },
  {
    id: 'advisor-flow',
    title: 'AdvisorFlow',
    subtitle: '导师发现系统 · 界面设计',
    category: '产品设计',
    year: '2026',
    description: '多源信息检索的可视化界面设计，递归搜索结果的多层级呈现，AI 加权推荐的交互反馈。',
    tools: ['Figma', '原型设计'],
    color: '#0f3460',
    href: '/resume',
  },
  {
    id: 'poster-system',
    title: '情绪海报系统',
    subtitle: '可视化交互 · 组件设计',
    category: '视觉设计',
    year: '2026',
    description: '可拖拽画布 + 多模态编辑的海报生成系统，支持手绘、贴纸、文字叠加与自由裁剪。',
    tools: ['Framer Motion', 'Canvas API'],
    color: '#533483',
    href: '/mood-diary/2026/5',
  },
  {
    id: 'xiaohongshu',
    title: '小红书内容矩阵',
    subtitle: '自媒体运营 · 视觉体系',
    category: '视觉设计',
    year: '2026',
    description: '20 天涨粉 300+，累计播放 5w+。建立统一视觉识别系统，A/B 测试封面策略。',
    tools: ['Canva', '数据驱动'],
    color: '#e94560',
  },
];

// ─── Project Card ───
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="group"
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-lg bg-[#FAFAFA] border border-[#F0F0F0] hover:border-[#E5E7EB] transition-all duration-300"
      >
        {/* Thumbnail */}
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{ backgroundColor: project.color }}
        >
          <motion.div
            animate={hovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-white/20 text-[80px] font-mono font-extralight select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={hovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            {project.href ? (
              <a
                href={project.href}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[11px] font-mono tracking-wider rounded-full hover:bg-[#002FA7] hover:text-white transition-colors"
              >
                查看详情 <ArrowUpRight size={12} />
              </a>
            ) : (
              <span className="flex items-center gap-2 px-5 py-2.5 bg-white/90 text-[#999] text-[11px] font-mono tracking-wider rounded-full">
                敬请期待
              </span>
            )}
          </motion.div>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-mono px-2.5 py-1 rounded-full tracking-wider bg-white/90 text-[#666] backdrop-blur-sm">
              {project.category}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-[15px] text-black tracking-wide" style={{ fontWeight: 500 }}>
                {project.title}
              </h3>
              <p className="text-[12px] text-[#999] mt-1 tracking-wide">{project.subtitle}</p>
            </div>
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-wider shrink-0 pt-1">
              {project.year}
            </span>
          </div>
          <p className="text-[12px] text-[#666] leading-[1.8] mt-3 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="text-[9px] font-mono px-2 py-0.5 rounded-full tracking-wider"
                style={{ backgroundColor: C.accentSoft, color: C.accent }}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ───
export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filtered = activeCategory === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-[8vw]">

        {/* Header */}
        <div className="pt-6 pb-4">
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2 text-[#E5E7EB]"
          >
            Portfolio
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>
              作品集
            </h1>
            <p className="mt-1.5 text-[13px] tracking-wide text-[#666]">
              产品设计 · 视觉设计 · 文档
            </p>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-px bg-[#E5E7EB] mt-4 origin-left"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[11px] font-mono tracking-wider rounded-full transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#002FA7] text-white'
                  : 'text-[#999] hover:text-[#002FA7] hover:bg-[rgba(0,47,167,0.05)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="pb-10">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[13px] text-[#999]">该分类下暂无作品</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pb-6">
          <div className="h-px bg-[#F0F0F0] mb-4" />
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#E5E7EB]">
            <span>2026.05</span>
            <span>Jing Jing</span>
          </div>
        </div>

      </div>
    </div>
  );
}
