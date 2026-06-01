import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart2, Settings, FileText, LogOut, Store,
  Layers, Image, Tag
} from "lucide-react";

const NAV = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products",   icon: Package,         label: "Products" },
  { href: "/admin/categories", icon: Tag,             label: "Categories" },
  { href: "/admin/orders",     icon: ShoppingBag,     label: "Orders" },
  { href: "/admin/customers",  icon: Users,           label: "Customers" },
  { href: "/admin/pages",      icon: FileText,        label: "Pages" },
  { href: "/admin/cms",        icon: Layers,          label: "Theme Customizer" },
  { href: "/admin/media",      icon: Image,           label: "Media" },
  { href: "/admin/settings",   icon: Settings,        label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") redirect("/auth");

  return (
    <div className="min-h-screen flex" style={{ background: "#f5f5f5" }}>
      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col fixed top-0 left-0 h-screen z-30"
        style={{ background: "#efefef", borderRight: "1px solid #e5e5e5" }}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F6B3B] flex items-center justify-center shadow-sm">
              <Store size={16} strokeWidth={1.75} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-800 leading-none">Vivasaya</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-gray-600 text-[13px] font-medium hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all duration-250 ease-in-out group"
            >
              <Icon size={18} strokeWidth={1.75} className="text-gray-400 group-hover:text-[#1F6B3B] group-hover:scale-105 transition-all duration-250 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#e5e5e5] space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-gray-500 text-[13px] font-medium hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-250 ease-in-out group"
          >
            <LogOut size={18} strokeWidth={1.75} className="text-gray-400 group-hover:text-red-500 group-hover:scale-105 transition-all duration-250 shrink-0" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-[240px] min-h-screen">
        <div className="p-6 md:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
