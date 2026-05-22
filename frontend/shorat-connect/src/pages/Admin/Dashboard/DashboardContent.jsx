import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./StatsCard";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;
 // Centralized API base URL

export const DashboardContent = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchFranchises = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/franchise/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Franchises API response:", res.data);
        setFranchises(res.data.results || res.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err.response || err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          alert("Unauthorized! Please login again.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFranchises();
  }, [token, navigate]);

  if (loading) return <p className="p-6">Loading franchises...</p>;

  const totalFranchises = franchises.length;
  const activeFranchises = franchises.filter(f => f.status?.toLowerCase() === "active").length;
  const inactiveFranchises = franchises.filter(f => f.status?.toLowerCase() === "inactive").length;

  const recentActivities = franchises
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-red-600 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold">
          Welcome back! <span className="ml-2">👋</span>
        </h2>
        <p className="text-sm">
          Here's what's happening with your franchise network today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Total Franchises" value={totalFranchises} icon={Building2} badge="F" color="primary" />
        <StatsCard title="Active Franchises" value={activeFranchises} icon={Users} badge="A" color="success" />
        <StatsCard title="Inactive Franchises" value={inactiveFranchises} icon={Users} badge="I" color="destructive" />
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your franchise network</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {recentActivities.length > 0 ? (
                recentActivities.map(f => (
                  <li key={f.id}>
                    🟢 <strong>{f.name}</strong> — Status: {f.status || "Unknown"}
                  </li>
                ))
              ) : (
                <li>No recent activities available.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate("/admin/reports")}>
              View Reports
            </Button>
            <Button variant="outline">Generate Certificate</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
