import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApi } from "@/utils/api";
import { CalendarCheck, Check, Search, X } from "lucide-react";

const statusClass = (status) => {
  if (status === "Approved") return "bg-green-600 text-white";
  if (status === "Rejected") return "bg-red-600 text-white";
  if (status === "Withdrawn") return "bg-slate-500 text-white";
  return "bg-yellow-500 text-white";
};

const isStatusChangeLocked = (request) => {
  if (request.status !== "Approved" || !request.franchise_approved_at) return false;
  return Date.now() - new Date(request.franchise_approved_at).getTime() > 10000;
};

export default function AdminLeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [notes, setNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [, setNow] = useState(Date.now());
  const api = getApi();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("leave/requests/");
      setRequests(Array.isArray(res.data) ? res.data : res.data?.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const totals = useMemo(() => {
    return requests.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, Withdrawn: 0 }
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !needle ||
        request.applicant_name?.toLowerCase().includes(needle) ||
        request.applicant_email?.toLowerCase().includes(needle) ||
        request.franchise_name?.toLowerCase().includes(needle) ||
        request.leave_type?.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "All" || request.status === statusFilter;
      const matchesType = typeFilter === "All" || request.applicant_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [query, requests, statusFilter, typeFilter]);

  const updateStatus = async (request, status) => {
    if (request.status === "Withdrawn") return;

    try {
      setUpdatingId(request.id);
      const res = await api.patch(`leave/requests/${request.id}/`, {
        status,
        reviewer_note: notes[request.id] || request.reviewer_note || "",
      });
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? res.data : item))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Unable to update leave request.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            Leave Management
          </div>
          <h1 className="mt-1 text-2xl font-bold">Admin Leave Approvals</h1>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          {["Pending", "Approved", "Rejected", "Withdrawn"].map((status) => (
            <Card key={status} className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-slate-500">{status}</div>
                <div className="mt-2 text-2xl font-bold">{totals[status] || 0}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="overflow-hidden rounded-lg border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <CardTitle className="text-lg">All Leave Requests</CardTitle>
              <div className="grid gap-3 sm:grid-cols-[260px_150px_150px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search applicant, branch, type"
                    className="pl-9"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="All">All Applicants</option>
                  <option value="Staff">Staff</option>
                  <option value="Franchise">Franchise</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Applicant</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reviewer Note</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Loading leave requests...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => {
                      const locked = isStatusChangeLocked(request);
                      const isWithdrawn = request.status === "Withdrawn";
                      const controlsDisabled = updatingId === request.id || locked || isWithdrawn;

                      return (
                      <tr key={request.id} className="border-t align-top hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{request.applicant_name}</div>
                          <div className="text-xs text-slate-500">{request.applicant_email || "-"}</div>
                          <div className="mt-1">
                            <Badge className="bg-slate-600 text-white">{request.applicant_type}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">{request.franchise_name || "-"}</td>
                        <td className="px-4 py-3">{request.leave_type}</td>
                        <td className="px-4 py-3">
                          <div>{request.start_date} to {request.end_date}</div>
                          <div className="text-xs text-slate-500">{request.total_days} day(s)</div>
                        </td>
                        <td className="px-4 py-3">{request.reason}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusClass(request.status)}>{request.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Textarea
                            value={notes[request.id] ?? request.reviewer_note ?? ""}
                            disabled={isWithdrawn}
                            onChange={(e) =>
                              setNotes((current) => ({
                                ...current,
                                [request.id]: e.target.value,
                              }))
                            }
                            placeholder="Optional note"
                            className="min-h-[72px]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={controlsDisabled}
                              onClick={() => updateStatus(request, "Approved")}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={controlsDisabled}
                              onClick={() => updateStatus(request, "Rejected")}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                          {locked && (
                            <div className="mt-2 text-right text-xs text-slate-500">
                              Change window expired
                            </div>
                          )}
                          {isWithdrawn && (
                            <div className="mt-2 text-right text-xs text-slate-500">
                              Withdrawn by staff
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
