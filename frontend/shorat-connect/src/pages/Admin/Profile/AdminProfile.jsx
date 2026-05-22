import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProfile() {
  const location = useLocation();
  const email = location.state?.email || "No email available";

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl border border-gray-200">
        <CardHeader className="bg-red-600 text-white rounded-t-2xl p-4">
          <CardTitle className="text-lg font-bold">Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700">
              A
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Admin User
              </h2>
              <p className="text-gray-500 text-sm">{email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-gray-600">Role</span>
              <span className="text-gray-900">Administrator</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
