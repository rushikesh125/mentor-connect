// components/Navbar.js (Updated)
"use client";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, User, GraduationCap } from "lucide-react"; // Add GraduationCap icon
import Link from "next/link";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">MentorConnect</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-gray-500">({user?.role})</span>
          </div>
          
          {/* Become a Mentor Button – Show if not mentor/admin */}
          {user?.role === "mentee" && (
            <Link href="/become-a-mentor">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Become Mentor
              </button>
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}