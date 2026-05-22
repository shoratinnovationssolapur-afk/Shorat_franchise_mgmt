// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Card, CardContent, CardHeader, CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
// } from "@/components/ui/dialog";

// const API_BASE = import.meta.env.VITE_API_URL;

// const BatchManagement = () => {
//   const [batches, setBatches] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingBatch, setEditingBatch] = useState(null);
//   const [batchForm, setBatchForm] = useState({
//     name: "",
//     students: "",
//     start: "",
//     end: "",
//     status: "Active",
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const token = localStorage.getItem("access_token");

//   const today = new Date().toISOString().split("T")[0]; // today's date in YYYY-MM-DD

//   // Fetch franchise info
//   const fetchFranchiseAndBatches = async () => {
//     if (!token) return setError("No access token found");
//     try {
//       const res = await axios.get(`${API_BASE}/api/franchise/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const franchiseName = res.data.name;
//       setBatchForm((prev) => ({ ...prev, franchise: franchiseName }));

//       const batchesRes = await axios.get(`${API_BASE}/api/batches/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setBatches(batchesRes.data);
//       setError(null);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//       setError("Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFranchiseAndBatches();
//   }, []);

//   const handleChange = (e) => setBatchForm({ ...batchForm, [e.target.name]: e.target.value });

//   const handleSave = async (e) => {
//     e.preventDefault();

//     // Prevent end date earlier than start date
//     if (new Date(batchForm.end) < new Date(batchForm.start)) {
//       setError("End date cannot be earlier than start date.");
//       return;
//     }

//     try {
//       if (editingBatch) {
//         await axios.put(`${API_BASE}/api/batches/${editingBatch.id}/`, batchForm, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axios.post(`${API_BASE}/api/batches/`, batchForm, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//       setBatchForm({ ...batchForm, name: "", students: "", start: "", end: "", status: "Active" });
//       setEditingBatch(null);
//       setDialogOpen(false);
//       fetchFranchiseAndBatches();
//     } catch (err) {
//       console.error("Failed to save batch:", err);
//       setError("Failed to save batch");
//     }
//   };

//   const handleEdit = (batch) => {
//     // Restrict start date to today or future even when editing
//     const startDate = batch.start < today ? today : batch.start;
//     const endDate = batch.end < startDate ? startDate : batch.end;

//     setEditingBatch(batch);
//     setBatchForm({ ...batch, start: startDate, end: endDate });
//     setDialogOpen(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API_BASE}/api/batches/${id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchFranchiseAndBatches();
//     } catch (err) {
//       console.error("Failed to delete batch:", err);
//       setError("Failed to delete batch");
//     }
//   };

//   if (loading) return <p>Loading batches...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div className="mt-6 p-6 space-y-6">
//       <h1 className="text-3xl font-bold mb-4">Franchise – My Batches</h1>

//       {/* Add/Edit Dialog */}
//       <div className="flex justify-end mb-4">
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-red-600 hover:bg-red-700 text-white">
//               {editingBatch ? "Edit Batch" : "Add Batch"}
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md w-full">
//             <DialogHeader>
//               <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleSave} className="space-y-4">
//               <Input name="name" value={batchForm.name} onChange={handleChange} placeholder="Batch Name" required />
//               <Input name="franchise" value={batchForm.franchise} readOnly placeholder="Franchise" />
//               <Input type="number" name="students" value={batchForm.students} onChange={handleChange} placeholder="Students" required />
              
//               <div>
//                 <label className="block mb-1 font-medium">Start Date</label>
//                 <Input
//                   type="date"
//                   name="start"
//                   value={batchForm.start}
//                   onChange={handleChange}
//                   min={today} // prevent past dates even in edit
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block mb-1 font-medium">End Date</label>
//                 <Input
//                   type="date"
//                   name="end"
//                   value={batchForm.end}
//                   onChange={handleChange}
//                   min={batchForm.start || today} // prevent end < start
//                   required
//                 />
//               </div>

//               <select
//                 name="status"
//                 value={batchForm.status}
//                 onChange={handleChange}
//                 className="w-full border p-2 rounded"
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>

//               <DialogFooter>
//                 <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
//                   Save
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Table */}
//       <Card className="shadow-lg rounded-2xl">
//         <CardHeader>
//           <CardTitle>My Franchise Batches</CardTitle>
//         </CardHeader>
//         <CardContent className="overflow-x-auto">
//           <table className="w-full min-w-[600px] border-collapse border border-gray-200 text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-3 py-2 text-left">Name</th>
//                 <th className="border px-3 py-2 text-left">Students</th>
//                 <th className="border px-3 py-2 text-left">Start</th>
//                 <th className="border px-3 py-2 text-left">End</th>
//                 <th className="border px-3 py-2 text-left">Status</th>
//                 <th className="border px-3 py-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {batches.length > 0 ? (
//                 batches.map((b) => (
//                   <tr key={b.id} className="hover:bg-gray-50">
//                     <td className="border px-3 py-2">{b.name}</td>
//                     <td className="border px-3 py-2">{b.students}</td>
//                     <td className="border px-3 py-2">{b.start}</td>
//                     <td className="border px-3 py-2">{b.end}</td>
//                     <td
//                       className={`border px-3 py-2 font-semibold ${
//                         b.status === "Active" ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {b.status}
//                     </td>
//                     <td className="border px-3 py-2 space-x-2">
//                       <Button size="sm" variant="outline" onClick={() => handleEdit(b)}>
//                         Edit
//                       </Button>
//                       <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>
//                         Delete
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center py-4 text-gray-500">
//                     No batches found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default BatchManagement;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_API_URL;

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [batchForm, setBatchForm] = useState({
    name: "",
    franchise: "", // <-- added this to store franchise name
    students: "",
    start: "",
    end: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("access_token");

  // Fetch franchise info and batches
  const fetchFranchiseAndBatches = async () => {
    if (!token) return setError("No access token found");
    try {
      // Fetch franchise
      // Fetch franchise
const res = await axios.get(`${API_BASE}/api/franchise/`, {
  headers: { Authorization: `Bearer ${token}` },
});

// ✅ FIX START
const loggedInEmail = localStorage.getItem("email"); // already saved by you
let franchiseName = "";

if (Array.isArray(res.data)) {
  const matchedFranchise = res.data.find(
    (f) => f.user_email === loggedInEmail
  );

  if (matchedFranchise) {
    franchiseName = matchedFranchise.name;
  }
}
// ✅ FIX END

setBatchForm((prev) => ({ ...prev, franchise: franchiseName }));


      // Fetch batches
      const batchesRes = await axios.get(`${API_BASE}/api/batches/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : batchesRes.data.results || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchiseAndBatches();
  }, []);

  const handleChange = (e) =>
    setBatchForm({ ...batchForm, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();

    // Prevent end date earlier than start date
    if (new Date(batchForm.end) < new Date(batchForm.start)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      if (editingBatch) {
        await axios.put(`${API_BASE}/api/batches/${editingBatch.id}/`, batchForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_BASE}/api/batches/`, batchForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Reset form but keep franchise
      setBatchForm((prev) => ({
        ...prev,
        name: "",
        students: "",
        start: "",
        end: "",
        status: "Active",
      }));
      setEditingBatch(null);
      setDialogOpen(false);
      fetchFranchiseAndBatches();
    } catch (err) {
      console.error("Failed to save batch:", err);
      setError("Failed to save batch");
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setBatchForm({ ...batch, franchise: batchForm.franchise });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/batches/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFranchiseAndBatches();
    } catch (err) {
      console.error("Failed to delete batch:", err);
      setError("Failed to delete batch");
    }
  };

  if (loading) return <p>Loading batches...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Franchise – My Batches</h1>

      {/* Add/Edit Dialog */}
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              {editingBatch ? "Edit Batch" : "Add Batch"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                name="name"
                value={batchForm.name}
                onChange={handleChange}
                placeholder="Batch Name"
                required
              />
              <Input
                name="franchise"
                value={batchForm.franchise}
                readOnly
                placeholder="Franchise"
              />
              <Input
                type="number"
                name="students"
                value={batchForm.students}
                onChange={handleChange}
                placeholder="Students"
                required
              />

              <div>
                <label className="block mb-1 font-medium">Start Date</label>
                <Input
                  type="date"
                  name="start"
                  value={batchForm.start}
                  onChange={handleChange}
                  min="2000-01-01"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">End Date</label>
                <Input
                  type="date"
                  name="end"
                  value={batchForm.end}
                  onChange={handleChange}
                  min={batchForm.start || "2000-01-01"}
                  required
                />
              </div>

              <select
                name="status"
                value={batchForm.status}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <DialogFooter>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>My Franchise Batches</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Name</th>
                <th className="border px-3 py-2 text-left">Students</th>
                <th className="border px-3 py-2 text-left">Start</th>
                <th className="border px-3 py-2 text-left">End</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{b.name}</td>
                    <td className="border px-3 py-2">{b.students}</td>
                    <td className="border px-3 py-2">{b.start}</td>
                    <td className="border px-3 py-2">{b.end}</td>
                    <td className={`border px-3 py-2 font-semibold ${b.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                      {b.status}
                    </td>
                    <td className="border px-3 py-2 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(b)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>
                        Delete
                      </Button>
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
