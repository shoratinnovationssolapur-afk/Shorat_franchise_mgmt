import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApi } from "@/utils/api";
import {
  BriefcaseBusiness,
  Calendar as CalendarIcon,
  Clock,
  LogIn,
  LogOut,
  RotateCcw,
} from "lucide-react";
import {
  attendanceMonths,
  attendanceYears,
  updateAttendanceMonth,
  updateAttendanceYear,
} from "./attendanceDate";

const API_DATE_TODAY = () => new Date().toISOString().split("T")[0];
const clampToToday = () => API_DATE_TODAY();
const currentMonthValue = () => API_DATE_TODAY().split("-")[1];
const currentYearValue = () => API_DATE_TODAY().split("-")[0];
const isCurrentMonth = (month) => month === currentMonthValue();
const isCurrentYear = (year) => String(year) === currentYearValue();
const clampToFutureLimit = (value) => {
  const today = API_DATE_TODAY();
  return value > today ? today : value;
};

const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "present":
      return "bg-green-600";
    case "half day":
    case "half-day":
      return "bg-yellow-500";
    case "wfh":
      return "bg-blue-600";
    case "absent":
    default:
      return "bg-red-500";
  }
};

const formatTime = (value) => (value ? value.slice(0, 5) : "-");

export default function StaffAttendance() {
  const api = getApi();
  const [date, setDate] = useState(API_DATE_TODAY());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [showMonthly, setShowMonthly] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
  }, []);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await api.get("staff/");
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setStaffList(data);
      } catch (e) {
        console.error("Failed to load staff list", e);
      }
    };
    loadStaff();
  }, [api]);

  const currentStaff = useMemo(() => {
    if (!email) return null;
    return (
      staffList.find(
        (s) =>
          s.email === email ||
          s.user_email === email ||
          s.user?.email === email
      ) || null
    );
  }, [staffList, email]);

  const franchiseName = useMemo(() => {
    if (!currentStaff) return "";
    return (
      currentStaff.franchise_name ||
      currentStaff.franchise?.name ||
      currentStaff.franchise ||
      ""
    );
  }, [currentStaff]);

  const branchName = currentStaff?.branch || franchiseName || "";

  const refreshAttendance = async () => {
    if (!date || !currentStaff?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("attendance/staff-attendance/", {
        params: { date, staff: currentStaff.id },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setAttendanceList(data);
      setError(null);
    } catch (e) {
      console.error("Failed to refresh attendance", e);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, currentStaff?.id]);

  const myAttendance = useMemo(() => {
    if (!currentStaff?.id) return [];
    return attendanceList.filter(
      (a) => a.staff === currentStaff.id || a.staff_id === currentStaff.id
    );
  }, [attendanceList, currentStaff]);

  const currentAttendance = myAttendance[0] || null;
  const attendanceStatus = currentAttendance?.status || "-";
  const workedHours = currentAttendance?.hours_worked;
  const isWFH = attendanceStatus === "WFH";
  const isAbsent = attendanceStatus === "Absent";
  const shouldShowWFH = !currentAttendance || attendanceStatus === "-";
  const today = API_DATE_TODAY();
  const isFutureDate = date > today;
  const shouldShowClockIn = !isFutureDate && !isWFH && (!currentAttendance || !currentAttendance.in_time);
  const shouldShowClockOut =
    !isFutureDate && currentAttendance && currentAttendance.in_time && !currentAttendance.out_time;

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-GB", { hour12: false }).slice(0, 8);

  const updateAttendance = async (updates) => {
    if (!currentStaff) return;
    if (date !== API_DATE_TODAY()) {
      setError("Attendance can only be marked for today.");
      return;
    }
    const payload = {
      staff: currentStaff.id,
      date,
      branch: branchName,
      ...updates,
    };

    try {
      setSubmitting(true);
      await api.post("attendance/staff-attendance/", [payload]);
      await refreshAttendance();
    } catch (e) {
      console.error("Failed to update attendance", e);
      setError(e.response?.data?.error || "Unable to save attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

  const handleClockIn = async () => {
    try {
      setSubmitting(true);
      const position = await getCurrentPosition();
      await updateAttendance({
        in_time: getCurrentTime(),
        status: "Present",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      console.error("Unable to get office location", e);
      setError("Location permission is required. You can clock in only from office premises.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setSubmitting(true);
      const position = await getCurrentPosition();
      await updateAttendance({
        out_time: getCurrentTime(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      console.error("Unable to get office location", e);
      setError("Location permission is required. You can clock out only from office premises.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWFH = () => {
    updateAttendance({ in_time: null, out_time: null, status: "WFH" });
  };

  useEffect(() => {
    const fetchMonthly = async () => {
      if (!showMonthly || !currentStaff?.id) return;
      try {
        const month = new Date(date).getMonth() + 1;
        const res = await api.get("attendance/monthly-summary/", {
          params: { month, staff: currentStaff.id },
        });
        setMonthlySummary(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load monthly summary", e);
      }
    };
    fetchMonthly();
  }, [api, date, showMonthly, currentStaff?.id]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
        <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              Attendance
            </div>
            <h1 className="mt-1 text-2xl font-bold">My Attendance</h1>
            <p className="mt-1 text-sm text-slate-500">
              {franchiseName || "-"} · {email || "-"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[160px_150px_100px_auto]">
            <Input
              type="date"
              value={date}
              min={today}
              max={today}
              onChange={(e) => setDate(clampToToday(e.target.value))}
              className="h-10"
            />
            <select
              value={date.split("-")[1]}
              onChange={(e) =>
                setDate((current) =>
                  clampToFutureLimit(updateAttendanceMonth(current, e.target.value))
                )
              }
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
              onChange={(e) =>
                setDate((current) =>
                  clampToFutureLimit(updateAttendanceYear(current, e.target.value))
                )
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {attendanceYears().map((year) => (
                <option key={year} value={year} disabled={!isCurrentYear(year)}>
                  {year}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant={showMonthly ? "secondary" : "default"}
              onClick={() => setShowMonthly((v) => !v)}
              className="h-10"
            >
              {showMonthly ? "Back to Daily" : "Monthly Report"}
            </Button>
          </div>
        </section>

        {loading && <div className="text-center text-sm text-slate-500">Loading attendance...</div>}
        {error && <div className="text-center text-sm text-red-600">{error}</div>}

        {!currentStaff && !loading && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Could not match your staff record. Please ensure your profile email matches your staff record.
          </div>
        )}

        {currentStaff && (
          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader className="border-b bg-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 py-4 sm:grid-cols-3">
                <div className="rounded-md border bg-slate-50 p-4">
                  <div className="text-xs uppercase text-slate-500">Current status</div>
                  <Badge className={`${statusColor(attendanceStatus)} mt-2 text-white`}>
                    {attendanceStatus}
                  </Badge>
                </div>
                <div className="rounded-md border bg-slate-50 p-4">
                  <div className="text-xs uppercase text-slate-500">Hours worked</div>
                  <div className="mt-2 text-lg font-semibold">
                    {workedHours != null ? `${workedHours} hrs` : "-"}
                  </div>
                </div>
                <div className="rounded-md border bg-slate-50 p-4">
                  <div className="text-xs uppercase text-slate-500">In / Out</div>
                  <div className="mt-2 text-sm font-medium">
                    {formatTime(currentAttendance?.in_time)} / {formatTime(currentAttendance?.out_time)}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                <Button
                  disabled={submitting || !shouldShowClockIn}
                  onClick={handleClockIn}
                  className="w-full"
                >
                  <LogIn className="h-4 w-4" />
                  {isWFH ? "WFH Marked" : shouldShowClockIn ? "Clock In" : "Already Clocked In"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={submitting || isWFH || !shouldShowClockOut}
                  onClick={handleClockOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
                  {shouldShowClockOut ? "Clock Out" : "Clock Out Unavailable"}
                </Button>
                {shouldShowWFH && (
                  <Button
                    variant="outline"
                    disabled={submitting || isAbsent}
                    onClick={handleWFH}
                    className="w-full"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    {isAbsent ? "WFH Unavailable" : "Mark WFH"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!showMonthly && (
          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle>Attendance for {date}</CardTitle>
            </CardHeader>
            <CardContent>
              {myAttendance.length === 0 ? (
                <div className="py-4 text-center text-sm text-slate-500">
                  No attendance record for the selected date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">In Time</th>
                        <th className="px-3 py-2">Out Time</th>
                        <th className="px-3 py-2">Hours</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.map((a) => (
                        <tr key={a.id || a.date} className="border-t hover:bg-slate-50">
                          <td className="px-3 py-2">{a.date}</td>
                          <td className="px-3 py-2">{formatTime(a.in_time)}</td>
                          <td className="px-3 py-2">{formatTime(a.out_time)}</td>
                          <td className="px-3 py-2">{a.hours_worked != null ? `${a.hours_worked} hrs` : "-"}</td>
                          <td className="px-3 py-2">
                            <Badge className={`${statusColor(a.status)} text-white`}>{a.status || "-"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showMonthly && (
          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Monthly Summary ({new Date(date).toLocaleString("default", { month: "long" })})</CardTitle>
              <Button variant="secondary" onClick={() => setShowMonthly(false)}>
                <RotateCcw className="h-4 w-4" />
                Back
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Present</th>
                      <th className="px-3 py-2">Absent</th>
                      <th className="px-3 py-2">Half Day</th>
                      <th className="px-3 py-2">WFH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500">
                          No data for this month.
                        </td>
                      </tr>
                    ) : (
                      monthlySummary
                        .filter((r) => r.staff__id === currentStaff?.id)
                        .map((r) => (
                          <tr key={r.staff__id} className="border-t">
                            <td className="px-3 py-2 font-semibold text-green-600">{r.present}</td>
                            <td className="px-3 py-2 font-semibold text-red-600">{r.absent}</td>
                            <td className="px-3 py-2 font-semibold text-yellow-600">{r.half_day}</td>
                            <td className="px-3 py-2 font-semibold text-blue-600">{r.wfh}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
