// app/dashboard/page.js
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMe } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AdminDashboard from "@/components/AdminDashboard";
import MentorDashboard from "@/components/MentorDashboard";
import MenteeDashboard from "@/components/MenteeDashboard";
import Navbar from "@/components/Navbar";


export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe()).unwrap().catch(() => {
        toast.error("Please login");
        router.push("/login");
      });
    }
    console.log(user?.role)
  }, [dispatch, user, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-6">
        {user.role === "mentee" && <MenteeDashboard />}
        {user.role === "mentor" && <MentorDashboard />}
        {user.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}