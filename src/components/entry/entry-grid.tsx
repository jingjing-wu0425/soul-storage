"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EntryCard } from "./entry-card";
import type { Entry } from "@/types";

interface EntryGridProps {
  entries: Entry[];
}

export function EntryGrid({ entries }: EntryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
        >
          <Link href={`/entry/${entry.id}`}>
            <EntryCard entry={entry} featured={i === 0} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
