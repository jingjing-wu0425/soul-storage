'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS_CN = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function MoodDiaryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-bg-page/90 backdrop-blur-md border-b border-border-light/30">
        <div className="max-w-3xl mx-auto px-6 h-10 flex items-center justify-between">
          <span className="text-[9px] tracking-[0.5em] uppercase text-text-secondary">Mood Diary</span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-text-faint hover:text-text-heading transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-[10px] tracking-[0.4em] uppercase text-text-faint mb-1">{year}</div>
            <div className="text-lg tracking-[0.15em] text-text-heading font-light">{MONTHS_CN[month - 1]}</div>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-text-faint hover:text-text-heading transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border-light/60">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="bg-bg-page py-2 text-center text-[8px] tracking-[0.2em] text-text-faint uppercase">{d}</div>
          ))}
          {cells.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`bg-bg-page aspect-square flex items-center justify-center
                ${day && isCurrentMonth && day === today ? 'bg-bg-surface/60' : ''}
                ${!day ? 'bg-bg-page' : ''}`}
            >
              {day && (
                <span className={`text-[11px] font-light
                  ${isCurrentMonth && day === today ? 'text-text-heading font-normal' : 'text-text-faint'}`}>
                  {day}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Enter month button */}
        <div className="mt-12 flex justify-center">
          <Link
            href={`/mood-diary/${year}/${month}`}
            className="group flex flex-col items-center gap-3 px-8 py-6 border border-border-light/50 hover:border-border/70 hover:bg-bg-surface/40 transition-all"
          >
            <div className="w-10 h-10 rounded-full border border-border-light/60 text-text-faint/70 flex items-center justify-center group-hover:border-border group-hover:text-text-secondary transition-all">
              <span className="text-lg font-light">+</span>
            </div>
            <span className="text-[9px] tracking-[0.3em] uppercase text-text-faint group-hover:text-text-body transition-colors">
              进入 {year}.{String(month).padStart(2, '0')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
