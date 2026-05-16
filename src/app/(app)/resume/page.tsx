'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Pencil, Plus, X, Check, Trash2 } from 'lucide-react';

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

interface Entry {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  tags: string;
  detail: string;
  pending?: boolean;
  placeholder?: boolean;
}

interface Section {
  id: string;
  num: string;
  label: string;
  entries: Entry[];
}

// ─── Initial data ───

const OVERALL_SECTION: Section = {
  id: 'overall', num: '00', label: 'OVERALL', entries: [],
};

const INITIAL_SECTIONS: Section[] = [
  {
    id: 'education', num: '01', label: 'EDUCATION',
    entries: [
      { id: 'zju', date: '2025.09 – 2029.06', title: '浙江大学', subtitle: '工商管理 · 本科', tags: 'SPSS, 哲学思辨', detail: '管理统计 — 因子分析实战，通过降维理解多变量潜在结构，将直觉判断转化为可量化决策依据。\n哲学思辨 — 马克思主义与孔子思想在 AI 时代应用，异化理论解释 AI 替代劳动双重性，"仁"作为 AI 伦理底层框架。' },
    ],
  },
  {
    id: 'projects', num: '02', label: 'PROJECTS',
    entries: [
      { id: 'advisor', date: '2026.03', title: 'AdvisorFlow', subtitle: '导师发现与学术外联系统', tags: '递归搜索, AI 驱动权重', detail: '多源信息检索 → 自动候选池生成 → AI 加权分发\n用户画像匹配 → 导师推荐排序 → 外联信生成' },
      { id: 'agent', date: '2026.04', title: 'AI Agent 开发实战', subtitle: '', tags: 'Dify, 社群分析', detail: '校园兼职筛选 Agent — 信息采集 → 条件过滤 → 智能推荐排序\nAI Talk 社群分析 Agent — 对话数据分析 → 活跃度评分 → 运营策略建议' },
    ],
  },
  {
    id: 'intern', num: '03', label: 'INTERNSHIP',
    entries: [
      { id: 'qiushichao', date: '2026', title: '求是潮产品研发中心', subtitle: '课程表 App · 选课插件', tags: '', detail: '· 选课插件 — 基于学生反馈迭代搜索体验，优化课程冲突检测\n· 课程表 App — 用户调研驱动 UI 简化，减少核心操作路径点击次数' },
      { id: 'pm', date: '2026 summer →', title: '产品经理 · 职业路径', subtitle: '', tags: 'PM', detail: '大一暑假 → 中厂 PM → 大二深化产品能力 → 大三大厂 PM' },
      { id: 'pm-target', date: '2028', title: '大厂 PM', subtitle: '目标占位', tags: '', detail: '目标节点 — 待实现', placeholder: true },
    ],
  },
  {
    id: 'growth', num: '04', label: 'GROWTH',
    entries: [
      { id: 'xiaohongshu', date: '2026.04', title: '小红书增长实验', subtitle: '', tags: '自媒体, 数据驱动', detail: '20 天涨粉 300+，累计播放 5w+\n增长模型：选题定位 → 内容生产 → A/B 封面测试 → 发布节奏优化 → 数据反馈\n内容更新倒逼成长' },
    ],
  },
  {
    id: 'org', num: '05', label: 'ORGANIZATION',
    entries: [
      { id: 'qiushichao-org', date: '2026', title: '求是潮产品研发中心', subtitle: '用户调研与产品维护', tags: '', detail: '选课插件与课程表 App 的用户调研与迭代维护。' },
      { id: 'ambassador', date: '2026', title: '校园大使', subtitle: '扣子空间 · Second Me', tags: '', detail: '品牌传播与社区运营 — 连接产品团队与校园用户，收集反馈驱动产品迭代。' },
      { id: 'kab', date: '2026', title: 'KAB 创业社', subtitle: '创业课程参与及实战训练', tags: '', detail: '创业课程参与及实战训练\nProcessing... 创业实战项目方案撰写中', pending: true },
    ],
  },
];

// ─── Reveal ───

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

// ─── Editable Entry Card ───

function EntryCard({ entry, idx, onUpdate, onDelete }: { entry: Entry; idx: number; onUpdate: (id: string, e: Entry) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Entry>(entry);

  const startEdit = () => {
    setDraft({ ...entry });
    setEditing(true);
  };

  const save = () => {
    onUpdate(entry.id, { ...draft });
    setEditing(false);
  };

  const cancel = () => {
    setDraft({ ...entry });
    setEditing(false);
  };

  const tags = entry.tags.split(',').map(t => t.trim()).filter(Boolean);

  // ── Edit mode ──
  if (editing) {
    return (
      <div className="flex gap-6 mb-10">
        <div className="w-28 shrink-0 text-right pt-0.5">
          <input value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })}
            className="w-full text-right text-[12px] font-mono bg-[#F5F5F5] rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#002FA7]/30" />
        </div>
        <div className="flex flex-col items-center w-3 shrink-0">
          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-[#002FA7] border border-[#002FA7]" />
          <div className="flex-1 w-px bg-[#F0F0F0]" />
        </div>
        <div className="flex-1 pl-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
              className="flex-1 text-[16px] bg-[#F5F5F5] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#002FA7]/30" style={{ fontWeight: 400 }} />
            <div className="flex items-center gap-1 ml-3">
              <button onClick={save} className="w-7 h-7 flex items-center justify-center rounded-md text-[#002FA7] hover:bg-[rgba(0,47,167,0.07)] transition-colors cursor-pointer"><Check size={14} /></button>
              <button onClick={cancel} className="w-7 h-7 flex items-center justify-center rounded-md text-[#999] hover:bg-[#F5F5F5] transition-colors cursor-pointer"><X size={14} /></button>
              <button onClick={() => { onDelete(entry.id); setEditing(false); }} className="w-7 h-7 flex items-center justify-center rounded-md text-[#E5E7EB] hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={14} /></button>
            </div>
          </div>
          <input value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="副标题"
            className="w-full text-[13px] bg-[#F5F5F5] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#002FA7]/30 text-[#666]" />
          <input value={draft.tags} onChange={e => setDraft({ ...draft, tags: e.target.value })} placeholder="标签（逗号分隔）"
            className="w-full text-[12px] bg-[#F5F5F5] rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#002FA7]/30 text-[#666]" />
          <textarea value={draft.detail} onChange={e => setDraft({ ...draft, detail: e.target.value })} rows={4} placeholder="详细描述"
            className="w-full text-[12px] bg-[#F5F5F5] rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 text-[#666] leading-[1.8] resize-none" />
        </div>
      </div>
    );
  }

  // ── Display mode ──
  return (
    <Reveal delay={idx * 0.06}>
      <div className="group/entry flex gap-6 mb-10">
        <div className="w-28 shrink-0 text-right pt-0.5">
          <span className={`text-[12px] font-mono ${entry.placeholder ? 'italic text-[#E5E7EB]' : 'text-[#999]'}`}>{entry.date}</span>
        </div>
        <div className="flex flex-col items-center w-3 shrink-0">
          <button onClick={() => !entry.placeholder && setOpen(o => !o)} disabled={entry.placeholder} className="mt-1 cursor-pointer">
            <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${open ? 'bg-[#002FA7] border-[#002FA7]' : entry.pending ? 'border-[#002FA7] bg-[#002FA7]/10' : 'border-[#E5E7EB]'}`} />
          </button>
          <div className="flex-1 w-px bg-[#F0F0F0]" />
        </div>
        <div className={`flex-1 pl-6 ${entry.placeholder ? 'opacity-25' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => !entry.placeholder && setOpen(o => !o)} disabled={entry.placeholder} className="text-left flex-1 cursor-pointer">
              <h3 className={`text-[18px] leading-snug transition-colors duration-200 ${open ? 'text-black' : 'text-black hover:text-[#002FA7]'}`} style={{ fontWeight: 400 }}>
                {entry.title}
              </h3>
              <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
                {entry.subtitle && !entry.placeholder && <span className="text-[13px] text-[#666] tracking-wide">{entry.subtitle}</span>}
                {tags.map(t => <Tag key={t}>{t}</Tag>)}
                {entry.pending && <span className="flex items-center gap-1.5 text-[10px] text-[#999]"><span className="w-1.5 h-1.5 rounded-full bg-[#002FA7] animate-pulse" />Processing</span>}
              </div>
            </button>
            {!entry.placeholder && (
              <button onClick={startEdit} className="mt-1 w-6 h-6 flex items-center justify-center rounded text-[#E5E7EB] opacity-0 group-hover/entry:opacity-100 hover:text-[#002FA7] transition-all cursor-pointer">
                <Pencil size={12} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {open && !entry.placeholder && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="pt-4 pl-5 border-l border-[#E5E7EB]">
                  {entry.detail.split('\n').map((line, i) => (
                    <p key={i} className="text-[13px] text-[#666] leading-[1.8]">{line}</p>
                  ))}
                </div>
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
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const switchTo = useCallback((i: number) => setActiveIdx(i), []);

  const allSections = [OVERALL_SECTION, ...sections];
  const section = allSections[activeIdx];
  const isOverall = activeIdx === 0;

  const handleUpdateEntry = (sectionId: string, entryId: string, updated: Entry) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, entries: s.entries.map(e => e.id === entryId ? updated : e) } : s));
  };

  const handleDeleteEntry = (sectionId: string, entryId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, entries: s.entries.filter(e => e.id !== entryId) } : s));
  };

  const handleAddEntry = (sectionId: string) => {
    const id = `entry-${Date.now()}`;
    const newEntry: Entry = { id, date: '', title: '', subtitle: '', tags: '', detail: '' };
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, entries: [...s.entries, newEntry] } : s));
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ━━ Left sidebar nav ━━ */}
      <div className="fixed left-0 top-14 bottom-0 w-48 bg-white border-r border-[#F0F0F0] z-50 flex flex-col">
        <div className="flex-1" />
        <div className="px-6 pb-10 space-y-1">
          {allSections.map((s, i) => (
            <button key={s.id} onClick={() => switchTo(i)}
              className={`flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-md text-[11px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${i === activeIdx ? 'bg-[rgba(0,47,167,0.07)] text-[#002FA7]' : 'text-[#E5E7EB] hover:text-[#999]'}`}>
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

          {/* Minimal header */}
          <div className="pt-6 pb-4">
            <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2 text-[#E5E7EB]">
              My Experience
            </motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="h-px bg-[#E5E7EB] origin-left" />
          </div>

          {/* Content area */}
          <div className="pb-10 min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div key={section.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
                {isOverall ? (
                  <div className="pt-8">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                      <h1 className="text-3xl md:text-5xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>京京</h1>
                      <p className="mt-4 text-[15px] tracking-wide text-[#666] leading-[1.8]">
                        能驾驭 AI 的复合型架构师<span className="text-[#999]">（算法、产品、商业）</span>
                      </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8 flex flex-wrap gap-6">
                      <div>
                        <span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Email</span>
                        <span className="text-[13px] text-black">jing@example.com</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Location</span>
                        <span className="text-[13px] text-black">Hangzhou, CN</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Status</span>
                        <span className="text-[13px] text-black italic">爵士乐循环中</span>
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-10 pt-8 border-t border-[#F0F0F0]">
                      <p className="text-[13px] text-[#999] leading-[2] font-mono">浙江大学 · 工商管理 · 2025–2029</p>
                      <p className="text-[13px] text-[#999] leading-[2] font-mono mt-1">产品设计 / AI Agent / 自媒体增长</p>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_4fr] gap-x-8 mb-6">
                      <div className="flex flex-col items-end pt-1">
                        <span className="text-[60px] md:text-[80px] font-mono font-extralight leading-none select-none text-[#F0F0F0] -mr-3">{section.num}</span>
                        <span className="text-[10px] font-mono tracking-[0.4em] uppercase mt-4 text-[#E5E7EB]" style={{ writingMode: 'vertical-rl' }}>{section.label}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-[10px] font-mono text-[#E5E7EB] tracking-[0.4em] uppercase">{section.label}</span>
                        <div className="w-10 h-px bg-[#E5E7EB] mt-2" />
                      </div>
                    </div>
                    <div className="ml-[20%]">
                      {section.entries.map((entry, ei) => (
                        <EntryCard key={entry.id} entry={entry} idx={ei}
                          onUpdate={(id, e) => handleUpdateEntry(section.id, id, e)}
                          onDelete={(id) => handleDeleteEntry(section.id, id)}
                        />
                      ))}
                      {/* Add entry button */}
                      <button onClick={() => handleAddEntry(section.id)}
                        className="group flex items-center gap-2 py-3 text-[11px] font-mono text-[#E5E7EB] hover:text-[#002FA7] transition-colors cursor-pointer">
                        <span className="w-5 h-5 rounded-full border border-dashed border-[#E5E7EB] group-hover:border-[#002FA7] flex items-center justify-center transition-colors">
                          <Plus size={10} />
                        </span>
                        添加条目
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom prev/next */}
          <div className="pb-6 flex items-center justify-between">
            <button onClick={() => activeIdx > 0 && switchTo(activeIdx - 1)} disabled={activeIdx === 0}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]">
              ← {activeIdx > 0 ? allSections[activeIdx - 1].label : ''}
            </button>
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-widest">
              {String(activeIdx + 1).padStart(2, '0')} / {String(allSections.length).padStart(2, '0')}
            </span>
            <button onClick={() => activeIdx < allSections.length - 1 && switchTo(activeIdx + 1)} disabled={activeIdx === allSections.length - 1}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]">
              {activeIdx < allSections.length - 1 ? allSections[activeIdx + 1].label : ''} →
            </button>
          </div>

          {/* Footer */}
          <Reveal className="pb-6">
            <div className="h-px bg-[#F0F0F0] mb-4" />
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
