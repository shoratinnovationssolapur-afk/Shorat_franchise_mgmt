import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;


const StudentAttendanceList = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const token = localStorage.getItem("access_token");



  // ✅ Fetch all franchises for branch filter
useEffect(() => {
  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/franchise/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch franchises");

      const data = await res.json();

      // assuming API returns array of franchises
      const branchNames = Array.isArray(data)
        ? data.map(f => f.name)
        : [];

      setBranches(branchNames);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  fetchBranches();
}, [token]);

  // Fetch student attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/attendance/student-attendance/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [token]);

  const filteredRecords = records.filter(
    r =>
      (selectedBranch ? (r.branch_name || r.branch) === selectedBranch : true) &&
      (selectedMonth ? new Date(r.date).getMonth() + 1 === selectedMonth : true)
  );

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const fetchMonthlySummary = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/attendance/student-monthly-summary/?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch monthly summary");
      const data = await res.json();

      // Map branch names from attendance records
      const mappedData = data.map(s => {
        const match = records.find(r => r.student === s.student__id || r.student_name === s.student__name);
        return { ...s, branch: match ? match.branch_name || match.branch : "-" };
      });

      setMonthlySummary(mappedData);
      setShowSummary(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-6">Loading...</p>;

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-3xl md:text-3xl font-bold mb-4 text-left md:text-left">
        Student Attendance
      </h2>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-medium">Filter by Branch:</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-medium">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full sm:w-auto"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchMonthlySummary}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded w-full sm:w-auto"
        >
          View Monthly Attendance
        </button>
      </div>

      {/* Daily Student Attendance Table */}
      {!showSummary && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 md:px-4 py-2">Student</th>
                <th className="border px-3 md:px-4 py-2">Branch</th>
                <th className="border px-3 md:px-4 py-2">Date</th>
                <th className="border px-3 md:px-4 py-2">Status</th>
                <th className="border px-3 md:px-4 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-2">{r.student_name || r.student}</td>
                    <td className="px-3 md:px-4 py-2">{r.branch_name || r.branch}</td>
                    <td className="px-3 md:px-4 py-2">{r.date}</td>
                    <td className="px-3 md:px-4 py-2 font-semibold">
                      {r.status === "Present" && <span className="text-green-600">Present</span>}
                      {r.status === "Absent" && <span className="text-red-600">Absent</span>}
                      {r.status === "Half Day" && <span className="text-yellow-600">Half Day</span>}
                      {r.status === "WFH" && <span className="text-blue-600">WFH</span>}
                    </td>
                    <td className="px-3 md:px-4 py-2">{r.remarks || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No student attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Summary Table */}
      {showSummary && (
        <div className="overflow-x-auto mt-6">
          <h3 className="text-lg md:text-xl font-semibold mb-3 text-center md:text-left">
            Monthly Student Attendance Summary - {getMonthName(selectedMonth)}
          </h3>
          <table className="min-w-full border border-gray-200 rounded text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 md:px-4 py-2">Student</th>
                <th className="border px-3 md:px-4 py-2">Branch</th>
                <th className="border px-3 md:px-4 py-2">Present</th>
                <th className="border px-3 md:px-4 py-2">Absent</th>
                <th className="border px-3 md:px-4 py-2">Half Day</th>
                <th className="border px-3 md:px-4 py-2">WFH</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map(s => (
                <tr key={s.student__id} className="border-t hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2">{s.student__name}</td>
                  <td className="px-3 md:px-4 py-2">{s.branch}</td>
                  <td className="px-3 md:px-4 py-2 text-green-600 font-semibold">{s.present}</td>
                  <td className="px-3 md:px-4 py-2 text-red-600 font-semibold">{s.absent}</td>
                  <td className="px-3 md:px-4 py-2 text-yellow-600 font-semibold">{s.half_day}</td>
                  <td className="px-3 md:px-4 py-2 text-blue-600 font-semibold">{s.wfh}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => setShowSummary(false)}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded w-full sm:w-auto"
          >
            Back to Attendance Records
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceList;
