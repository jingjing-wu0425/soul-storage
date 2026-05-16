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
        <div className="pt-28 pb-12">
          <p className="text-[11px] font-mono tracking-[0.5em] uppercase mb-6 text-[#E5E7EB]">
            Output
          </p>
          <div>
            <h1 className="text-3xl md:text-4xl tracking-tight leading-none text-black" style={{ fontWeight: 500 }}>
              输出
            </h1>
            <p className="mt-3 text-[14px] leading-[1.8] tracking-wide text-[#666]">
              {entries.length} 个生命切片
            </p>
          </div>
          <div className="h-px bg-[#E5E7EB] mt-10" />
        </div>

        {/* Inline editor */}
        <div className="mb-10">
          <InlineEditor />
        </div>

        {/* Entries */}
        <div className="pb-20">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[13px] text-[#999]">还没有记录，在上方开始书写</p>
            </div>
          ) : (
            <EntryGrid entries={entries} />
          )}
        </div>

        {/* Footer */}
        <div className="pb-14">
          <div className="h-px bg-[#F0F0F0] mb-6" />
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#E5E7EB]">
            <span>2026.05</span>
            <span>Jing Jing</span>
          </div>
        </div>

      </div>
    </div>
  );
}
