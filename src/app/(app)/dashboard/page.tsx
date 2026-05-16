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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1440px] px-[8vw]">

        {/* Header */}
        <div className="pt-6 pb-4">
          <p className="text-[10px] font-mono tracking-[0.4em] uppercase mb-2 text-[#E5E7EB]">
            Output
          </p>
          <h1 className="text-2xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>
            输出
          </h1>
          <p className="mt-1.5 text-[13px] tracking-wide text-[#666]">
            {entries.length} 个生命切片
          </p>
          <div className="h-px bg-[#E5E7EB] mt-4" />
        </div>

        {/* Inline editor */}
        <div className="mb-6">
          <InlineEditor />
        </div>

        {/* Entries */}
        <div className="pb-10">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[13px] text-[#999]">还没有记录，在上方开始书写</p>
            </div>
          ) : (
            <EntryGrid entries={entries} />
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
