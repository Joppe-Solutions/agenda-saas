import { Sidebar, DashboardHeader } from "@/components/dashboard/layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-6xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
