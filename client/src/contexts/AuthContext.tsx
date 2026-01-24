import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "student" | "member" | null;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, type?: "admin" | "student" | "member") => Promise<{ success: boolean; error?: string }>;
  signup: (data: StudentRegistrationData | MemberRegistrationData) => Promise<{ success: boolean; error?: string; registrationNumber?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
  isMember: boolean;
  forgotPassword: (email: string, type: "student" | "member") => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string, type: "student" | "member") => Promise<{ success: boolean; error?: string }>;
}

interface MemberRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city?: string;
}

interface StudentRegistrationData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  city?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  class: string;
  feeLevel?: string;
  photoUrl?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        let data;
        try {
          const text = await res.text();
          if (!text) throw new Error("Empty response");
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse current user response:", parseError);
          localStorage.removeItem("auth_token");
          setToken(null);
          setIsLoading(false);
          return;
        }

        setUser({
          id: data._id || data.id,
          email: data.email,
          role: data.role,
          name: data.name || data.fullName,
        });
      } else {
        localStorage.removeItem("auth_token");
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      localStorage.removeItem("auth_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, type: "admin" | "student" | "member" = "student"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const endpoints: Record<string, string> = {
        admin: "/api/auth/admin/login",
        student: "/api/auth/student/login",
        member: "/api/auth/member/login",
      };
      const endpoint = endpoints[type] || endpoints.student;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        const text = await res.text();
        if (!text) {
          setIsLoading(false);
          return { success: false, error: "Server returned empty response" };
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse login response:", parseError);
        setIsLoading(false);
        return { success: false, error: "Invalid response from server" };
      }

      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || "Login failed" };
      }

      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      });
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error?.message || "Network error" };
    }
  };

  const signup = async (data: StudentRegistrationData | MemberRegistrationData): Promise<{ success: boolean; error?: string; registrationNumber?: string }> => {
    setIsLoading(true);
    try {
      const isMember = 'city' in data && !('class' in data);
      const endpoint = isMember ? "/api/auth/member/register" : "/api/auth/student/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result;
      try {
        const text = await res.text();
        if (!text) {
          console.error("Empty response from server");
          setIsLoading(false);
          return { success: false, error: "Server returned empty response. Please try again." };
        }
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        setIsLoading(false);
        return { success: false, error: "Invalid response from server. Please try again." };
      }

      if (!res.ok) {
        setIsLoading(false);
        console.error("Registration API error:", result);
        return { success: false, error: result.error || "Registration failed" };
      }

      localStorage.setItem("auth_token", result.token);
      setToken(result.token);
      setUser({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
      });
      setIsLoading(false);
      return { success: true, registrationNumber: result.registrationNumber };
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.message || "Network error";
      console.error("Signup network error:", error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string, type: "student" | "member"): Promise<{ success: boolean; error?: string }> => {
    try {
      const endpoint = type === "student" ? "/api/auth/student/forgot-password" : "/api/auth/member/forgot-password";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        const text = await res.text();
        if (!text) {
          return { success: false, error: "Server returned empty response" };
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse forgot password response:", parseError);
        return { success: false, error: "Invalid response from server" };
      }

      if (!res.ok) {
        return { success: false, error: data.error || "Failed to send reset email" };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return { success: false, error: error?.message || "Network error" };
    }
  };

  const resetPassword = async (token: string, newPassword: string, type: "student" | "member"): Promise<{ success: boolean; error?: string }> => {
    try {
      const endpoint = type === "student" ? "/api/auth/student/reset-password" : "/api/auth/member/reset-password";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      let data;
      try {
        const text = await res.text();
        if (!text) {
          return { success: false, error: "Server returned empty response" };
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse reset password response:", parseError);
        return { success: false, error: "Invalid response from server" };
      }

      if (!res.ok) {
        return { success: false, error: data.error || "Failed to reset password" };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return { success: false, error: error?.message || "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        isAdmin: user?.role === "admin",
        isStudent: user?.role === "student",
        isMember: user?.role === "member"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
