import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Image,
  HelpCircle,
  Users,
  Handshake,
  Award,
  BookOpen,
  GraduationCap,
  Link2,
  FileText,
  LayoutList,
  Mail,
  MessageSquare,
  Bell,
  Megaphone,
  UserCog,
  Activity,
  CreditCard,
  CalendarClock,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: "Content Management",
    items: [
      { label: "News Articles", path: "/admin/news", icon: <Newspaper size={18} /> },
      { label: "Events", path: "/admin/events", icon: <Calendar size={18} /> },
      { label: "Gallery", path: "/admin/gallery", icon: <Image size={18} /> },
      { label: "FAQs", path: "/admin/faqs", icon: <HelpCircle size={18} /> },
      { label: "Alumni", path: "/admin/alumni", icon: <Users size={18} /> },
      { label: "Partners", path: "/admin/partners", icon: <Handshake size={18} /> },
      { label: "Scholarships", path: "/admin/scholarships", icon: <Award size={18} /> },
      { label: "Student Stories", path: "/admin/student-stories", icon: <BookOpen size={18} /> },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Courses", path: "/admin/courses", icon: <GraduationCap size={18} /> },
      { label: "Faculty", path: "/admin/faculty", icon: <Users size={18} /> },
    ],
  },
  {
    title: "Admissions",
    items: [
      { label: "Schemes", path: "/admin/schemes", icon: <CalendarClock size={18} /> },
      { label: "Applications", path: "/admin/applications", icon: <FileText size={18} /> },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Fee Assignments", path: "/admin/fees", icon: <CreditCard size={18} /> },
    ],
  },
  {
    title: "Communications",
    items: [
      { label: "Contacts", path: "/admin/contacts", icon: <Mail size={18} /> },
      { label: "Partnerships", path: "/admin/partnerships", icon: <Handshake size={18} /> },
      { label: "Newsletter", path: "/admin/newsletter", icon: <Megaphone size={18} /> },
      { label: "Notifications", path: "/admin/notifications", icon: <Bell size={18} /> },
      { label: "Announcements", path: "/admin/announcements", icon: <Megaphone size={18} /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Admin Users", path: "/admin/users", icon: <UserCog size={18} /> },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: <Activity size={18} /> },
      { label: "Quick Links", path: "/admin/quick-links", icon: <Link2 size={18} /> },
      { label: "Legal Pages", path: "/admin/legal-pages", icon: <FileText size={18} /> },
      { label: "Page Sections", path: "/admin/page-sections", icon: <LayoutList size={18} /> },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/admin/dashboard" className="font-heading text-xl font-semibold">
            Nexus Admin
          </Link>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto sidebar-scroll">
          <nav className="p-4 space-y-6">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground">
              {user?.fullName || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
