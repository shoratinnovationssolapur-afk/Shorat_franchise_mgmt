import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApi } from "@/utils/api";
import { CalendarDays, RotateCcw, Users } from "lucide-react";
import {
  attendanceMonths,
  attendanceYears,
  updateAttendanceMonth,
  updateAttendanceYear,
} from "./attendanceDate";

const statusClass = (status) => {
  switch (status) {
    case "Present":
      return "bg-green-600 text-white";
    case "Absent":
      return "bg-red-600 text-white";
    case "Half Day":
      return "bg-yellow-500 text-white";
    case "WFH":
      return "bg-blue-600 text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

const AttendanceBadge = ({ status }) => (
  <Badge className={`rounded px-2 py-1 ${statusClass(status)}`}>
    {status || "-"}
  </Badge>
);

const todayDate = () => new Date().toISOString().split("T")[0];
const currentMonthValue = () => todayDate().split("-")[1];
const currentYearValue = () => todayDate().split("-")[0];
const isCurrentMonth = (month) => month === currentMonthValue();
const isCurrentYear = (year) => String(year) === currentYearValue();

export default function StaffAttendance() {
  const [role, setRole] = useState("");
  const [franchiseName, setFranchiseName] = useState("");
  const [staff, setStaff] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(todayDate());
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = getApi();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  useEffect(() => {
    if (!token || role !== "franchise_head") return;

    const fetchFranchise = async () => {
      try {
        const res = await api.get("franchise/");
        const email = localStorage.getItem("email");
        const franchise = res.data.find(
          (f) => f.user_email?.toLowerCase() === email?.toLowerCase()
        );

        if (franchise) setFranchiseName(franchise.name);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFranchise();
  }, [api, token, role]);

  useEffect(() => {
    if (!franchiseName) return;

    const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await api.get(`staff/?branch=${franchiseName}`);
        setStaff(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [api, franchiseName]);

  useEffect(() => {
    if (!staff.length) return;

    const email = localStorage.getItem("email");
    if (!email) return;

    const found = staff.find(
      (s) =>
        (s.email || s.user_email) &&
        (s.email || s.user_email).toLowerCase().trim() ===
          email.toLowerCase().trim()
    );

    if (found) setStaffName(found.name);
  }, [staff]);

  useEffect(() => {
    if (!franchiseName) return;

    const fetchAttendance = async () => {
      try {
        const res = await api.get(
          `attendance/staff-attendance/?date=${date}&branch=${franchiseName}`
        );

        const mapped = {};
        if (Array.isArray(res.data)) {
          res.data.forEach((a) => {
            mapped[a.staff] = {
              status: a.status,
              inTime: a.in_time,
              outTime: a.out_time,
            };
          });
        }

        setAttendance(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAttendance();
  }, [api, franchiseName, date]);

  const formatTime = (time) => (time ? time.slice(0, 5) : "-");

  const dailyCounts = useMemo(() => {
    return staff.reduce(
      (acc, member) => {
        const status = attendance[member.id]?.status || "Unmarked";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Present: 0, Absent: 0, "Half Day": 0, WFH: 0, Unmarked: 0 }
    );
  }, [attendance, staff]);

  const fetchMonthlySummary = async () => {
    try {
      const month = new Date(date).getMonth() + 1;
      const res = await api.get(
        `attendance/monthly-summary/?month=${month}&branch=${franchiseName}`
      );
      setMonthlySummary(Array.isArray(res.data) ? res.data : []);
      setShowMonthlySummary(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (role !== "franchise_head") {
    return <div className="p-6 text-red-600">Unauthorized</div>;
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4 text-blue-600" />
              Staff Attendance
            </div>
            <h2 className="mt-1 text-2xl font-bold">
              {staffName ? `Welcome, ${staffName}` : franchiseName || "Branch"}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[160px_150px_100px_auto]">
            <Input
              type="date"
              value={date}
              min={todayDate()}
              max={todayDate()}
              onChange={() => setDate(todayDate())}
              className="h-10"
            />
            <select
              value={date.split("-")[1]}
              onChange={(e) => setDate((current) => updateAttendanceMonth(current, e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {attendanceMonths.map((month) => (
                <option key={month.value} value={month.value} disabled={!isCurrentMonth(month.value)}>
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
                <option key={year} value={year} disabled={!isCurrentYear(year)}>
                  {year}
                </option>
              ))}
            </select>
            <Button onClick={fetchMonthlySummary} className="h-10">
              <CalendarDays className="h-4 w-4" />
              Monthly Report
            </Button>
          </div>
        </section>

        {!showMonthlySummary && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {["Present", "Absent", "Half Day", "WFH", "Unmarked"].map((status) => (
                <div key={status} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase text-slate-500">{status}</div>
                  <div className="mt-2 text-2xl font-bold">{dailyCounts[status] || 0}</div>
                </div>
              ))}
            </section>

            <Card className="overflow-hidden rounded-lg border shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Daily Attendance - {date}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">In</th>
                        <th className="px-4 py-3">Out</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {staff.map((member) => (
                        <tr key={member.id} className="border-t hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{member.name}</td>
                          <td className="px-4 py-3">{formatTime(attendance[member.id]?.inTime)}</td>
                          <td className="px-4 py-3">{formatTime(attendance[member.id]?.outTime)}</td>
                          <td className="px-4 py-3">
                            <AttendanceBadge status={attendance[member.id]?.status || "Unmarked"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {showMonthlySummary && (
          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">
                Monthly Staff Summary - {new Date(date).toLocaleString("default", { month: "long" })}
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
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Present</th>
                      <th className="px-4 py-3">Absent</th>
                      <th className="px-4 py-3">Half Day</th>
                      <th className="px-4 py-3">WFH</th>
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
                      monthlySummary.map((summary) => (
                        <tr key={summary.staff__id} className="border-t hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{summary.staff__name}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{summary.present}</td>
                          <td className="px-4 py-3 font-semibold text-red-600">{summary.absent}</td>
                          <td className="px-4 py-3 font-semibold text-yellow-600">{summary.half_day}</td>
                          <td className="px-4 py-3 font-semibold text-blue-600">{summary.wfh}</td>
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
}
