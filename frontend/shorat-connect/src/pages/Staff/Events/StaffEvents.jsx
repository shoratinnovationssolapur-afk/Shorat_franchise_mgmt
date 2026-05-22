import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getApi } from "@/utils/api";

export default function StaffEvents() {
  const api = getApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("events/");
        const mapped = (res.data || []).map((e) => ({
          id: e.id,
          name: e.name,
          location: e.location,
          startDate: e.start_date,
          endDate: e.end_date,
          status: e.status,
        }));
        setEvents(mapped);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch events", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(
    (e) => (status === "All" || e.status === status) && (e.name?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <p className="p-4">Loading events...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Events & Workshops</h1>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Input placeholder="Search by name or location" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Start</th>
                  <th className="p-2 text-left">End</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((ev) => (
                    <tr key={ev.id} className="border-t">
                      <td className="p-2">{ev.name}</td>
                      <td className="p-2">{ev.startDate}</td>
                      <td className="p-2">{ev.endDate}</td>
                      <td className="p-2">{ev.location}</td>
                      <td className="p-2">{ev.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">No events found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
