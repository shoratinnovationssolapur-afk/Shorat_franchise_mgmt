import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getApi } from "@/utils/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function StaffReports() {
  const api = getApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("students/stats/");
        setStats(res.data || {});
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const t = setInterval(fetchStats, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <p className="p-4">Loading reports...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.total_students ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Students</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.active_students ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inactive Students</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{stats.inactive_students ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Fees Paid</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">₹{Number(stats.total_fees_paid || 0).toLocaleString()}</CardContent>
        </Card>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active vs Inactive</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: stats.active_students || 0 },
                    { name: "Inactive", value: stats.inactive_students || 0 },
                  ]}
                  nameKey="name"
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { label: "Total", value: stats.total_students || 0 },
                  { label: "Active", value: stats.active_students || 0 },
                  { label: "Inactive", value: stats.inactive_students || 0 },
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
