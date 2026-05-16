import { getCurrentUser } from "@/lib/auth";
import { EntryGrid } from "@/components/entry/entry-grid";
import { InlineEditor } from "@/components/editor/inline-editor";

async function getEntries(userId: string) {
  try {
    const { prisma } = await import("@/lib/db");
    return await prisma.entry.findMany({
      where: { userId },
      orderBy: { entryDate: "desc" },
      include: { images: { orderBy: { order: "asc" } } },
    });
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const entries = user ? await getEntries(user.sub) : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[var(--font-serif)] text-2xl text-text-primary">
            输出
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {entries.length} 个生命切片
          </p>
        </div>
      </div>

      {/* Inline editor */}
      <div className="mb-8">
        <InlineEditor />
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-text-secondary/60 text-sm">
            还没有记录，在上方开始书写
          </p>
        </div>
      ) : (
        <EntryGrid entries={entries} />
      )}
    </div>
  );
}
