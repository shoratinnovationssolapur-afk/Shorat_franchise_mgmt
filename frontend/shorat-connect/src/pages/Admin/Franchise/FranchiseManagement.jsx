// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
// Card,
// CardContent,
// CardDescription,
// CardHeader,
// CardTitle,
// } from "@/components/ui/card";
// import {
// Table,
// TableBody,
// TableCell,
// TableHead,
// TableHeader,
// TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
// Dialog,
// DialogContent,
// DialogHeader,
// DialogTitle,
// DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
// Select,
// SelectContent,
// SelectItem,
// SelectTrigger,
// SelectValue,
// } from "@/components/ui/select";
// import { getApi } from "@/utils/api";
// import { Eye, EyeOff } from "lucide-react";

// export default function FranchiseManagementWrapper() {
// const [activePage, setActivePage] = useState({
// page: "franchise",
// franchise: null,
// });

// return (
// <>
// {activePage.page === "franchise" && ( <FranchiseManagement setActivePage={setActivePage} />
// )}
// </>
// );
// }

// function FranchiseManagement({ setActivePage }) {
// const [search, setSearch] = useState("");
// const [statusFilter, setStatusFilter] = useState("All");
// const [selectedFranchise, setSelectedFranchise] = useState(null);
// const [open, setOpen] = useState(false);
// const [showPassword, setShowPassword] = useState(false);

// // Form State
// const [name, setName] = useState("");
// const [location, setLocation] = useState("");
// const [startDate, setStartDate] = useState("");
// const [status, setStatus] = useState("");
// const [email, setEmail] = useState("");
// const [password, setPassword] = useState("");

// // Backend data
// const [franchises, setFranchises] = useState([]);

// // Fetch franchises
// const fetchFranchises = async () => {
// try {
// const api = getApi();
// const res = await api.get("add-franchise/franchise/");
// setFranchises(res.data.results || res.data || []);
// } catch (err) {
// console.error("Fetch error:", err);
// setFranchises([]);
// }
// };

// useEffect(() => {
// fetchFranchises();
// }, []);

// // Save or Update franchise
// const handleSave = async () => {
// const nameRegex = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/;
// const locationRegex = /^(?=.*[A-Za-z])[A-Za-z0-9\s,.'-]+$/;
// const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$/;
// const passwordRegex = /^[A-Za-z0-9]{6,}$/;


// // ✅ Validation
// if (!nameRegex.test(name)) {
//   alert(
//     "Franchise Name must contain at least one letter and can only include letters and numbers (no spaces or special characters)."
//   );
//   return;
// }

// if (!emailRegex.test(email)) {
//   alert("Enter a valid email address in lowercase only.");
//   return;
// }

// if (!location) {
//   alert("Location is required.");
//   return;
// }

// if (!locationRegex.test(location)) {
//   alert(
//     "Location must contain at least one letter and can include letters, numbers, spaces, commas, periods, hyphens, and apostrophes."
//   );
//   return;
// }

// if (!startDate) {
//   alert("Start Date is required.");
//   return;
// }

// if (!status) {
//   alert("Status is required.");
//   return;
// }

// // ✅ Password validation (only when adding or changing password)
// if (!selectedFranchise || password) {
//   if (!password) {
//     alert("Password is required for new franchise.");
//     return;
//   }

//   if (!/^[A-Z]/.test(password)) {
//     alert("First letter of password must be uppercase.");
//     return;
//   }

//   if (!passwordRegex.test(password)) {
//     alert(
//       "Password must be at least 6 characters long and contain only letters and numbers (no spaces)."
//     );
//     return;
//   }
// }

// try {
//   const api = getApi();

//   if (!selectedFranchise) {
//     // Create new franchise
//     const payload = {
//       name,
//       location,
//       email: email.toLowerCase(),
//       password: password || "123456",
//       start_date: startDate,
//       status,
//     };

//     const res = await api.post("add-franchise/franchise/", payload);
//     if (res.data?.id) setFranchises([res.data, ...franchises]);
//     else await fetchFranchises();

//     alert(
//       `Franchise added successfully! Default password: ${
//         password || "123456"
//       }`
//     );
//   } else {
//     // Update existing
//     const payload = {
//       name,
//       location,
//       start_date: startDate,
//       status,
//     };
//     if (email && email !== selectedFranchise.email)
//       payload.email = email.toLowerCase();
//     if (password) payload.password = password;

//     await api.patch(
//       `add-franchise/franchise/${encodeURIComponent(
//         selectedFranchise.name
//       )}/`,
//       payload
//     );
//     await fetchFranchises();
//     alert("Franchise updated successfully!");
//   }

//   // Reset form
//   setName("");
//   setLocation("");
//   setEmail("");
//   setPassword("");
//   setStartDate("");
//   setStatus("");
//   setSelectedFranchise(null);
//   setOpen(false);
//   setShowPassword(false);
// } catch (err) {
//   console.error("Save error:", err.response?.data || err.message);
//   const errorMsg =
//     err.response?.data?.email ||
//     err.response?.data?.detail ||
//     "An error occurred while saving. Please check the data and try again.";
//   alert(errorMsg);
// }


// };

// const handleDelete = async (name) => {
// if (window.confirm("Are you sure you want to delete this franchise?")) {
// try {
// const api = getApi();
// await api.delete(`add-franchise/franchise/${encodeURIComponent(name)}/`);
// setFranchises((prev) => prev.filter((f) => f.name !== name));
// if (selectedFranchise?.name === name) setSelectedFranchise(null);
// } catch (err) {
// console.error("Delete error:", err.response?.data || err.message);
// alert(err.response?.data?.detail || "Failed to delete franchise.");
// }
// }
// };

// const handleToggleStatus = async (franchise) => {
// const updatedStatus = franchise.status === "active" ? "inactive" : "active";
// try {
// const api = getApi();
// await api.patch(
// `add-franchise/franchise/${encodeURIComponent(franchise.name)}/`,
// { status: updatedStatus }
// );
// setFranchises((prev) =>
// prev.map((f) =>
// f.id === franchise.id ? { ...f, status: updatedStatus } : f
// )
// );
// } catch (err) {
// console.error("Status toggle error:", err);
// }
// };

// const filteredFranchises = franchises.filter((f) => {
// const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
// const matchesStatus =
// statusFilter === "All" || f.status === statusFilter.toLowerCase();
// return matchesSearch && matchesStatus;
// });

// return ( <div className="p-4 md:p-6"> <h1 className="text-3xl font-bold mb-4 text-left">Franchise Management</h1>

// ```
//   {/* Stats */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//     <Card>
//       <CardHeader>
//         <CardTitle>Total Franchises</CardTitle>
//         <CardDescription>All registered franchises</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">{franchises.length}</p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader>
//         <CardTitle>Active</CardTitle>
//         <CardDescription>Currently running</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">
//           {franchises.filter((f) => f.status === "active").length}
//         </p>
//       </CardContent>
//     </Card>

//     <Card>
//       <CardHeader>
//         <CardTitle>Inactive</CardTitle>
//         <CardDescription>Not in operation</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <p className="text-2xl font-bold">
//           {franchises.filter((f) => f.status === "inactive").length}
//         </p>
//       </CardContent>
//     </Card>
//   </div>

//   {/* Search & Filter */}
//   <div className="flex flex-col md:flex-row gap-3 mb-4">
//     <Input
//       placeholder="Search franchise..."
//       value={search}
//       onChange={(e) => setSearch(e.target.value)}
//       className="w-full md:w-1/3"
//     />
//     <select
//       value={statusFilter}
//       onChange={(e) => setStatusFilter(e.target.value)}
//       className="border rounded px-3 py-2 w-full md:w-auto"
//     >
//       <option value="All">All</option>
//       <option value="active">Active</option>
//       <option value="inactive">Inactive</option>
//     </select>
//     <Button
//       className="bg-red-600 text-white hover:bg-red-500 w-full md:w-auto md:ml-auto"
//       onClick={() => {
//         setOpen(true);
//         setSelectedFranchise(null);
//         setName("");
//         setLocation("");
//         setStartDate("");
//         setStatus("");
//         setEmail("");
//         setPassword("");
//       }}
//     >
//       + Add Franchise
//     </Button>
//   </div>

//   {/* Table */}
//   <div className="overflow-x-auto">
//     <Table className="min-w-full">
//       <TableHeader>
//         <TableRow>
//           <TableHead>Name</TableHead>
//           <TableHead>Location</TableHead>
//           <TableHead>Start Date</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Action</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {filteredFranchises.map((f) => (
//           <TableRow key={f.id || f.name}>
//             <TableCell>{f.name}</TableCell>
//             <TableCell>{f.location}</TableCell>
//             <TableCell>{f.start_date}</TableCell>
//             <TableCell>
//               <span
//                 onClick={() => handleToggleStatus(f)}
//                 className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
//                   f.status === "active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-gray-200 text-gray-600"
//                 }`}
//               >
//                 {f.status}
//               </span>
//             </TableCell>
//             <TableCell className="flex flex-col sm:flex-row gap-2">
//               <Button
//                 size="sm"
//                 className="bg-blue-500 hover:bg-blue-600 text-white"
//                 onClick={() => {
//                   setSelectedFranchise(f);
//                   setName(f.name);
//                   setEmail(f.user_email || f.email || "");
//                   setPassword("");
//                   setLocation(f.location);
//                   setStartDate(f.start_date);
//                   setStatus(f.status);
//                   setOpen(true);
//                 }}
//               >
//                 Edit
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-red-600 hover:bg-red-500 text-white"
//                 onClick={() => handleDelete(f.name)}
//               >
//                 Delete
//               </Button>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </div>

//   {/* Modal */}
//   <Dialog open={open} onOpenChange={setOpen}>
//     <DialogContent className="sm:max-w-lg">
//       <DialogHeader>
//         <DialogTitle>
//           {selectedFranchise ? "Edit Franchise" : "Add Franchise"}
//         </DialogTitle>
//       </DialogHeader>

//       <form
//         className="space-y-2"
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSave();
//         }}
//       >
//         <div>
//           <Label>Franchise Name</Label>
//           <Input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter name"
//             required
//           />
//         </div>

//         <div>
//           <Label>Email</Label>
//           <Input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter email"
//             required
//           />
//         </div>

//         <div className="relative">
//           <Label>Password</Label>
//           <div className="relative">
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder={
//                 selectedFranchise
//                   ? "Leave blank to keep current password"
//                   : "Enter password (leave blank for default: 123456)"
//               }
//               className="pr-10"
//             />
//             <span
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </span>
//           </div>
//         </div>

//         <div>
//           <Label>Location</Label>
//           <Input
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             placeholder="Enter location"
//             required
//           />
//         </div>

//         <div>
//           <Label>Start Date</Label>
//           <Input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <Label>Status</Label>
//           <Select value={status} onValueChange={setStatus}>
//             <SelectTrigger>
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="inactive">Inactive</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <DialogFooter>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setOpen(false)}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" className="bg-green-600 text-white">
//             Save
//           </Button>
//         </DialogFooter>
//       </form>
//     </DialogContent>
//   </Dialog>
// </div>


// );
// }
// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Eye, EyeOff } from "lucide-react";

// const API_BASE = import.meta.env.VITE_API_URL;

// export default function FranchiseManagementWrapper() {
//   const [activePage, setActivePage] = useState({
//     page: "franchise",
//     franchise: null,
//   });

//   return (
//     <>
//       {activePage.page === "franchise" && (
//         <FranchiseManagement setActivePage={setActivePage} />
//       )}
//     </>
//   );
// }

// function FranchiseManagement({ setActivePage }) {
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [selectedFranchise, setSelectedFranchise] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // Form State
//   const [name, setName] = useState("");
//   const [location, setLocation] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [status, setStatus] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // Backend data
//   const [franchises, setFranchises] = useState([]);

//   const token = localStorage.getItem("access_token");

//   // Fetch franchises
//   const fetchFranchises = async () => {
//     try {
//       console.log("Fetching franchises...");
//       const res = await fetch(`${API_BASE}/add-franchise/franchise/`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       console.log("Fetched franchises:", data);
//       setFranchises(data.results || data || []);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setFranchises([]);
//     }
//   };

//   useEffect(() => {
//     fetchFranchises();
//   }, []);

//   // Save or Update franchise
//   const handleSave = async () => {
//     const payload = {
//       name,
//       location,
//       email: email.toLowerCase(),
//       password: password || "123456",
//       start_date: startDate,
//       status,
//     };

//     console.log("Payload to save franchise:", payload);

//     try {
//       let res;
//       if (!selectedFranchise) {
//         // Create new franchise
//         res = await fetch(`${API_BASE}/add-franchise/franchise/`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         });
//       } else {
//         // Update existing
//         const updatePayload = {
//           name,
//           location,
//           start_date: startDate,
//           status,
//         };
//         if (email && email !== selectedFranchise.email)
//           updatePayload.email = email.toLowerCase();
//         if (password) updatePayload.password = password;

//         console.log("Update payload:", updatePayload);

//         res = await fetch(
//           `${API_BASE}/add-franchise/franchise/${encodeURIComponent(
//             selectedFranchise.name
//           )}/`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(updatePayload),
//           }
//         );
//       }

//       const data = await res.json();
//       console.log("Response from API:", res.status, data);

//       if (!res.ok) throw new Error(data.detail || "Failed to save franchise");

//       await fetchFranchises();

//       alert(
//         !selectedFranchise
//           ? `Franchise added successfully! Default password: ${
//               password || "123456"
//             }`
//           : "Franchise updated successfully!"
//       );

//       // Reset form
//       setName("");
//       setLocation("");
//       setEmail("");
//       setPassword("");
//       setStartDate("");
//       setStatus("");
//       setSelectedFranchise(null);
//       setOpen(false);
//       setShowPassword(false);
//     } catch (err) {
//       console.error("Save error full:", err);
//       alert(err.message || "Failed to save franchise");
//     }
//   };

//   const handleDelete = async (name) => {
//     if (!window.confirm("Are you sure you want to delete this franchise?"))
//       return;
//     try {
//       const res = await fetch(
//         `${API_BASE}/add-franchise/franchise/${encodeURIComponent(name)}/`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const data = await res.json().catch(() => ({}));
//       console.log("Delete response:", res.status, data);

//       if (!res.ok) throw new Error(data.detail || "Failed to delete franchise");

//       setFranchises((prev) => prev.filter((f) => f.name !== name));
//       if (selectedFranchise?.name === name) setSelectedFranchise(null);
//     } catch (err) {
//       console.error("Delete error full:", err);
//       alert(err.message || "Failed to delete franchise");
//     }
//   };

//   const handleToggleStatus = async (franchise) => {
//     const updatedStatus = franchise.status === "active" ? "inactive" : "active";
//     try {
//       const res = await fetch(
//         `${API_BASE}/add-franchise/franchise/${encodeURIComponent(
//           franchise.name
//         )}/`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status: updatedStatus }),
//         }
//       );
//       const data = await res.json();
//       console.log("Toggle status response:", res.status, data);

//       if (!res.ok) throw new Error(data.detail || "Failed to toggle status");

//       setFranchises((prev) =>
//         prev.map((f) =>
//           f.id === franchise.id ? { ...f, status: updatedStatus } : f
//         )
//       );
//     } catch (err) {
//       console.error("Status toggle error:", err);
//     }
//   };

//   const filteredFranchises = franchises.filter((f) => {
//     const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
//     const matchesStatus =
//       statusFilter === "All" || f.status === statusFilter.toLowerCase();
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="p-4 md:p-6">
//       <h1 className="text-3xl font-bold mb-4 text-left">Franchise Management</h1>

//       {/* Add Franchise Button */}
//       <div className="flex flex-col md:flex-row gap-3 mb-4">
//         <Input
//           placeholder="Search franchise..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-1/3"
//         />
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border rounded px-3 py-2 w-full md:w-auto"
//         >
//           <option value="All">All</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//         <Button
//           className="bg-red-600 text-white hover:bg-red-500 w-full md:w-auto md:ml-auto"
//           onClick={() => {
//             setOpen(true);
//             setSelectedFranchise(null);
//             setName("");
//             setLocation("");
//             setStartDate("");
//             setStatus("");
//             setEmail("");
//             setPassword("");
//           }}
//         >
//           + Add Franchise
//         </Button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <Table className="min-w-full">
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Location</TableHead>
//               <TableHead>Start Date</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Action</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredFranchises.map((f) => (
//               <TableRow key={f.id || f.name}>
//                 <TableCell>{f.name}</TableCell>
//                 <TableCell>{f.location}</TableCell>
//                 <TableCell>{f.start_date}</TableCell>
//                 <TableCell>
//                   <span
//                     onClick={() => handleToggleStatus(f)}
//                     className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
//                       f.status === "active"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-gray-200 text-gray-600"
//                     }`}
//                   >
//                     {f.status}
//                   </span>
//                 </TableCell>
//                 <TableCell className="flex flex-col sm:flex-row gap-2">
//                   <Button
//                     size="sm"
//                     className="bg-blue-500 hover:bg-blue-600 text-white"
//                     onClick={() => {
//                       setSelectedFranchise(f);
//                       setName(f.name);
//                       setEmail(f.user_email || f.email || "");
//                       setPassword("");
//                       setLocation(f.location);
//                       setStartDate(f.start_date);
//                       setStatus(f.status);
//                       setOpen(true);
//                     }}
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     size="sm"
//                     className="bg-red-600 hover:bg-red-500 text-white"
//                     onClick={() => handleDelete(f.name)}
//                   >
//                     Delete
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {selectedFranchise ? "Edit Franchise" : "Add Franchise"}
//             </DialogTitle>
//           </DialogHeader>

//           <form
//             className="space-y-2"
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSave();
//             }}
//           >
//             <div>
//               <Label>Franchise Name</Label>
//               <Input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter name"
//                 required
//               />
//             </div>

//             <div>
//               <Label>Email</Label>
//               <Input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter email"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <Label>Password</Label>
//               <div className="relative">
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder={
//                     selectedFranchise
//                       ? "Leave blank to keep current password"
//                       : "Enter password (leave blank for default: 123456)"
//                   }
//                   className="pr-10"
//                 />
//                 <span
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </span>
//               </div>
//             </div>

//             <div>
//               <Label>Location</Label>
//               <Input
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 placeholder="Enter location"
//                 required
//               />
//             </div>

//             <div>
//               <Label>Start Date</Label>
//               <Input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label>Status</Label>
//               <Select value={status} onValueChange={setStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" className="bg-green-600 text-white">
//                 Save
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function FranchiseManagementWrapper() {
  const [activePage, setActivePage] = useState({ page: "franchise" });
  return <>{activePage.page === "franchise" && <FranchiseManagement />}</>;
}

function FranchiseManagement() {
  const [franchises, setFranchises] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [officeLatitude, setOfficeLatitude] = useState("");
  const [officeLongitude, setOfficeLongitude] = useState("");
  const [officeRadiusMeters, setOfficeRadiusMeters] = useState("100");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState("active");
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("access_token");

  // ------------------ Fetch franchises ------------------
  const fetchFranchises = async () => {
    if (!token) {
      console.error("No access token found in localStorage!");
      return;
    }

    try {
      console.log("Fetching franchises from API...");
      const res = await fetch(`${API_BASE}/api/franchise/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Fetch failed with status:", res.status);
        const text = await res.text();
        console.error("Response text:", text);
        setFranchises([]);
        return;
      }

      const data = await res.json();
      const franchiseList = Array.isArray(data) ? data : data.results || [];
      console.log("Fetched franchises:", franchiseList);
      setFranchises(franchiseList);
    } catch (err) {
      console.error("Error fetching franchises:", err);
      setFranchises([]);
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  // ------------------ Add or Update franchise ------------------
  const handleSave = async () => {
    if (!name || !email || !location || !startDate || !status) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name,
      email: email.toLowerCase(),
      password: password || "123456",
      location,
      office_latitude: officeLatitude || null,
      office_longitude: officeLongitude || null,
      office_radius_meters: Number(officeRadiusMeters || 100),
      start_date: startDate,
      status,
    };

    try {
      console.log(selectedFranchise ? "Updating franchise..." : "Adding new franchise...");
      console.log("Payload:", payload);

      let res;
      if (!selectedFranchise) {
        res = await fetch(`${API_BASE}/api/franchise/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        const updatePayload = {
          name,
          location,
          office_latitude: officeLatitude || null,
          office_longitude: officeLongitude || null,
          office_radius_meters: Number(officeRadiusMeters || 100),
          start_date: startDate,
          status,
        };
        if (email !== selectedFranchise.user_email) updatePayload.email = email;
        if (password) updatePayload.password = password;

        res = await fetch(`${API_BASE}/api/franchise/${selectedFranchise.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });
      }

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        alert("Failed to save franchise: " + JSON.stringify(data));
        return;
      }

      await fetchFranchises();
      setOpen(false);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setLocation("");
      setOfficeLatitude("");
      setOfficeLongitude("");
      setOfficeRadiusMeters("100");
      setStartDate("");
      setStatus("active");
      setSelectedFranchise(null);

      alert(selectedFranchise ? "Franchise updated!" : `Franchise added! Default password: ${password || "123456"}`);
    } catch (err) {
      console.error("Error saving franchise:", err);
      alert("Failed to save franchise. Check console for details.");
    }
  };

  // ------------------ Delete franchise ------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this franchise?")) return;
    try {
      console.log("Deleting franchise id:", id);
      const res = await fetch(`${API_BASE}/api/franchise/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete failed:", text);
        throw new Error("Delete failed");
      }

      setFranchises(franchises.filter((f) => f.id !== id));
      console.log("Franchise deleted successfully");
    } catch (err) {
      console.error("Error deleting franchise:", err);
      alert(err.message || "Failed to delete franchise");
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Franchise Management</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Button
          className="bg-red-600 text-white hover:bg-red-500 w-full md:w-auto md:ml-auto"
          onClick={() => {
            setSelectedFranchise(null);
            setName("");
            setEmail("");
            setPassword("");
            setLocation("");
            setOfficeLatitude("");
            setOfficeLongitude("");
            setOfficeRadiusMeters("100");
            setStartDate("");
            setStatus("active");
            setOpen(true);
          }}
        >
          + Add Franchise
        </Button>
      </div>

      <div className="overflow-x-auto">
        {franchises.length === 0 ? (
          <p className="text-gray-500">No franchises found.</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Office Geofence</th>
                <th className="border px-4 py-2">Start Date</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {franchises?.map((f) => (
                <tr key={f.id}>
                  <td className="border px-4 py-2">{f.name}</td>
                  <td className="border px-4 py-2">{f.user_email || "-"}</td>
                  <td className="border px-4 py-2">{f.location || "-"}</td>
                  <td className="border px-4 py-2">
                    {f.office_latitude && f.office_longitude
                      ? `${f.office_latitude}, ${f.office_longitude} (${f.office_radius_meters || 100}m)`
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">{f.start_date || "-"}</td>
                  <td className="border px-4 py-2">{f.status || "-"}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        setSelectedFranchise(f);
                        setName(f.name);
                        setEmail(f.user_email);
                        setPassword("");
                        setLocation(f.location);
                        setOfficeLatitude(f.office_latitude || "");
                        setOfficeLongitude(f.office_longitude || "");
                        setOfficeRadiusMeters(String(f.office_radius_meters || 100));
                        setStartDate(f.start_date);
                        setStatus(f.status);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-500 text-white"
                      onClick={() => handleDelete(f.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFranchise ? "Edit Franchise" : "Add Franchise"}</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div>
              <Label>Franchise Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="relative">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={selectedFranchise ? "Leave blank to keep current" : "Default: 123456"}
                  className="pr-10"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label>Office Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={officeLatitude}
                  onChange={(e) => setOfficeLatitude(e.target.value)}
                  placeholder="17.6599"
                />
              </div>
              <div>
                <Label>Office Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={officeLongitude}
                  onChange={(e) => setOfficeLongitude(e.target.value)}
                  placeholder="75.9064"
                />
              </div>
              <div>
                <Label>Radius (meters)</Label>
                <Input
                  type="number"
                  min="1"
                  value={officeRadiusMeters}
                  onChange={(e) => setOfficeRadiusMeters(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 text-white">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
