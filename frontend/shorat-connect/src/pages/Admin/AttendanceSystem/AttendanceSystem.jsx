import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;



const AttendanceList = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/attendance/staff-attendance/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        setRecords(data);

        const uniqueBranches = [...new Set(data.map(r => r.branch_name || r.branch))];
        setBranches(uniqueBranches);
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
        `${API_BASE}/api/attendance/monthly-summary/?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch monthly summary");
      const data = await res.json();
      const mappedData = data.map(s => {
        const match = records.find(r => r.staff === s.staff__id || r.staff_name === s.staff__name);
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

  if (loading)
    return <p className="text-center text-gray-500 mt-6">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Staff Attendance</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Filter by Branch</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="mb-1 font-medium text-gray-700">Select Month</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
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
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition mt-4 sm:mt-0"
        >
          View Monthly Attendance
        </button>
      </div>

      {/* Attendance Table */}
      {!showSummary && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {["Staff", "Branch", "Date", "In Time", "Out Time", "Status"].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-gray-700 font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRecords.length > 0 ? filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">{r.staff_name || r.staff}</td>
                  <td className="px-4 py-2">{r.branch_name || r.branch}</td>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">{r.in_time || "-"}</td>
                  <td className="px-4 py-2">{r.out_time || "-"}</td>
                  <td className="px-4 py-2 font-semibold text-blue-600">{r.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Summary Table */}
      {showSummary && (
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Monthly Attendance Summary - {getMonthName(selectedMonth)}</h3>
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {["Staff", "Branch", "Present", "Absent", "Half Day", "WFH"].map(header => (
                    <th key={header} className="px-4 py-3 text-left text-gray-700 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {monthlySummary.map(s => (
                  <tr key={s.staff__id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">{s.staff__name}</td>
                    <td className="px-4 py-2">{s.branch}</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">{s.present}</td>
                    <td className="px-4 py-2 text-red-600 font-semibold">{s.absent}</td>
                    <td className="px-4 py-2 text-yellow-600 font-semibold">{s.half_day}</td>
                    <td className="px-4 py-2 text-blue-600 font-semibold">{s.wfh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowSummary(false)}
            className="mt-4 px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow"
          >
            Back to Attendance Records
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
