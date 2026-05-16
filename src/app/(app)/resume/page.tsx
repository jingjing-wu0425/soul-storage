'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Pencil, Plus, X, Check, Trash2 } from 'lucide-react';

// ─── Colors ───
const C = {
  accent: '#002FA7',
  accentSoft: 'rgba(0,47,167,0.07)',
};

// ─── Types ───
interface Entry {
  id: string;
  sectionId: string;
  sectionNum: string;
  sectionLabel: string;
  date: string;
  title: string;
  subtitle: string;
  tags: string;
  detail: string;
  pending?: boolean;
  placeholder?: boolean;
  order: number;
}

interface Section {
  id: string;
  num: string;
  label: string;
}

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

function Tag({ children }: { children: string }) {
  return <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full tracking-wider" style={{ backgroundColor: C.accentSoft, color: C.accent }}>{children}</span>;
}

// ─── Entry Card ───
function EntryCard({ entry, idx, startInEdit, onUpdate, onDelete }: { entry: Entry; idx: number; startInEdit?: boolean; onUpdate: (e: Entry) => Promise<void>; onDelete: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(!!startInEdit);
  const [draft, setDraft] = useState<Entry>(entry);

  const startEdit = () => { setDraft({ ...entry }); setEditing(true); };
  const save = async () => { await onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...entry }); setEditing(false); };

  const tags = entry.tags.split(',').map(t => t.trim()).filter(Boolean);

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
              <button onClick={async () => { await onDelete(); setEditing(false); }} className="w-7 h-7 flex items-center justify-center rounded-md text-[#E5E7EB] hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={14} /></button>
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
              <h3 className={`text-[18px] leading-snug transition-colors duration-200 ${open ? 'text-black' : 'text-black hover:text-[#002FA7]'}`} style={{ fontWeight: 400 }}>{entry.title}</h3>
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

const STATIC_SECTIONS: Section[] = [
  { id: 'education', num: '01', label: 'EDUCATION' },
  { id: 'projects', num: '02', label: 'PROJECTS' },
  { id: 'intern', num: '03', label: 'INTERNSHIP' },
  { id: 'growth', num: '04', label: 'GROWTH' },
  { id: 'org', num: '05', label: 'ORGANIZATION' },
];

// ─── Main ───
export default function ResumePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/experience').then(r => r.json()).then((data: Entry[]) => {
      setEntries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const allSections: (Section & { isOverall?: boolean })[] = [{ id: 'overall', num: '00', label: 'OVERALL', isOverall: true }, ...STATIC_SECTIONS];
  const section = allSections[activeIdx];
  const isOverall = activeIdx === 0;
  const sectionEntries = !isOverall ? entries.filter(e => e.sectionId === section.id) : [];

  const handleUpdate = async (updated: Entry) => {
    const res = await fetch(`/api/experience/${updated.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
    if (res.ok) { const saved = await res.json(); setEntries(prev => prev.map(e => e.id === saved.id ? saved : e)); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newEntry = {
      id: tempId,
      sectionId: section.id, sectionNum: section.num, sectionLabel: section.label,
      date: '', title: '', subtitle: '', tags: '', detail: '',
      pending: false, placeholder: false,
      order: sectionEntries.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, newEntry]);
    setNewEntryId(tempId);

    try {
      const res = await fetch('/api/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) });
      if (res.ok) {
        const saved = await res.json();
        setEntries(prev => prev.map(e => e.id === tempId ? saved : e));
        setNewEntryId(saved.id);
      }
    } catch { /* keep local entry if API fails */ }
  };

  const switchTo = useCallback((i: number) => setActiveIdx(i), []);

  return (
    <div className="min-h-screen bg-white">
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

      <div className="ml-48">
        <div className="mx-auto max-w-[960px] px-8 md:px-12">
          <div className="pt-6 pb-4">
            <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2 text-[#E5E7EB]">My Experience</motion.p>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="h-px bg-[#E5E7EB] origin-left" />
          </div>

          <div className="pb-10 min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div key={section.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
                {isOverall ? (
                  <div className="pt-8">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                      <h1 className="text-3xl md:text-5xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>京京</h1>
                      <p className="mt-4 text-[15px] tracking-wide text-[#666] leading-[1.8]">能驾驭 AI 的复合型架构师<span className="text-[#999]">（算法、产品、商业）</span></p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8 flex flex-wrap gap-6">
                      <div><span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Email</span><span className="text-[13px] text-black">jing@example.com</span></div>
                      <div><span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Location</span><span className="text-[13px] text-black">Hangzhou, CN</span></div>
                      <div><span className="text-[9px] font-mono tracking-[0.3em] uppercase block text-[#999] mb-1.5">Status</span><span className="text-[13px] text-black italic">爵士乐循环中</span></div>
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
                      {loading ? (
                        <p className="text-[13px] text-[#999] py-8">Loading...</p>
                      ) : sectionEntries.map((entry, ei) => (
                        <EntryCard key={entry.id} entry={entry} idx={ei}
                          startInEdit={entry.id === newEntryId}
                          onUpdate={async (e) => { await handleUpdate(e); if (entry.id === newEntryId) setNewEntryId(null); }}
                          onDelete={async () => { await handleDelete(entry.id); if (entry.id === newEntryId) setNewEntryId(null); }}
                        />
                      ))}
                      <button onClick={handleAdd}
                        className="group flex items-center gap-2 py-3 text-[11px] font-mono text-[#E5E7EB] hover:text-[#002FA7] transition-colors cursor-pointer">
                        <span className="w-5 h-5 rounded-full border border-dashed border-[#E5E7EB] group-hover:border-[#002FA7] flex items-center justify-center transition-colors"><Plus size={10} /></span>
                        添加条目
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pb-6 flex items-center justify-between">
            <button onClick={() => activeIdx > 0 && switchTo(activeIdx - 1)} disabled={activeIdx === 0}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]">
              ← {activeIdx > 0 ? allSections[activeIdx - 1].label : ''}
            </button>
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-widest">{String(activeIdx + 1).padStart(2, '0')} / {String(allSections.length).padStart(2, '0')}</span>
            <button onClick={() => activeIdx < allSections.length - 1 && switchTo(activeIdx + 1)} disabled={activeIdx === allSections.length - 1}
              className="text-[10px] font-mono tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:cursor-default text-[#E5E7EB] hover:text-[#002FA7]">
              {activeIdx < allSections.length - 1 ? allSections[activeIdx + 1].label : ''} →
            </button>
          </div>

          <Reveal className="pb-6">
            <div className="h-px bg-[#F0F0F0] mb-4" />
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#E5E7EB]">
              <span>2026.05</span><span>Jing Jing</span>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
