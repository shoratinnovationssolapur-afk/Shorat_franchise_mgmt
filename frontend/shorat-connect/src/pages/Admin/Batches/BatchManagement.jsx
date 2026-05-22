import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_URL;

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("access_token");

  const fetchBatches = async () => {
    if (!token) return setError("No access token found");
    try {
      const res = await axios.get(`${API_BASE}/api/batches/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(Array.isArray(res.data) ? res.data : res.data.results || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
      setError("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  if (loading) return <p>Loading batches...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className=" p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">All Batches</h1>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>All Franchise Batches</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Name</th>
                <th className="border px-3 py-2 text-left">Franchise</th>
                <th className="border px-3 py-2 text-left">Students</th>
                <th className="border px-3 py-2 text-left">Start</th>
                <th className="border px-3 py-2 text-left">End</th>
                <th className="border px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{b.name}</td>
                    <td className="border px-3 py-2">{b.franchise}</td>
                    <td className="border px-3 py-2">{b.students}</td>
                    <td className="border px-3 py-2">{b.start}</td>
                    <td className="border px-3 py-2">{b.end}</td>
                    <td className={`border px-3 py-2 font-semibold ${b.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                      {b.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No batches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchManagement;
