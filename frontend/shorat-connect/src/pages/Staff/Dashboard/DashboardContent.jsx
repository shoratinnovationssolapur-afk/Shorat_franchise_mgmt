import { Building2, Users, GraduationCap, CreditCard, TrendingUp, Award } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import React, { useEffect, useState } from "react";
import { getApi } from "@/utils/api";

export const DashboardContent = ({ userRole, branch }) => {
  const api = getApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentStats, setStudentStats] = useState({ total_students: 0, active_students: 0, inactive_students: 0, total_fees_paid: 0 });
  const [batchesCount, setBatchesCount] = useState(0);
  const [eventsCounts, setEventsCounts] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, batchesRes, eventsRes, notificationsRes] = await Promise.all([
        api.get("students/stats/"),
        api.get("batches/"),
        api.get("events/"),
        api.get("notifications/?page_size=5").catch(() => ({ data: [] })),
      ]);

      const s = studentsRes.data || {};
      setStudentStats({
        total_students: s.total_students || 0,
        active_students: s.active_students || 0,
        inactive_students: s.inactive_students || 0,
        total_fees_paid: s.total_fees_paid || 0,
      });

      const batches = Array.isArray(batchesRes.data) ? batchesRes.data : batchesRes.data?.results || [];
      setBatchesCount(batches.length);

      const events = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.results || [];
      setEventsCounts({
        total: events.length,
        upcoming: events.filter((e) => e.status === "Upcoming").length,
        completed: events.filter((e) => e.status === "Completed").length,
      });

      const notifs = Array.isArray(notificationsRes.data) ? notificationsRes.data : notificationsRes.data?.results || [];
      const mappedActivities = notifs.map((n) => ({
        action: n.title || n.message || "Notification",
        time: new Date(n.created_at || Date.now()).toLocaleString(),
        status: n.priority || "info",
      }));
      setRecentActivities(mappedActivities);

      setError(null);
    } catch (err) {
      console.error("Dashboard load failed", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-red-600 text-white p-6 rounded-lg shadow-medium h-30 mt-24">
        <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
        <p className="text-white/80 mt-1">
          Here's what's happening with your franchise network today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-20">
        <StatsCard title="Total Students" value={studentStats.total_students} icon={GraduationCap} color="success" />
        <StatsCard title="Active Students" value={studentStats.active_students} icon={Users} color="info" />
        <StatsCard title="Inactive Students" value={studentStats.inactive_students} icon={Users} color="primary" />
        <StatsCard title="Active Batches" value={batchesCount} icon={Users} color="info" />
        <StatsCard title="Upcoming Events" value={eventsCounts.upcoming} icon={Building2} color="warning" />
        <StatsCard title="Completed Events" value={eventsCounts.completed} icon={Building2} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                          ? "secondary"
                          : "outline"
                      }
                      className="w-2 h-2 p-0 rounded-full"
                    />
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Top Performing Franchises (Admin only) */}
        {userRole === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Franchises</CardTitle>
              <CardDescription>Based on student enrollment and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingFranchises.map((franchise, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{franchise.name}</span>
                      <Badge variant="outline">{franchise.completion}%</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{franchise.students} students</span>
                      <span>{franchise.revenue}</span>
                    </div>
                    <Progress value={franchise.completion} className="h-2" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Franchises
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
