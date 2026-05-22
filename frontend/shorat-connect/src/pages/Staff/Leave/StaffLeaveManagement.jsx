import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApi } from "@/utils/api";
import { CalendarDays, RotateCcw, Send } from "lucide-react";

const statusClass = (status) => {
  if (status === "Approved") return "bg-green-600 text-white";
  if (status === "Rejected") return "bg-red-600 text-white";
  if (status === "Withdrawn") return "bg-slate-500 text-white";
  return "bg-yellow-500 text-white";
};

const initialForm = {
  leave_type: "Casual",
  start_date: "",
  end_date: "",
  reason: "",
};

const todayDate = () => new Date().toISOString().split("T")[0];

export default function StaffLeaveManagement() {
  const [form, setForm] = useState(initialForm);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [error, setError] = useState("");
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

  const totals = useMemo(() => {
    return requests.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, Withdrawn: 0 }
    );
  }, [requests]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.end_date < form.start_date) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (form.start_date < todayDate() || form.end_date < todayDate()) {
      setError("Leave dates cannot be in the past.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("leave/requests/", form);
      setRequests((current) => [res.data, ...current]);
      setForm(initialForm);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Unable to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawRequest = async (request) => {
    if (request.status !== "Pending") return;

    try {
      setWithdrawingId(request.id);
      const res = await api.patch(`leave/requests/${request.id}/`, {
        status: "Withdrawn",
      });
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? res.data : item))
      );
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Unable to withdraw leave request.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            Leave Management
          </div>
          <h1 className="mt-1 text-2xl font-bold">My Leave Requests</h1>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-4">
          {["Pending", "Approved", "Rejected", "Withdrawn"].map((status) => (
            <Card key={status} className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-slate-500">{status}</div>
                <div className="mt-2 text-2xl font-bold">{totals[status] || 0}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <Card className="rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Apply for Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <select
                    value={form.leave_type}
                    onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Sick">Sick</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={form.start_date}
                      min={todayDate()}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={form.end_date}
                      min={form.start_date || todayDate()}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Reason for leave"
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Request History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Loading leave requests...
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No leave requests yet.
                        </td>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <tr key={request.id} className="border-t hover:bg-slate-50">
                          <td className="px-4 py-3">{request.leave_type}</td>
                          <td className="px-4 py-3">
                            {request.start_date} to {request.end_date}
                          </td>
                          <td className="px-4 py-3">{request.total_days}</td>
                          <td className="px-4 py-3">{request.reason}</td>
                          <td className="px-4 py-3">
                            <Badge className={statusClass(request.status)}>{request.status}</Badge>
                          </td>
                          <td className="px-4 py-3">{request.reviewer_note || "-"}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                request.status !== "Pending" ||
                                withdrawingId === request.id
                              }
                              onClick={() => withdrawRequest(request)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Withdraw
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
