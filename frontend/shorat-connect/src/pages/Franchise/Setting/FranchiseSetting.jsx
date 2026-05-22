import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FranchiseSetting({ onLogout = () => {} }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in to update your password.");
      onLogout();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/accounts/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ FIXED: Backticks added here
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
    <div className="mt-8 flex justify-center items-start min-h-screen p-6 bg-gray-100">
      <Card className="w-full sm:w-4/5 md:w-3/5 lg:w-2/5 xl:w-1/3 shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="px-6 py-6">
          <CardTitle className="text-3xl font-bold text-center sm:text-left text-gray-800">
            Franchise Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-4">
          <form autoComplete="off" className="space-y-4">
            {/* Hidden dummy fields to prevent autofill */}
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="flex flex-col">
              <Label className="mb-2">Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="flex flex-col">
              <Label className="mb-2">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col">
              <Label className="mb-2">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md shadow-md transition-all"
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
