import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helpers
const pct = (num, den) => (den === 0 ? 0 : Math.round((num / den) * 100));
const attendancePct = (days) =>
  pct(days.reduce((a, d) => a + (d.present || 0), 0), days.length);
const formatINR = (n) => `₹${Number(n || 0).toLocaleString()}`;

const StatusBadge = ({ status }) => (
  <Badge
    className={`px-2 py-1 rounded-full text-white ${
      status === "Active" ? "bg-green-600" : "bg-gray-400"
    }`}
  >
    {status}
  </Badge>
);

const getApi = () => {
  const token = localStorage.getItem("access_token");
  return axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/`,  // <- add /api/ here
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};


export default function StudentManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState("All");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const api = getApi();
        const res = await api.get("students/");
        const students = Array.isArray(res.data) ? res.data : res.data.results;

        const normalized = students.map((s) => ({
          ...s,
          batch_name: s.batch?.name || s.batch || "",
          franchise_id: s.franchise?.id || s.franchise,
          franchise_name: s.franchise?.name || s.franchise || "",
          fees_paid: s.fees_paid || 0,
          total_fees: s.total_fees || 0,
          fees_pending: (s.total_fees || 0) - (s.fees_paid || 0),
          attendance: s.attendance || [],
        }));

        setRows(normalized);

        const uniqueFranchises = [
          ...new Map(normalized.map((s) => [s.franchise_id, s.franchise_name])).entries(),
        ].map(([id, name]) => ({ id, name }));

        setFranchises(uniqueFranchises);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        alert("Error fetching students from backend");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredRows =
    selectedFranchise === "All"
      ? rows
      : rows.filter((r) => String(r.franchise_id) === String(selectedFranchise));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6">
      <main className="mx-auto max-w-7xl space-y-4">
        <h2 className="text-3xl font-bold ">Students Management </h2>
        {/* Filter */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mb-2">
          <select
            value={selectedFranchise}
            onChange={(e) => setSelectedFranchise(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="All">All Franchises</option>
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        <Card className="mt-2 rounded-2xl shadow-lg overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-2xl font-semibold">Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Batch",
                      "Franchise",
                      "Attendance",
                      "Fees Paid",
                      "Pending",
                      "Status",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-gray-500">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3">{r.phone}</td>
                        <td className="px-4 py-3">{r.batch_name}</td>
                        <td className="px-4 py-3">{r.franchise_name}</td>
                        <td className="px-4 py-3">{attendancePct(r.attendance)}%</td>
                        <td className="px-4 py-3">{formatINR(r.fees_paid)}</td>
                        <td className="px-4 py-3">{formatINR(r.fees_pending)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden mt-4 space-y-4">
              {filteredRows.map((r) => (
                <Card key={r.id} className="p-4 shadow-md rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{r.name}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Email: {r.email}</div>
                    <div>Phone: {r.phone}</div>
                    <div>Batch: {r.batch_name}</div>
                    <div>Franchise: {r.franchise_name}</div>
                    <div>Attendance: {attendancePct(r.attendance)}%</div>
                    <div>Fees Paid: {formatINR(r.fees_paid)}</div>
                    <div>Pending: {formatINR(r.fees_pending)}</div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
