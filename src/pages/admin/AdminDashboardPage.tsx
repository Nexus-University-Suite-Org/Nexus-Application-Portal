import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Inbox } from "lucide-react";

interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  admitted: number;
  rejected: number;
  waitlisted: number;
  draft: number;
  monthlyTrend: Record<string, number>;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAdminAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/v1/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Applications", value: stats?.totalApplications || 0, icon: <FileText className="h-5 w-5" />, color: "text-blue-500" },
    { title: "Pending Review", value: stats?.pendingReview || 0, icon: <Clock className="h-5 w-5" />, color: "text-yellow-500" },
    { title: "Admitted", value: stats?.admitted || 0, icon: <CheckCircle className="h-5 w-5" />, color: "text-green-500" },
    { title: "Rejected", value: stats?.rejected || 0, icon: <XCircle className="h-5 w-5" />, color: "text-red-500" },
    { title: "Waitlisted", value: stats?.waitlisted || 0, icon: <AlertCircle className="h-5 w-5" />, color: "text-orange-500" },
    { title: "Drafts", value: stats?.draft || 0, icon: <Inbox className="h-5 w-5" />, color: "text-gray-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application portal</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <span className={card.color}>{card.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.monthlyTrend && Object.keys(stats.monthlyTrend).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.monthlyTrend).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${Math.min((count / Math.max(...Object.values(stats.monthlyTrend), 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboardPage;
