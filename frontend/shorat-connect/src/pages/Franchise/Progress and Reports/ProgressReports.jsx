import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getApi } from "@/utils/api"; // <-- use axios instance

const COLORS = ["#f87171", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa"];

const ReportsAnalytics = () => {
  const reportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [franchiseFees, setFranchiseFees] = useState([]);
  const [loggedInFranchise, setLoggedInFranchise] = useState(null);

  const api = getApi();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const franchiseRes = await api.get("franchise/");
        const franchiseData = franchiseRes.data;
        setLoggedInFranchise(franchiseData);

        const studentsRes = await api.get("students/");
        const studentsList = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data.results || [];

        const filteredStudents = studentsList.filter(
          (s) => s.franchise && s.franchise.id === franchiseData.id
        );
        setStudents(filteredStudents);

        const fees = filteredStudents.reduce(
          (acc, s) => {
            const total = Number(s.total_fees || 0);
            const paid = Number(s.fees_paid || 0);
            acc.total_fees += total;
            acc.paid_fees += paid;
            acc.remaining_fees += total - paid;
            return acc;
          },
          { total_fees: 0, paid_fees: 0, remaining_fees: 0 }
        );
        setFranchiseFees([
          {
            id: franchiseData.id,
            name: franchiseData.name,
            ...fees,
          },
        ]);
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const handleDownloadPDF = () => {
    const exportButton = document.getElementById("export-pdf-btn");
    if (exportButton) exportButton.style.display = "none";

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
      if (exportButton) exportButton.style.display = "inline-block";
    });
  };

  if (loading) return <p>Loading report...</p>;
  if (!loggedInFranchise) return <p>No franchise info found</p>;

  return (
    <div className=" p-4 md:p-6" ref={reportRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-3xl md:text-3xl font-bold">
          Reports & Analytics ({loggedInFranchise.name})
        </h2>
        <Button id="export-pdf-btn" onClick={handleDownloadPDF} className="self-start md:self-auto">
          Export report to PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Total Amount</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{franchiseFees[0]?.total_fees.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Received Payment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">₹{franchiseFees[0]?.paid_fees.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Payment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">₹{franchiseFees[0]?.remaining_fees.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Fees Overview (Bar Chart)</CardTitle></CardHeader>
        <CardContent className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={franchiseFees}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_fees" fill="#60a5fa" name="Total Fees" />
              <Bar dataKey="paid_fees" fill="#34d399" name="Paid Fees" />
              <Bar dataKey="remaining_fees" fill="#f87171" name="Remaining Fees" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card>
        <CardHeader><CardTitle>Student Fees Details</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 min-w-[500px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1 text-left">Total Fees</th>
                  <th className="border px-2 py-1 text-left">Paid Fees</th>
                  <th className="border px-2 py-1 text-left">Remaining Fees</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const total = Number(s.total_fees || 0);
                  const paid = Number(s.fees_paid || 0);
                  const remaining = total - paid;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">₹{total.toLocaleString()}</td>
                      <td className="border px-2 py-1">₹{paid.toLocaleString()}</td>
                      <td className="border px-2 py-1">₹{remaining.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;
