import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

export const metadata = {
  title: 'Admin Panel - DataMatch',
  description: 'DataMatch System Admin Panel',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 bg-slate-100">
        <div className="p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4">
            <SidebarTrigger className="lg:hidden" />
          </div>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
