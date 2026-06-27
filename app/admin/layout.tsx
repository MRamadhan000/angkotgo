// app/admin/layout.tsx
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/TopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60 overflow-hidden">
        <Topbar />
        {children}
      </div>
    </div>
  );
}   