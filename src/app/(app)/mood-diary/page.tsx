'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Plus, Pencil, Check, X, Trash2, ImagePlus } from 'lucide-react';

const C = {
  accent: '#002FA7',
  accentSoft: 'rgba(0,47,167,0.07)',
};

const CATEGORIES = ['ALL', '产品设计', '视觉设计', '文档'];

interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  tools: string;
  color: string;
  imageData: string | null;
  href: string;
  order: number;
}

function compressImage(file: File, maxW = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h = (h * maxW) / w; w = maxW; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Project Card ───
function ProjectCard({ project, idx, startInEdit, onUpdate, onDelete }: {
  project: Project; idx: number; startInEdit?: boolean;
  onUpdate: (p: Project) => Promise<void>; onDelete: () => Promise<void>;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(!!startInEdit);
  const [draft, setDraft] = useState<Project>(project);
  const fileRef = useRef<HTMLInputElement>(null);

  const startEdit = () => { setDraft({ ...project }); setEditing(true); };
  const save = async () => { await onUpdate(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...project }); setEditing(false); };
  const tools = project.tools.split(',').map(t => t.trim()).filter(Boolean);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await compressImage(file);
    setDraft({ ...draft, imageData: data });
  };

  if (editing) {
    return (
      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="group">
        <div className="rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#999]">编辑作品</span>
            <div className="flex items-center gap-1">
              <button onClick={save} className="w-7 h-7 flex items-center justify-center rounded-md text-[#002FA7] hover:bg-[rgba(0,47,167,0.07)] transition-colors cursor-pointer"><Check size={14} /></button>
              <button onClick={cancel} className="w-7 h-7 flex items-center justify-center rounded-md text-[#999] hover:bg-[#F5F5F5] transition-colors cursor-pointer"><X size={14} /></button>
              <button onClick={async () => { await onDelete(); setEditing(false); }} className="w-7 h-7 flex items-center justify-center rounded-md text-[#E5E7EB] hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"><Trash2 size={14} /></button>
            </div>
          </div>

          {/* Image upload */}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div onClick={() => fileRef.current?.click()}
            className="relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer border border-dashed border-[#E5E7EB] hover:border-[#002FA7] transition-colors"
            style={draft.imageData ? {} : { backgroundColor: draft.color }}>
            {draft.imageData ? (
              <img src={draft.imageData} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
                <ImagePlus size={28} />
                <span className="text-[11px] font-mono">点击上传图片</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="标题 *"
              className="col-span-2 text-[15px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0]" />
            <input value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="副标题"
              className="col-span-2 text-[13px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666]" />
            <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}
              className="text-[12px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666]">
              {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} placeholder="年份"
              className="text-[12px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666]" />
            <input value={draft.tools} onChange={e => setDraft({ ...draft, tools: e.target.value })} placeholder="工具（逗号分隔）"
              className="col-span-2 text-[12px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666]" />
            <input value={draft.href} onChange={e => setDraft({ ...draft, href: e.target.value })} placeholder="链接（可选，如 /dashboard）"
              className="col-span-2 text-[12px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666]" />
            <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} rows={3} placeholder="描述"
              className="col-span-2 text-[12px] bg-white rounded px-3 py-2 outline-none focus:ring-1 focus:ring-[#002FA7]/30 border border-[#F0F0F0] text-[#666] leading-[1.8] resize-none" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.25, 0.1, 0.25, 1] }} className="group/card">
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        className="relative overflow-hidden rounded-lg bg-[#FAFAFA] border border-[#F0F0F0] hover:border-[#E5E7EB] transition-all duration-300">

        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden" style={!project.imageData ? { backgroundColor: project.color } : undefined}>
          {project.imageData ? (
            <motion.img animate={hovered ? { scale: 1.05 } : { scale: 1 }} transition={{ duration: 0.4 }}
              src={project.imageData} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <motion.div animate={hovered ? { scale: 1.05 } : { scale: 1 }} transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-[80px] font-mono font-extralight select-none">{String(idx + 1).padStart(2, '0')}</span>
            </motion.div>
          )}

          {/* Hover overlay */}
          <motion.div initial={{ opacity: 0 }} animate={hovered ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
            {project.href && (
              <a href={project.href} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[11px] font-mono tracking-wider rounded-full hover:bg-[#002FA7] hover:text-white transition-colors">
                查看详情 <ArrowUpRight size={12} />
              </a>
            )}
            <button onClick={startEdit} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[11px] font-mono tracking-wider rounded-full hover:bg-[#002FA7] hover:text-white transition-colors cursor-pointer">
              <Pencil size={12} /> 编辑
            </button>
          </motion.div>

          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-mono px-2.5 py-1 rounded-full tracking-wider bg-white/90 text-[#666] backdrop-blur-sm">{project.category}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-[15px] text-black tracking-wide" style={{ fontWeight: 500 }}>{project.title}</h3>
              <p className="text-[12px] text-[#999] mt-1 tracking-wide">{project.subtitle}</p>
            </div>
            <span className="text-[10px] font-mono text-[#E5E7EB] tracking-wider shrink-0 pt-1">{project.year}</span>
          </div>
          <p className="text-[12px] text-[#666] leading-[1.8] mt-3 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tools.map(tool => (
              <span key={tool} className="text-[9px] font-mono px-2 py-0.5 rounded-full tracking-wider" style={{ backgroundColor: C.accentSoft, color: C.accent }}>{tool}</span>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then((data: Project[]) => {
      setProjects(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'ALL' ? projects : projects.filter(p => p.category === activeCategory);

  const handleUpdate = async (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (!updated.id.startsWith('temp-')) {
      try { await fetch(`/api/portfolio/${updated.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }); } catch {}
    }
  };

  const handleDelete = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (!id.startsWith('temp-')) {
      try { await fetch(`/api/portfolio/${id}`, { method: 'DELETE' }); } catch {}
    }
  };

  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newProject: Project = {
      id: tempId, title: '', subtitle: '', category: '产品设计', year: '',
      description: '', tools: '', color: '#002FA7', imageData: null, href: '',
      order: projects.length,
    };
    setProjects(prev => [...prev, newProject]);
    setNewId(tempId);

    try {
      const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProject) });
      if (res.ok) {
        const saved = await res.json();
        setProjects(prev => prev.map(p => p.id === tempId ? saved : p));
        setNewId(saved.id);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-[8vw]">
        <div className="pt-6 pb-4">
          <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2 text-[#E5E7EB]">Portfolio</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <h1 className="text-2xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>作品集</h1>
            <p className="mt-1.5 text-[13px] tracking-wide text-[#666]">产品设计 · 视觉设计 · 文档</p>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="h-px bg-[#E5E7EB] mt-4 origin-left" />
        </div>

        <div className="flex items-center gap-1 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[11px] font-mono tracking-wider rounded-full transition-all duration-200 cursor-pointer ${activeCategory === cat ? 'bg-[#002FA7] text-white' : 'text-[#999] hover:text-[#002FA7] hover:bg-[rgba(0,47,167,0.05)]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="pb-10">
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} idx={i}
                  startInEdit={project.id === newId}
                  onUpdate={async (p) => { await handleUpdate(p); if (project.id === newId) setNewId(null); }}
                  onDelete={async () => { await handleDelete(project.id); if (project.id === newId) setNewId(null); }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="py-12 text-center">
              <p className="text-[13px] text-[#999]">该分类下暂无作品</p>
            </div>
          )}
        </div>

        <div className="pb-4">
          <button onClick={handleAdd}
            className="group flex items-center gap-2 py-3 text-[11px] font-mono text-[#E5E7EB] hover:text-[#002FA7] transition-colors cursor-pointer">
            <span className="w-5 h-5 rounded-full border border-dashed border-[#E5E7EB] group-hover:border-[#002FA7] flex items-center justify-center transition-colors"><Plus size={10} /></span>
            添加作品
          </button>
        </div>

        <div className="pb-6">
          <div className="h-px bg-[#F0F0F0] mb-4" />
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#E5E7EB]">
            <span>2026.05</span><span>Jing Jing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
