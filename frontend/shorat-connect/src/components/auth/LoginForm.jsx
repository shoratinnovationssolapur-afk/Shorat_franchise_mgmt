import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/utils/apiBase";
import { AuthContext } from "@/pages/Admin/context/AuthContext";

export const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login: setAuthToken } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.removeItem("refresh_token");
        localStorage.setItem("role", data.role || role);
        localStorage.setItem("branch", data.branch ? JSON.stringify(data.branch) : "");
        localStorage.setItem("email", email);
        setAuthToken(data.access);

        toast({
          title: "Login Successful",
          description: data.message || "You are now logged in",
        });

        onLogin({
          email: data.email || email,
          name: data.name || data.display_name || "",
          role: data.role || role,
          branch: data.branch || "",
          token: data.access,
        });
      } else {
        toast({
          title: "Login Failed",
          description:
            data.error || data.detail || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden p-6 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=60')",
      }}
    >
      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

      <div className="relative z-10">
        {/* Background blobs */}
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-red-400/20 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-96 w-96 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center lg:justify-between gap-10">

          {/* Left content */}
          <div className="hidden max-w-lg text-white lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Smart Franchise Operations
            </div>

            <h1 className="text-5xl font-extrabold leading-tight">
              Manage branches, staff, and attendance in one place.
            </h1>

            <p className="mt-5 text-lg text-white/80">
              Secure role-based access for admins, franchise heads, and staff members.
            </p>
          </div>

          {/* Card */}
          <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">

            <CardHeader className="text-center flex flex-col items-center space-y-3 pb-4">
              
              {/* Logo */}
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md">
                <img src="favicon.ico" className="h-14 w-14 object-contain" />
              </div>

              <div>
                <CardTitle className="text-4xl font-extrabold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-white/70">
                  Sign in to continue
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Email */}
                <div>
                  <Label className="text-white/80">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-red-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label className="text-white/80">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-red-400"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-white/70"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <Label className="text-white/80">Role</Label>
                  <div className="relative mt-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-12 pl-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="franchise_head">Franchise Head</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
