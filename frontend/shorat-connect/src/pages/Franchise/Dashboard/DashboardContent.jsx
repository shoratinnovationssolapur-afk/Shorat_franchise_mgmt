import { useState, useEffect } from "react";
import { Users, GraduationCap, ClipboardList } from "lucide-react";
import { StatsCard } from "./StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getApi } from "@/utils/api"; // custom axios instance

// ✅ Use environment variable instead of hard-coded URL
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export default function DashboardContent() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const api = getApi(); // ✅ use the configured axios instance
        const headers = { Authorization: `Bearer ${token}` };

        const [resStudents, resStaff, resBatches] = await Promise.all([
          api.get(`${API_BASE}/students/`, { headers }),
          api.get(`${API_BASE}/staff/`, { headers }),
          api.get(`${API_BASE}/batches/`, { headers }),
        ]);

        setStudents(resStudents.data);
        setStaff(resStaff.data);
        setBatches(resBatches.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (loading) return <p className="p-6 text-center">Loading data...</p>;

  const stats = [
    { title: "Students", value: students.length, icon: GraduationCap },
    { title: "Staff Members", value: staff.length, icon: Users },
    { title: "Batches", value: batches.length, icon: ClipboardList },
  ];

  return (
    <div className="pt-10 space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-red-600  text-white p-6 rounded-lg shadow-md text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-bold">Welcome back! 👋</h2>
        <p className="text-sm opacity-90">
          Here's what's happening with your franchise today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Staff & Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>
              Staff working under your franchise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {staff.length > 0 ? (
                staff.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span>
                      {s.name} - {s.role}
                    </span>
                    <Badge
                      className={
                        s.status === "Active"
                          ? "bg-green-500 text-white"
                          : "bg-gray-400 text-white"
                      }
                    >
                      {s.status}
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 py-2 text-center">
                  No staff available
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Batches */}
        <Card>
          <CardHeader>
            <CardTitle>Batches</CardTitle>
            <CardDescription>Ongoing batches with students</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <li
                    key={batch.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span>{batch.name}</span>
                    <Badge className="bg-green-500 text-white">
                      {batch.students} Students
                    </Badge>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 py-2 text-center">
                  No batches available
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
