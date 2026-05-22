import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Pie chart colors
const COLORS = ["#f87171", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa"];

// Use env variable for API base URL
const BASE_URL = import.meta.env.VITE_API_URL + "/api/";

const apiFetch = async (url, options = {}) => {
  let token = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  const makeRequest = (t) =>
    fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
        ...(options.headers || {}),
      },
    });

  let res = await makeRequest(token);

  // Refresh token if 401
  if (res.status === 401 && refresh) {
    const refreshRes = await fetch(`${BASE_URL}token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      token = data.access;
      localStorage.setItem("access_token", token);
      res = await makeRequest(token);
    }
  }

  return res;
};

const ReportsAnalytics = () => {
  const reportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [franchiseFees, setFranchiseFees] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("students/");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        const studentsList = Array.isArray(data) ? data : data.results || [];
        setStudents(studentsList);

        // Extract franchise list
        const fMap = {};
        studentsList.forEach((s) => {
          if (s.franchise) {
            const fId = typeof s.franchise === "object" ? s.franchise.id : s.franchise;
            const fName = typeof s.franchise === "object" ? s.franchise.name : `Franchise ${s.franchise}`;
            if (!fMap[fId]) fMap[fId] = fName;
          } else {
            fMap["unknown"] = "Unknown";
          }
        });

        const franchiseArray = [{ id: "all", name: "All" }];
        Object.entries(fMap).forEach(([id, name]) =>
          franchiseArray.push({ id, name })
        );
        setFranchises(franchiseArray);

        // Aggregate fees by franchise
        const franchiseMap = {};
        studentsList.forEach((s) => {
          const fId = typeof s.franchise === "object" ? s.franchise.id : s.franchise || "unknown";
          const fName = typeof s.franchise === "object" ? s.franchise.name : `Franchise ${s.franchise || "Unknown"}`;
          if (!franchiseMap[fId]) {
            franchiseMap[fId] = {
              id: fId,
              name: fName,
              total_fees: 0,
              paid_fees: 0,
              remaining_fees: 0,
            };
          }
          const total = Number(s.total_fees || 0);
          const paid = Number(s.fees_paid || 0);
          franchiseMap[fId].total_fees += total;
          franchiseMap[fId].paid_fees += paid;
          franchiseMap[fId].remaining_fees += total - paid;
        });

        // Add total row
        const totalRow = Object.values(franchiseMap).reduce(
          (acc, f) => {
            acc.total_fees += f.total_fees;
            acc.paid_fees += f.paid_fees;
            acc.remaining_fees += f.remaining_fees;
            return acc;
          },
          { id: "total", name: "Total", total_fees: 0, paid_fees: 0, remaining_fees: 0 }
        );

        setFranchiseFees([...Object.values(franchiseMap), totalRow]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // PDF Export
  const handleDownloadPDF = () => {
    const exportButton = document.getElementById("export-pdf-btn");
    exportButton.style.display = "none";

    html2canvas(reportRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("reports-analytics.pdf");
      exportButton.style.display = "inline-block";
    });
  };

  // Filtered data
  const filteredStudents =
    selectedFranchise === "all"
      ? students
      : students.filter(
          (s) => (typeof s.franchise === "object" ? s.franchise.id : s.franchise) === selectedFranchise
        );

  const filteredFranchiseFees =
    selectedFranchise === "all"
      ? franchiseFees
      : franchiseFees.filter((f) => f.id === selectedFranchise || f.id === "total");

  return (
    <div className="p-4 md:p-6">
      <div ref={reportRef} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-3xl md:text-3xl font-bold">Reports & Analytics</h2>
          <Button
            id="export-pdf-btn"
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto"
          >
            Export report to PDF
          </Button>
        </div>

        {/* Franchise Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="font-medium">Filter by Franchise:</label>
          <select
            value={selectedFranchise}
            onChange={(e) => setSelectedFranchise(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold">
                ₹
                {filteredStudents
                  .reduce((acc, s) => acc + Number(s.total_fees || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Received Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                ₹
                {filteredStudents
                  .reduce((acc, s) => acc + Number(s.fees_paid || 0), 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold text-red-500">
                ₹
                {filteredStudents
                  .reduce(
                    (acc, s) =>
                      acc + (Number(s.total_fees || 0) - Number(s.fees_paid || 0)),
                    0
                  )
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Franchise Wise Fees (Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredFranchiseFees}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_fees" fill="#60a5fa" name="Total Fees" />
                  <Bar dataKey="paid_fees" fill="#34d399" name="Paid Fees" />
                  <Bar dataKey="remaining_fees" fill="#f87171" name="Remaining Fees" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Franchise Wise Paid Fees (Pie)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredFranchiseFees}
                    dataKey="paid_fees"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {filteredFranchiseFees.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Student Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Fees Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm md:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-2">Name</th>
                    <th className="border px-2 py-2">Total Fees</th>
                    <th className="border px-2 py-2">Paid Fees</th>
                    <th className="border px-2 py-2">Remaining Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => {
                    const total = Number(s.total_fees || 0);
                    const paid = Number(s.fees_paid || 0);
                    const remaining = total - paid;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-2">{s.name}</td>
                        <td className="border px-2 py-2">₹{total.toLocaleString()}</td>
                        <td className="border px-2 py-2">₹{paid.toLocaleString()}</td>
                        <td className="border px-2 py-2">₹{remaining.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="font-bold bg-gray-100">
                    <td className="border px-2 py-2">Total</td>
                    <td className="border px-2 py-2">
                      ₹
                      {filteredStudents
                        .reduce((acc, s) => acc + Number(s.total_fees || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="border px-2 py-2">
                      ₹
                      {filteredStudents
                        .reduce((acc, s) => acc + Number(s.fees_paid || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="border px-2 py-2">
                      ₹
                      {filteredStudents
                        .reduce(
                          (acc, s) =>
                            acc + (Number(s.total_fees || 0) - Number(s.fees_paid || 0)),
                          0
                        )
                        .toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Events & Workshops */}
        <Card>
          <CardHeader>
            <CardTitle>Events & Workshops</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              📅 Upcoming events and workshops will be displayed here.  
              You can integrate your events API or static list.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
