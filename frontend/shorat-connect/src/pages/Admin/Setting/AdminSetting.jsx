import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSetting({ onLogout = () => {} }) {
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL; // ✅ Use environment variable

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in to update password.");
      onLogout();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/accounts/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        onLogout();
      } else {
        alert(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-100 pt-10 sm:pt-16">
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-2xl lg:text-3xl font-bold text-black-600">
            Admin Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form autoComplete="off" className="space-y-6">
            {/* Hidden dummy fields to prevent autofill */}
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1"> 
                 Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm sm:text-base">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm sm:text-base">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              className="w-full text-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md shadow-md transition-all  sm:text-base"
              type="button"
              onClick={handlePasswordUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
