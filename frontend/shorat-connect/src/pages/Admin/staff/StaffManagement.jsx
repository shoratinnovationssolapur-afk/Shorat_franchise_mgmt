import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// ===================== API Helper =====================
const getApi = () => {
  const token = localStorage.getItem("access_token");
  return axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// ===================== Staff Dialog =====================
const StaffDialog = ({ open, onClose, onSubmit, staffData, franchises }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    salary: "",
    franchise: franchises?.[0]?.id || "",
    status: "Active",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (staffData) {
      setFormData({
        name: staffData.name || "",
        email: staffData.email?.toLowerCase() || "",
        password: "",
        phone: staffData.phone || "",
        salary: staffData.salary || "",
        franchise: staffData.franchise || franchises?.[0]?.id || "",
        status: staffData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        salary: "",
        franchise: franchises?.[0]?.id || "",
        status: "Active",
      });
    }
  }, [staffData, franchises, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: digitsOnly });
    } else if (name === "email") {
      setFormData({ ...formData, [name]: value.toLowerCase() });
    } else if (name === "name") {
      // Only letters and spaces allowed
      const cleanName = value.replace(/[^A-Za-z ]/g, "");
      setFormData({ ...formData, [name]: cleanName });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const { name, email, password, phone, salary, franchise, status } = formData;

    // Required fields
    const requiredFields = ["name", "email", "phone", "salary", "franchise", "status"];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    // Name validation
    if (name.length > 50) {
      alert("Name cannot exceed 50 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    // Salary validation
    if (isNaN(salary) || Number(salary) <= 0 || salary.toString().length > 9) {
      alert("Salary must be a positive number with max 9 digits");
      return;
    }

    // Password validation (new or changed)
    if (!staffData || password.trim() !== "") {
      if (password.length !== 6) {
        alert("Password must be exactly 6 characters long");
        return;
      }
      if (password[0] !== password[0].toUpperCase()) {
        alert("Password must start with an uppercase letter");
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        franchise: Number(franchise),
        salary: Number(salary),
        role: "Staff",
      };

      if (staffData && !password.trim()) delete payload.password;

      await onSubmit(payload);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        salary: "",
        franchise: franchises?.[0]?.id || "",
        status: "Active",
      });

      onClose();
    } catch (error) {
      console.error("Error submitting staff:", error);
      if (error.response) {
        alert("Backend error:\n" + JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staffData ? "Edit Staff" : "Add Staff"}</DialogTitle>
        </DialogHeader>

        {!franchises.length ? (
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600">
              Please add a franchise first. Staff must be assigned to a franchise.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} autoComplete="off" placeholder="Letters and spaces only" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" placeholder="example@mail.com" />
          </div>
<div className="relative">
  <Label>Password</Label>
  <Input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    onChange={handleChange}
    autoComplete="new-password"
    placeholder={staffData ? "Leave blank to keep current password" : "6 chars, first uppercase"}
    className="pr-10 h-10" // Set a fixed height
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2 inset-y-0 flex items-center justify-center text-gray-500 mt-5"
  >
    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>




          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="off"
              maxLength={10}
              placeholder="10 digits only"
            />
          </div>
          <div>
            <Label>Salary</Label>
            <Input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Positive number" />
          </div>
          <div>
            <Label>Status</Label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-md p-2">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label>Franchise</Label>
            <select name="franchise" value={formData.franchise} onChange={handleChange} className="w-full border rounded-md p-2">
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{staffData ? "Update Staff" : "Add Staff"}</Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ===================== Staff Management =====================
const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [franchises, setFranchises] = useState([]);

  const api = getApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, sRes] = await Promise.all([
          api.get("franchise/"),
          api.get("staff/"),
        ]);
        setFranchises(fRes.data);
        setStaffList(sRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Are you logged in?");
      }
    };
    fetchData();
  }, []);

  const handleAddStaff = async (staffData) => {
    const res = await api.post("staff/", staffData);
    setStaffList((prev) => [...prev, res.data]);
    return res.data;
  };

  const handleUpdateStaff = async (staffData) => {
    const res = await api.put(`staff/${editingStaff.id}/`, staffData);
    setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? res.data : s)));
    setEditingStaff(null);
    toast.success("Staff updated successfully.");
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}?`)) return;
    await api.delete(`staff/${staff.id}/`);
    setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesStatus = statusFilter === "All" || staff.status === statusFilter;
    const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="p-4 shadow-lg w-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <CardTitle className="text-3xl font-bold">Staff Management</CardTitle>
        <Button onClick={() => { setEditingStaff(null); setDialogOpen(true); }}>
          + Add Staff
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm w-full sm:w-auto"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Salary</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Franchise</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{staff.name}</td>
                  <td className="p-2">{staff.phone}</td>
                  <td className="p-2">₹{staff.salary}</td>
                  <td className="p-2">
                    <Badge className={staff.status === "Active" ? "bg-green-500" : "bg-red-500"}>
                      {staff.status}
                    </Badge>
                  </td>
                  <td className="p-2">{staff.franchise_name || staff.franchise?.name || ""}</td>
                  <td className="p-2 flex flex-col sm:flex-row gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingStaff(staff); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteStaff(staff)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <StaffDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}
        staffData={editingStaff}
        franchises={franchises}
      />
    </Card>
  );
};

export default StaffManagement;
