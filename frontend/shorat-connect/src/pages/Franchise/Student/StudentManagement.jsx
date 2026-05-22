import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApi } from "@/utils/api";
import {
  Edit,
  GraduationCap,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

const formatINR = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const statusClass = (status) =>
  status === "Active"
    ? "bg-green-600 text-white"
    : "bg-slate-500 text-white";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  batches: [],
  fees_paid: "",
  total_fees: "",
  status: "Active",
  franchise: "",
  franchise_id: "",
};

const normalizeBatchIds = (student) => {
  if (Array.isArray(student?.batches)) return student.batches;
  if (Array.isArray(student?.batch_ids)) return student.batch_ids;
  return [];
};

const StudentDialog = ({ batches, loggedInFranchise, onSave, student }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEdit = Boolean(student);

  useEffect(() => {
    if (!open) return;

    setForm({
      ...emptyForm,
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      batches: normalizeBatchIds(student),
      fees_paid: student?.fees_paid?.toString() || "",
      total_fees: student?.total_fees?.toString() || "",
      status: student?.status || "Active",
      franchise: loggedInFranchise?.name || student?.franchise_name || "",
      franchise_id: loggedInFranchise?.id || student?.franchise || "",
    });
  }, [open, loggedInFranchise, student]);

  const toggleBatch = (batchId) => {
    setForm((current) => ({
      ...current,
      batches: current.batches.includes(batchId)
        ? current.batches.filter((id) => id !== batchId)
        : [...current.batches, batchId],
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const api = getApi();
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        batches: form.batches,
        fees_paid: Number(form.fees_paid) || 0,
        total_fees: Number(form.total_fees) || 0,
        status: form.status,
      };

      if (!isEdit) payload.franchise_id = form.franchise_id;

      const res = isEdit
        ? await api.put(`students/${student.id}/`, payload)
        : await api.post("students/", payload);

      onSave(res.data, isEdit);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" aria-label="Edit student">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Student name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Fees Paid</Label>
              <Input
                type="number"
                min="0"
                value={form.fees_paid}
                onChange={(e) => setForm({ ...form, fees_paid: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Fees</Label>
              <Input
                type="number"
                min="0"
                value={form.total_fees}
                onChange={(e) => setForm({ ...form, total_fees: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Franchise</Label>
            <Input value={form.franchise} readOnly placeholder="Franchise" />
          </div>

          <div className="space-y-2">
            <Label>Batches</Label>
            <div className="grid max-h-44 gap-2 overflow-y-auto rounded-md border bg-slate-50 p-3 sm:grid-cols-2">
              {batches.length === 0 ? (
                <div className="text-sm text-slate-500">No batches found.</div>
              ) : (
                batches.map((batch) => (
                  <label
                    key={batch.id}
                    className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.batches.includes(batch.id)}
                      onChange={() => toggleBatch(batch.id)}
                    />
                    <span>{batch.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || (!isEdit && !form.franchise_id)}>
              {saving ? "Saving..." : "Save Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function StudentManagement() {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loggedInFranchise, setLoggedInFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingStudentId, setSendingStudentId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const api = getApi();
      const email = localStorage.getItem("email");

      const [studentsRes, batchesRes, franchisesRes] = await Promise.all([
        api.get("students/"),
        api.get("batches/"),
        api.get("franchise/"),
      ]);

      const studentsData = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : studentsRes.data?.results || [];
      const batchesData = Array.isArray(batchesRes.data)
        ? batchesRes.data
        : batchesRes.data?.results || [];
      const franchisesData = Array.isArray(franchisesRes.data)
        ? franchisesRes.data
        : franchisesRes.data?.results || [];

      const franchise = franchisesData.find(
        (item) => item.user_email?.toLowerCase() === email?.toLowerCase()
      );

      setLoggedInFranchise(franchise || null);
      setRows(studentsData);
      setBatches(batchesData);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((student) => {
      const matchesSearch =
        !needle ||
        student.name?.toLowerCase().includes(needle) ||
        student.email?.toLowerCase().includes(needle) ||
        student.phone?.toLowerCase().includes(needle);
      const matchesStatus =
        statusFilter === "All" || (student.status || "Active") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, statusFilter]);

  const stats = useMemo(() => {
    const totalFees = rows.reduce((sum, row) => sum + Number(row.total_fees || 0), 0);
    const paidFees = rows.reduce((sum, row) => sum + Number(row.fees_paid || 0), 0);
    const pendingFees = Math.max(totalFees - paidFees, 0);
    const pendingStudents = rows.filter(
      (row) => Number(row.total_fees || 0) > Number(row.fees_paid || 0)
    ).length;
    return {
      total: rows.length,
      active: rows.filter((row) => (row.status || "Active") === "Active").length,
      batches: batches.length,
      paidFees,
      totalFees,
      pendingFees,
      pendingStudents,
    };
  }, [batches.length, rows]);

  const handleSave = (student, isEdit) => {
    setRows((current) =>
      isEdit
        ? current.map((row) => (row.id === student.id ? student : row))
        : [student, ...current]
    );
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;

    try {
      const api = getApi();
      await api.delete(`students/${student.id}/`);
      setRows((current) => current.filter((row) => row.id !== student.id));
    } catch (err) {
      console.error(err);
      alert("Error deleting student");
    }
  };

  const summarizeReminderResult = (data) => {
    if (data?.results) {
      return `Reminders sent for ${data.sent} of ${data.total_pending_students} pending students.`;
    }

    const channels = [];
    if (data?.email?.sent) channels.push("email");
    if (data?.whatsapp?.sent) channels.push("WhatsApp");
    return channels.length
      ? `Reminder sent by ${channels.join(" and ")}.`
      : data?.error || "Reminder could not be sent.";
  };

  const handleSendReminder = async (student) => {
    try {
      setSendingStudentId(student.id);
      const api = getApi();
      const res = await api.post(`students/${student.id}/send-fee-reminder/`);
      alert(summarizeReminderResult(res.data));
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.email?.error ||
          err.response?.data?.whatsapp?.error ||
          "Unable to send fee reminder."
      );
    } finally {
      setSendingStudentId(null);
    }
  };

  const handleSendAllReminders = async () => {
    try {
      setSendingAll(true);
      const api = getApi();
      const res = await api.post("students/send-pending-fee-reminders/");
      alert(summarizeReminderResult(res.data));
    } catch (err) {
      console.error(err);
      alert("Unable to send pending fee reminders.");
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              Student Management
            </div>
            <h1 className="mt-1 text-2xl font-bold">
              {loggedInFranchise?.name || "Students"}
            </h1>
          </div>

          <StudentDialog
            batches={batches}
            loggedInFranchise={loggedInFranchise}
            onSave={handleSave}
          />
          <Button
            variant="outline"
            onClick={handleSendAllReminders}
            disabled={sendingAll || stats.pendingStudents === 0}
          >
            <Send className="h-4 w-4" />
            {sendingAll ? "Sending..." : "Remind Pending Fees"}
          </Button>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-9 w-9 rounded-md bg-blue-50 p-2 text-blue-600" />
              <div>
                <div className="text-sm text-slate-500">Students</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <GraduationCap className="h-9 w-9 rounded-md bg-green-50 p-2 text-green-600" />
              <div>
                <div className="text-sm text-slate-500">Active</div>
                <div className="text-2xl font-bold">{stats.active}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Batches</div>
              <div className="text-2xl font-bold">{stats.batches}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Fees Collected</div>
              <div className="text-2xl font-bold">{formatINR(stats.paidFees)}</div>
              <div className="text-xs text-slate-500">of {formatINR(stats.totalFees)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Pending Fees</div>
              <div className="text-2xl font-bold">{formatINR(stats.pendingFees)}</div>
              <div className="text-xs text-slate-500">{stats.pendingStudents} students</div>
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden rounded-lg border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-lg">Student Directory</CardTitle>
              <div className="grid gap-3 sm:grid-cols-[260px_140px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search students"
                    className="pl-9"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Batches</th>
                    <th className="px-4 py-3">Fees</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((student) => {
                      const paid = Number(student.fees_paid || 0);
                      const total = Number(student.total_fees || 0);
                      const pending = Math.max(total - paid, 0);
                      const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

                      return (
                        <tr key={student.id} className="border-t hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-slate-500">ID: {student.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {student.email || "-"}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {student.phone || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {student.batch_names?.length ? student.batch_names.join(", ") : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {formatINR(paid)} / {formatINR(total)}
                            </div>
                            <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full bg-green-600"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusClass(student.status || "Active")}>
                              {student.status || "Active"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <StudentDialog
                                batches={batches}
                                loggedInFranchise={loggedInFranchise}
                                onSave={handleSave}
                                student={student}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(student)}
                                disabled={pending <= 0 || sendingStudentId === student.id}
                                aria-label="Send fee reminder"
                                title="Send fee reminder"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(student)}
                                aria-label="Delete student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
