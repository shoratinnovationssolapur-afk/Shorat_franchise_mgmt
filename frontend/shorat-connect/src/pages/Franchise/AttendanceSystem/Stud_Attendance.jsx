import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApi } from "@/utils/api";
import { CalendarDays, RotateCcw, Save } from "lucide-react";
import {
  attendanceMonths,
  attendanceYears,
  updateAttendanceMonth,
  updateAttendanceYear,
} from "./attendanceDate";

const today = () => new Date().toISOString().split("T")[0];

const statusClass = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-600 text-white";
    case "Absent":
      return "bg-red-600 text-white";
    case "Half Day":
      return "bg-yellow-500 text-white";
    case "Leave":
      return "bg-blue-600 text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(today());
  const [franchiseName, setFranchiseName] = useState("");
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const api = getApi();

  const deriveStatus = (inTime, outTime) => {
    if (!inTime && !outTime) return "Absent";
    if (!inTime || !outTime) return "Present";

    const start = new Date(`${date}T${inTime}`);
    const end = new Date(`${date}T${outTime}`);
    if (end <= start) return "Invalid";

    const hours = (end - start) / 3600000;
    if (hours >= 8) return "Present";
    if (hours >= 4) return "Half Day";
    return "Absent";
  };

  const deriveHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";
    const start = new Date(`${date}T${inTime}`);
    const end = new Date(`${date}T${outTime}`);
    if (end <= start) return "-";
    return `${((end - start) / 3600000).toFixed(2)} hrs`;
  };

  useEffect(() => {
    if (!token || role !== "franchise_head") return;

    const fetchFranchise = async () => {
      try {
        const res = await api.get("franchise/");
        const loggedInEmail = localStorage.getItem("email");
        const franchise = res.data.find(
          (f) => f.user_email?.toLowerCase() === loggedInEmail?.toLowerCase()
        );
        if (franchise) setFranchiseName(franchise.name);
      } catch (err) {
        console.error("Error fetching franchise:", err);
      }
    };

    fetchFranchise();
  }, [token, role, api]);

  useEffect(() => {
    if (role !== "franchise_head" || !franchiseName) return;

    const fetchStudents = async () => {
      try {
        const res = await api.get(`students/?branch=${franchiseName}`);
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [franchiseName, role, api]);

  useEffect(() => {
    if (role !== "franchise_head" || !franchiseName) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `attendance/student-attendance/?date=${date}&branch=${franchiseName}`
        );
        const data = Array.isArray(res.data) ? res.data : [];
        const mappedAttendance = {};

        data.forEach((a) => {
          mappedAttendance[a.student] = {
            status: a.status,
            inTime: a.in_time || "",
            outTime: a.out_time || "",
            saved: true,
          };
        });

        setAttendance(mappedAttendance);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [date, franchiseName, role, api]);

  const counts = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        const status = attendance[student.id]?.status || "Unmarked";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Present: 0, Absent: 0, "Half Day": 0, Leave: 0, Unmarked: 0 }
    );
  }, [attendance, students]);

  const handleTimeChange = (studentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        saved: false,
        status: undefined,
      },
    }));
  };

  const saveAttendance = async (studentId, overrideStatus = null) => {
    const studentAttendance = attendance[studentId] || {};
    const isManualStatus = overrideStatus === "Absent" || overrideStatus === "Leave";
    const inTime = isManualStatus ? "" : studentAttendance.inTime || "";
    const outTime = isManualStatus ? "" : studentAttendance.outTime || "";
    const status = overrideStatus || deriveStatus(inTime, outTime);

    if (status === "Invalid") {
      alert("Please enter a valid in/out time range.");
      return;
    }

    const record = {
      student: studentId,
      date,
      in_time: inTime || null,
      out_time: outTime || null,
      status,
      branch: franchiseName,
    };

    try {
      setSubmittingId(studentId);
      await api.post("attendance/student-attendance/", [record]);
      setAttendance((prev) => ({
        ...prev,
        [studentId]: {
          status,
          inTime,
          outTime,
          saved: true,
        },
      }));
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Error saving attendance: " + JSON.stringify(err.response?.data || err));
    } finally {
      setSubmittingId(null);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const month = new Date(date).getMonth() + 1;
      const res = await api.get(
        `attendance/student-monthly-summary/?month=${month}&branch=${franchiseName}`
      );
      setMonthlySummary(Array.isArray(res.data) ? res.data : []);
      setShowMonthlySummary(true);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
    }
  };

  if (role !== "franchise_head") {
    return (
      <div className="p-6 font-bold text-red-600">
        Unauthorized: Only franchise head can mark attendance
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              Student Attendance
            </div>
            <h2 className="mt-1 text-2xl font-bold">{franchiseName || "Branch"}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[160px_150px_100px_auto]">
            <Input
              type="date"
              value={date}
              min="2000-01-01"
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
            />
            <select
              value={date.split("-")[1]}
              onChange={(e) => setDate((current) => updateAttendanceMonth(current, e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {attendanceMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={date.split("-")[0]}
              onChange={(e) => setDate((current) => updateAttendanceYear(current, e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {attendanceYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Button onClick={fetchMonthlySummary} className="h-10">
              Monthly Report
            </Button>
          </div>
        </section>

        {!showMonthlySummary && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {["Present", "Absent", "Half Day", "Leave", "Unmarked"].map((status) => (
                <div key={status} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase text-slate-500">{status}</div>
                  <div className="mt-2 text-2xl font-bold">{counts[status] || 0}</div>
                </div>
              ))}
            </section>

            <Card className="overflow-hidden rounded-lg border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Daily Attendance - {date}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center text-sm text-slate-500">Loading attendance...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead className="bg-slate-100 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">In Time</th>
                          <th className="px-4 py-3">Out Time</th>
                          <th className="px-4 py-3">Hours</th>
                          <th className="px-4 py-3">Manual Mark</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const row = attendance[student.id] || {};
                          return (
                            <tr key={student.id} className="border-t hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium">{student.name}</td>
                              <td className="px-4 py-3">
                                <Input
                                  type="time"
                                  step="60"
                                  value={row.inTime || ""}
                                  onChange={(e) =>
                                    handleTimeChange(student.id, "inTime", e.target.value)
                                  }
                                  className="h-9"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="time"
                                  step="60"
                                  value={row.outTime || ""}
                                  onChange={(e) =>
                                    handleTimeChange(student.id, "outTime", e.target.value)
                                  }
                                  className="h-9"
                                />
                              </td>
                              <td className="px-4 py-3">{deriveHours(row.inTime, row.outTime)}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {["Absent", "Leave"].map((status) => (
                                    <Button
                                      key={status}
                                      type="button"
                                      size="sm"
                                      variant={row.status === status ? "default" : "outline"}
                                      disabled={submittingId === student.id}
                                      onClick={() => saveAttendance(student.id, status)}
                                    >
                                      {status}
                                    </Button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={statusClass(row.status)}>
                                  {row.status || "Unmarked"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={submittingId === student.id}
                                  onClick={() => saveAttendance(student.id)}
                                >
                                  <Save className="h-4 w-4" />
                                  Save Time
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {showMonthlySummary && (
          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">
                Monthly Attendance Summary - {new Date(date).toLocaleString("default", { month: "long" })}
              </CardTitle>
              <Button variant="secondary" onClick={() => setShowMonthlySummary(false)}>
                <RotateCcw className="h-4 w-4" />
                Back
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Present</th>
                      <th className="px-4 py-3">Absent</th>
                      <th className="px-4 py-3">Half Day</th>
                      <th className="px-4 py-3">Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No data for this month.
                        </td>
                      </tr>
                    ) : (
                      monthlySummary.map((student) => (
                        <tr key={student.student__id} className="border-t hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{student.student__name}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{student.present}</td>
                          <td className="px-4 py-3 font-semibold text-red-600">{student.absent}</td>
                          <td className="px-4 py-3 font-semibold text-yellow-600">{student.half_day}</td>
                          <td className="px-4 py-3 font-semibold text-blue-600">{student.leave}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
