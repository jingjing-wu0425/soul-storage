'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';

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

// ─── Data ───

interface Entry {
  id: string;
  date: string;
  dateLink?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  detail: React.ReactNode;
  pending?: boolean;
  placeholder?: boolean;
}

interface Section {
  id: string;
  num: string;
  label: string;
  entries: Entry[];
}

const SECTIONS: Section[] = [
  {
    id: 'education', num: '01', label: 'EDUCATION',
    entries: [
      {
        id: 'zju', date: '2025.09 – 2029.06', title: '浙江大学', subtitle: '工商管理 · 本科',
        tags: ['SPSS', '哲学思辨'],
        detail: (
          <div className="space-y-5 pl-5 border-l border-[#E5E7EB]">
            <div>
              <span className="text-[14px] text-black tracking-wide">管理统计</span>
              <p className="text-[13px] text-[#666] leading-[1.8] mt-1.5">因子分析实战 — 通过降维理解多变量潜在结构，将直觉判断转化为可量化决策依据。</p>
            </div>
            <div>
              <span className="text-[14px] text-black tracking-wide">哲学思辨</span>
              <p className="text-[13px] text-[#666] leading-[1.8] mt-1.5">马克思主义与孔子思想在 AI 时代应用 — 异化理论解释 AI 替代劳动双重性，"仁"作为 AI 伦理底层框架。</p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'projects', num: '02', label: 'PROJECTS',
    entries: [
      {
        id: 'advisor', date: '2026.03', dateLink: '/mood-diary/2026/3',
        title: 'AdvisorFlow', subtitle: '导师发现与学术外联系统',
        tags: ['递归搜索', 'AI 驱动权重'],
        detail: (
          <div className="pl-5 border-l border-[#E5E7EB]">
            <p className="font-mono text-[13px] text-[#666] leading-[1.8]">
              多源信息检索 <span className="text-[#002FA7] mx-1">→</span> 自动候选池生成 <span className="text-[#002FA7] mx-1">→</span> AI 加权分发
            </p>
            <p className="font-mono text-[12px] text-[#999] leading-[1.8] mt-2">用户画像匹配 → 导师推荐排序 → 外联信生成</p>
          </div>
        ),
      },
      {
        id: 'agent', date: '2026.04', title: 'AI Agent 开发实战',
        tags: ['Dify', '社群分析'],
        detail: (
          <div className="space-y-5 pl-5 border-l border-[#E5E7EB]">
            <div>
              <span className="text-[14px] text-black tracking-wide">校园兼职筛选 Agent</span>
              <p className="font-mono text-[12px] text-[#666] leading-[1.8] mt-1.5">信息采集 <span className="text-[#002FA7] mx-1">→</span> 条件过滤 <span className="text-[#002FA7] mx-1">→</span> 智能推荐排序</p>
            </div>
            <div>
              <span className="text-[14px] text-black tracking-wide">AI Talk 社群分析 Agent</span>
              <p className="font-mono text-[12px] text-[#666] leading-[1.8] mt-1.5">对话数据分析 <span className="text-[#002FA7] mx-1">→</span> 活跃度评分 <span className="text-[#002FA7] mx-1">→</span> 运营策略建议</p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'intern', num: '03', label: 'INTERNSHIP',
    entries: [
      {
        id: 'qiushichao', date: '2026', title: '求是潮产品研发中心', subtitle: '课程表 App · 选课插件',
        detail: (
          <div className="pl-5 border-l border-[#E5E7EB] space-y-2">
            <p className="text-[13px] text-[#666] leading-[1.8]">· 选课插件 — 基于学生反馈迭代搜索体验，优化课程冲突检测</p>
            <p className="text-[13px] text-[#666] leading-[1.8]">· 课程表 App — 用户调研驱动 UI 简化，减少核心操作路径点击次数</p>
          </div>
        ),
      },
      {
        id: 'pm', date: '2026 summer →', title: '产品经理 · 职业路径', tags: ['PM'],
        detail: (
          <div className="pl-5 border-l border-[#E5E7EB]">
            <p className="font-mono text-[13px] text-[#666] leading-[1.8]">大一暑假 <span className="text-[#002FA7] mx-1">→</span> 中厂 PM <span className="text-[#002FA7] mx-1">→</span> 大二深化产品能力 <span className="text-[#002FA7] mx-1">→</span> 大三大厂 PM</p>
          </div>
        ),
      },
      {
        id: 'pm-target', date: '2028', title: '大厂 PM', subtitle: '目标占位', placeholder: true,
        detail: <p className="text-[13px] text-[#E5E7EB] leading-[1.8] italic">目标节点 — 待实现</p>,
      },
    ],
  },
  {
    id: 'growth', num: '04', label: 'GROWTH',
    entries: [
      {
        id: 'xiaohongshu', date: '2026.04', dateLink: '/mood-diary/2026/4',
        title: '小红书增长实验', tags: ['自媒体', '数据驱动'],
        detail: (
          <div className="space-y-7 pl-5 border-l border-[#E5E7EB]">
            <div className="flex gap-16">
              <div>
                <span className="text-5xl font-mono font-extralight tracking-tighter leading-none text-[#002FA7]">300+</span>
                <p className="text-[10px] text-[#999] mt-2 tracking-wider font-mono">20 天涨粉</p>
              </div>
              <div>
                <span className="text-5xl font-mono font-extralight tracking-tighter leading-none text-[#002FA7]">5w+</span>
                <p className="text-[10px] text-[#999] mt-2 tracking-wider font-mono">累计播放量</p>
              </div>
            </div>
            <div>
              <span className="text-[9px] tracking-[0.3em] uppercase block mb-2 font-mono text-[#999]">增长模型</span>
              <p className="font-mono text-[12px] text-[#666] leading-[2]">选题定位 <span className="text-[#002FA7] mx-1">→</span> 内容生产 <span className="text-[#002FA7] mx-1">→</span> A/B 封面测试 <span className="text-[#002FA7] mx-1">→</span> 发布节奏优化 <span className="text-[#002FA7] mx-1">→</span> 数据反馈</p>
            </div>
            <p className="text-[13px] text-[#999] italic tracking-wide">内容更新倒逼成长</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'org', num: '05', label: 'ORGANIZATION',
    entries: [
      {
        id: 'qiushichao-org', date: '2026', title: '求是潮产品研发中心', subtitle: '用户调研与产品维护',
        detail: <div className="pl-5 border-l border-[#E5E7EB]"><p className="text-[13px] text-[#666] leading-[1.8]">选课插件与课程表 App 的用户调研与迭代维护。</p></div>,
      },
      {
        id: 'ambassador', date: '2026', title: '校园大使', subtitle: '扣子空间 · Second Me',
        detail: <div className="pl-5 border-l border-[#E5E7EB]"><p className="text-[13px] text-[#666] leading-[1.8]">品牌传播与社区运营 — 连接产品团队与校园用户，收集反馈驱动产品迭代。</p></div>,
      },
      {
        id: 'kab', date: '2026', title: 'KAB 创业社', subtitle: '创业课程参与及实战训练', pending: true,
        detail: (
          <div className="space-y-3 pl-5 border-l border-[#E5E7EB]">
            <p className="text-[13px] text-[#666] leading-[1.8]">创业课程参与及实战训练</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#002FA7] animate-pulse" />
              <span className="text-[11px] font-mono text-[#999]">Processing... 创业实战项目方案撰写中</span>
            </div>
          </div>
        ),
      },
    ],
  },
];

// ─── Shared reveal ───

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Tag ───

function Tag({ children }: { children: string }) {
  return <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full tracking-wider" style={{ backgroundColor: C.accentSoft, color: C.accent }}>{children}</span>;
}

// ─── Entry card ───

function EntryCard({ entry, idx }: { entry: Entry; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={idx * 0.06}>
      <div className="flex gap-6 mb-10">
        {/* Date */}
        <div className="w-28 shrink-0 text-right pt-0.5">
          {entry.dateLink ? (
            <Link href={entry.dateLink} className="text-[12px] font-mono text-[#002FA7]/60 hover:text-[#002FA7] transition-colors">{entry.date}</Link>
          ) : (
            <span className={`text-[12px] font-mono ${entry.placeholder ? 'italic text-[#E5E7EB]' : 'text-[#999]'}`}>{entry.date}</span>
          )}
        </div>
        {/* Dot */}
        <div className="flex flex-col items-center w-3 shrink-0">
          <button
            onClick={() => !entry.placeholder && setOpen(o => !o)}
            disabled={entry.placeholder}
            className="mt-1"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${open ? 'bg-[#002FA7] border-[#002FA7]' : entry.pending ? 'border-[#002FA7] bg-[#002FA7]/10' : 'border-[#E5E7EB]'}`}
            />
          </button>
          <div className="flex-1 w-px bg-[#F0F0F0]" />
        </div>
        {/* Content */}
        <div className={`flex-1 pl-6 ${entry.placeholder ? 'opacity-25' : ''}`}>
          <button onClick={() => !entry.placeholder && setOpen(o => !o)} disabled={entry.placeholder} className="w-full text-left">
            <h3 className={`text-[18px] leading-snug transition-colors duration-200 ${open ? 'text-black' : 'text-black hover:text-[#002FA7]'}`} style={{ fontWeight: 400 }}>
              {entry.title}
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
              {entry.subtitle && !entry.placeholder && <span className="text-[13px] text-[#666] tracking-wide">{entry.subtitle}</span>}
              {entry.tags?.map(t => <Tag key={t}>{t}</Tag>)}
              {entry.pending && <span className="flex items-center gap-1.5 text-[10px] text-[#999]"><span className="w-1.5 h-1.5 rounded-full bg-[#002FA7] animate-pulse" />Processing</span>}
            </div>
          </button>
          <AnimatePresence>
            {open && !entry.placeholder && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="pt-4">{entry.detail}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Main ───

export default function ResumePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const switchTo = useCallback((i: number) => {
    setActiveIdx(i);
  }, []);

  const section = SECTIONS[activeIdx];

  return (
    <div className="min-h-screen bg-white">

      {/* ━━ Left sidebar nav ━━ */}
      <div className="fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-[#F0F0F0] z-50 flex flex-col">
        <div className="flex-1" />
        <div className="px-6 pb-10 space-y-1">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchTo(i)}
              className={`flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-md text-[11px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${i === activeIdx ? 'bg-[rgba(0,47,167,0.07)] text-[#002FA7]' : 'text-[#E5E7EB] hover:text-[#999]'}`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === activeIdx ? 'bg-[#002FA7] scale-150' : 'bg-[#E5E7EB]'}`} />
              {s.label}
            </button>
          ))}
          <div className="pt-6 pl-3">
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-wider">2026.05</span>
          </div>
        </div>
      </div>

      {/* ━━ Main content ━━ */}
      <div className="ml-48">
        <div className="mx-auto max-w-[960px] px-8 md:px-12">

          {/* Header */}
          <div className="pt-28 pb-12">
            <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[11px] font-mono tracking-[0.5em] uppercase mb-6 text-[#E5E7EB]">
              My Experience
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>京京</h1>
              <p className="mt-3 text-[14px] leading-[1.8] tracking-wide text-[#666]">
                能驾驭 AI 的复合型架构师<span className="text-[#999]">（算法、产品、商业）</span>
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#999]">
                <span>jing@example.com</span>
                <span className="text-[#E5E7EB]">·</span>
                <span>Hangzhou, CN</span>
                <span className="text-[#E5E7EB]">·</span>
                <span className="italic">爵士乐循环中</span>
              </div>
            </motion.div>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="h-px bg-[#E5E7EB] mt-10 origin-left" />
          </div>

          {/* Sections - show one at a time */}
          <div className="pb-20 min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Section header */}
                <div className="grid grid-cols-[1fr_4fr] gap-x-8 mb-10">
                  <div className="flex flex-col items-end pt-1">
                    <span className="text-[80px] md:text-[110px] font-mono font-extralight leading-none select-none text-[#F0F0F0] -mr-3">{section.num}</span>
                    <span className="text-[10px] font-mono tracking-[0.4em] uppercase mt-4 text-[#E5E7EB]" style={{ writingMode: 'vertical-rl' }}>{section.label}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-[#E5E7EB] tracking-[0.4em] uppercase">{section.label}</span>
                    <div className="w-10 h-px bg-[#E5E7EB] mt-2" />
                  </div>
                </div>

                {/* Entries */}
                <div className="ml-[20%]">
                  {section.entries.map((entry, ei) => (
                    <EntryCard key={entry.id} entry={entry} idx={ei} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom prev/next */}
          <div className="pb-14 flex items-center justify-between">
            <button
              onClick={() => activeIdx > 0 && switchTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]"
            >
              ← {activeIdx > 0 ? SECTIONS[activeIdx - 1].label : ''}
            </button>
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-widest">
              {String(activeIdx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}
            </span>
            <button
              onClick={() => activeIdx < SECTIONS.length - 1 && switchTo(activeIdx + 1)}
              disabled={activeIdx === SECTIONS.length - 1}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]"
            >
              {activeIdx < SECTIONS.length - 1 ? SECTIONS[activeIdx + 1].label : ''} →
            </button>
          </div>

          {/* Footer */}
          <Reveal className="pb-14">
            <div className="h-px bg-[#F0F0F0] mb-6" />
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#E5E7EB]">
              <span>2026.05</span>
              <span>Jing Jing</span>
            </div>
          </Reveal>

        </div>
      </div>
    </div>
  );
}
