import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApi } from "@/utils/api";
import { Package, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  franchise: "",
  quantity: 0,
  unit: "pcs",
  reorder_level: 0,
  notes: "",
};

export default function InventoryStock({ scope = "franchise" }) {
  const api = getApi();
  const isAdmin = scope === "admin";
  const [items, setItems] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("inventory/items/");
      setItems(Array.isArray(res.data) ? res.data : res.data?.results || []);
      setError("");
    } catch (err) {
      console.error("Failed to load inventory", err);
      setError("Failed to load inventory stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const loadFranchises = async () => {
      if (!isAdmin) return;
      try {
        const res = await api.get("franchise/");
        setFranchises(Array.isArray(res.data) ? res.data : res.data?.results || []);
      } catch (err) {
        console.error("Failed to load franchises", err);
      }
    };
    loadFranchises();
  }, [api, isAdmin]);

  const stats = useMemo(
    () => ({
      total: items.length,
      quantity: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      low: items.filter((item) => item.is_low_stock).length,
    }),
    [items]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      sku: item.sku || "",
      category: item.category || "",
      franchise: item.franchise || "",
      quantity: item.quantity ?? 0,
      unit: item.unit || "pcs",
      reorder_level: item.reorder_level ?? 0,
      notes: item.notes || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isAdmin && !form.franchise) {
      setError("Please select a franchise for this stock item.");
      return;
    }

    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      reorder_level: Number(form.reorder_level || 0),
    };
    if (!isAdmin) delete payload.franchise;

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`inventory/items/${editingId}/`, payload);
      } else {
        await api.post("inventory/items/", payload);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      console.error("Failed to save inventory", err);
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to save stock item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete stock item "${item.name}"?`)) return;
    try {
      await api.delete(`inventory/items/${item.id}/`);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      console.error("Failed to delete inventory", err);
      setError("Failed to delete stock item.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Package className="h-4 w-4 text-red-600" />
              Inventory
            </div>
            <h1 className="mt-1 text-2xl font-bold">Inventory Stock</h1>
          </div>
          <Button variant="outline" onClick={loadItems}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="rounded-lg">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Items</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Total Quantity</div>
              <div className="text-2xl font-bold">{stats.quantity}</div>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Low Stock</div>
              <div className="text-2xl font-bold text-red-600">{stats.low}</div>
            </CardContent>
          </Card>
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Stock Item" : "Add Stock Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
              <Input placeholder="Item name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
              <Input placeholder="SKU" value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} />
              <Input placeholder="Category" value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
              {isAdmin && (
                <select
                  value={form.franchise}
                  onChange={(e) => handleChange("franchise", e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">Select franchise</option>
                  {franchises.map((franchise) => (
                    <option key={franchise.id} value={franchise.id}>
                      {franchise.name}
                    </option>
                  ))}
                </select>
              )}
              <Input type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} />
              <Input placeholder="Unit" value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} />
              <Input type="number" min="0" placeholder="Reorder level" value={form.reorder_level} onChange={(e) => handleChange("reorder_level", e.target.value)} />
              <Input placeholder="Notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
              <div className="flex gap-2 md:col-span-4">
                <Button disabled={saving} type="submit">
                  {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingId ? "Save" : "Add"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Franchise</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reorder</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading stock...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No stock items found.</td></tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.sku || "-"}</div>
                        </td>
                        <td className="px-4 py-3">{item.franchise_name || "-"}</td>
                        <td className="px-4 py-3">{item.category || "-"}</td>
                        <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3">{item.reorder_level}</td>
                        <td className="px-4 py-3">
                          <Badge className={item.is_low_stock ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                            {item.is_low_stock ? "Low" : "In Stock"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              Edit
                            </Button>
                            <Button type="button" size="icon" variant="ghost" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
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
  );
}
