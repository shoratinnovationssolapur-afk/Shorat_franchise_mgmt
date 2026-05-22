import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
;
import { getApi } from "@/utils/api";

function EventsWorkshop() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newEvent, setNewEvent] = useState({
    id: null,
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
  });

  const api = getApi();

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const res = await api.get("events/");
      const formatted = res.data.map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status.toLowerCase(),
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Failed to fetch events:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events by status and search term
  const filteredEvents = events.filter(
    (e) =>
      (status === "All" || e.status === status.toLowerCase()) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add or Update event
  const handleAddOrUpdateEvent = async () => {
    if (!newEvent.name || !newEvent.location || !newEvent.startDate || !newEvent.endDate) {
      alert("Please fill in all fields");
      return;
    }

    // Name & Location validation (allow letters, numbers, spaces, commas, dots, hyphens)
    const validPattern = /^[a-zA-Z0-9\s.,-]+$/;
    if (!validPattern.test(newEvent.name)) {
      alert("Event Name can only contain letters, numbers, spaces, commas, dots, and hyphens.");
      return;
    }
    if (!validPattern.test(newEvent.location)) {
      alert("Location can only contain letters, numbers, spaces, commas, dots, and hyphens.");
      return;
    }

    // Duplicate check
    const duplicate = events.some(
      (e, idx) =>
        e.name.toLowerCase() === newEvent.name.toLowerCase() &&
        e.startDate === newEvent.startDate &&
        e.endDate === newEvent.endDate &&
        idx !== editIndex
    );
    if (duplicate) {
      alert("An event with the same name and dates already exists!");
      return;
    }

    // Prevent end date before start date
    if (new Date(newEvent.endDate) < new Date(newEvent.startDate)) {
      alert("End date cannot be before start date!");
      return;
    }

    const payload = {
      name: newEvent.name,
      location: newEvent.location,
      start_date: newEvent.startDate,
      end_date: newEvent.endDate,
      status: newEvent.status.toLowerCase(),
    };

    try {
      let res;
      if (editIndex !== null) {
        const id = events[editIndex].id;
        res = await api.put(`events/${id}/`, payload);
      } else {
        res = await api.post("events/", payload);
      }

      const savedEvent = {
        id: res.data.id,
        name: res.data.name,
        location: res.data.location,
        startDate: res.data.start_date,
        endDate: res.data.end_date,
        status: res.data.status.toLowerCase(),
      };

      if (editIndex !== null) {
        setEvents((prev) => {
          const updated = [...prev];
          updated[editIndex] = savedEvent;
          return updated;
        });
      } else {
        setEvents((prev) => [...prev, savedEvent]);
      }

    
      setShowForm(false);
      setEditIndex(null);
      setNewEvent({
        id: null,
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        status: "upcoming",
      });
    } catch (err) {
      console.error("Error saving event:", err.response?.data || err.message);
      alert("Failed to save event!");
    }
  };

  // Delete event
  const handleDelete = async (index) => {
    const id = events[index].id;
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`events/${id}/`);
        setEvents((prev) => prev.filter((_, i) => i !== index));
      } catch (err) {
        console.error("Failed to delete event:", err.response?.data || err.message);
        alert("Failed to delete event!");
      }
    }
  };

  // Edit event
  const handleEdit = (index) => {
    setNewEvent({ ...events[index] });
    setEditIndex(index);
    setShowForm(true);
  };

  const today = new Date().toISOString().split("T")[0]; // today for min date

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-3xl font-bold">Events & Workshops</h2>
        <Button className="bg-red-600 w-full sm:w-auto" onClick={() => setShowForm(true)}>
          + Add Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-500 text-white shadow-lg">
          <CardHeader><CardTitle>Total Events</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{events.length}</CardContent>
        </Card>
        <Card className="bg-green-500 text-white shadow-lg">
          <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{events.filter(e => e.status === "upcoming").length}</CardContent>
        </Card>
        <Card className="bg-gray-500 text-white shadow-lg">
          <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{events.filter(e => e.status === "completed").length}</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-700 text-sm md:text-base">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? filteredEvents.map((event, i) => (
              <tr key={event.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{event.name}</td>
                <td className="p-3">{event.startDate}</td>
                <td className="p-3">{event.endDate}</td>
                <td className="p-3">{event.location}</td>
                <td className="p-3 capitalize">{event.status}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => handleEdit(i)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Event Name"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Start Date */}
              <div className="flex-1 flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={newEvent.startDate}
                  min={today}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                />
              </div>

              {/* End Date */}
              <div className="flex-1 flex flex-col">
                <label className="mb-1 font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={newEvent.endDate}
                  min={newEvent.startDate || today}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                />
              </div>
            </div>

            <Select
              onValueChange={(val) => setNewEvent({ ...newEvent, status: val.toLowerCase() })}
              value={newEvent.status.toLowerCase()}
            >
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleAddOrUpdateEvent}>
              {editIndex !== null ? "Update Event" : "Save Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventsWorkshop;
