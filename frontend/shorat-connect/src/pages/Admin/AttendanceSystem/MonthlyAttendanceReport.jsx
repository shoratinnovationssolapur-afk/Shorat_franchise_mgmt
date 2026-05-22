import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = import.meta.env.VITE_API_URL;



const MonthlyAttendanceReport = () => {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const token = localStorage.getItem("access_token");

  // Fetch attendance records
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

        const uniqueBranches = [...new Set(data.map(r => (r.branch_name || r.branch)?.trim()))];
        setBranches(uniqueBranches);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [token]);

  const getMonthName = monthNumber => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  // Update summary instantly
  useEffect(() => {
    const filteredRecords = records.filter(r => {
      const recordBranch = (r.branch_name || r.branch)?.trim().toLowerCase();
      const selectedBranchNormalized = selectedBranch.trim().toLowerCase();
      const branchMatch = !selectedBranch || recordBranch === selectedBranchNormalized;
      const monthMatch = !selectedMonth || new Date(r.date).getMonth() + 1 === selectedMonth;
      return branchMatch && monthMatch;
    });

    const summaryData = filteredRecords.reduce((acc, r) => {
      const existing = acc.find(a => a.staff__id === r.staff);
      if (existing) {
        existing.present += r.status === "Present" ? 1 : 0;
        existing.absent += r.status === "Absent" ? 1 : 0;
        existing.half_day += r.status === "Half Day" ? 1 : 0;
        existing.wfh += r.status === "WFH" ? 1 : 0;
      } else {
        acc.push({
          staff__id: r.staff,
          staff__name: r.staff_name,
          branch: r.branch_name || r.branch,
          present: r.status === "Present" ? 1 : 0,
          absent: r.status === "Absent" ? 1 : 0,
          half_day: r.status === "Half Day" ? 1 : 0,
          wfh: r.status === "WFH" ? 1 : 0,
        });
      }
      return acc;
    }, []);

    setMonthlySummary(summaryData);
  }, [records, selectedBranch, selectedMonth]);

  // PDF download functions
  const downloadPDF = staffId => {
    const staffRecords = records.filter(r => {
      const recordBranch = (r.branch_name || r.branch)?.trim().toLowerCase();
      const selectedBranchNormalized = selectedBranch.trim().toLowerCase();
      const branchMatch = !selectedBranch || recordBranch === selectedBranchNormalized;
      const monthMatch = !selectedMonth || new Date(r.date).getMonth() + 1 === selectedMonth;
      return branchMatch && monthMatch && r.staff === staffId;
    });
    if (!staffRecords.length) return;

    const doc = new jsPDF();
    const staffName = staffRecords[0].staff_name || staffId;
    doc.setFontSize(18);
    doc.text(`Attendance Report - ${staffName}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Branch: ${staffRecords[0].branch_name || staffRecords[0].branch}`, 14, 30);
    doc.text(`Month: ${getMonthName(selectedMonth)}`, 14, 36);

    const tableColumn = ["Date", "In Time", "Out Time", "Status", "Branch"];
    const tableRows = staffRecords.map(r => [r.date, r.in_time || "-", r.out_time || "-", r.status, r.branch_name || r.branch]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 45 });
    doc.save(`${staffName}_Attendance_${getMonthName(selectedMonth)}.pdf`);
  };

  const downloadAllStaffPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Monthly Attendance Report - ${getMonthName(selectedMonth)}`, 14, 22);

    monthlySummary.forEach((staff, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(16);
      doc.text(`Staff: ${staff.staff__name}`, 14, 30);
      doc.setFontSize(12);
      doc.text(`Branch: ${staff.branch}`, 14, 36);

      const staffRecords = records.filter(r => {
        const recordBranch = (r.branch_name || r.branch)?.trim().toLowerCase();
        const selectedBranchNormalized = selectedBranch.trim().toLowerCase();
        const branchMatch = !selectedBranch || recordBranch === selectedBranchNormalized;
        const monthMatch = !selectedMonth || new Date(r.date).getMonth() + 1 === selectedMonth;
        return branchMatch && monthMatch && r.staff === staff.staff__id;
      });

      const tableColumn = ["Date", "In Time", "Out Time", "Status"];
      const tableRows = staffRecords.map(r => [r.date, r.in_time || "-", r.out_time || "-", r.status]);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 45 });
    });

    doc.save(`All_Staff_Attendance_${getMonthName(selectedMonth)}.pdf`);
  };

  if (loading) return <p className="text-center text-gray-500 mt-6">Loading...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Staff Attendance Dashboard</h2>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Filter by Branch</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch.trim()}>{branch.trim()}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Select Month</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
            ))}
          </select>
        </div>

        <button
          onClick={downloadAllStaffPDF}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition mt-4 sm:mt-0"
        >
          Download All PDF
        </button>
      </div>

      {/* Monthly Summary Table */}
      {monthlySummary.length > 0 ? (
        <div className="overflow-x-auto border rounded shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Staff", "Branch", "Present", "Absent", "Half Day", "WFH", "Download"].map(header => (
                  <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {monthlySummary.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{s.staff__name}</td>
                  <td className="px-4 py-2">{s.branch}</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">{s.present}</td>
                  <td className="px-4 py-2 text-red-600 font-semibold">{s.absent}</td>
                  <td className="px-4 py-2 text-yellow-600 font-semibold">{s.half_day}</td>
                  <td className="px-4 py-2 text-blue-600 font-semibold">{s.wfh}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => downloadPDF(s.staff__id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">No attendance records found for selected filters.</p>
      )}
    </div>
  );
};

export default MonthlyAttendanceReport;
