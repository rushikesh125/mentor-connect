// components/dashboards/MenteeDashboard.js
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Search, Calendar, Star, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function MenteeDashboard() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await api.get("/mentors");
      setMentors(res.data.mentors);
    } catch (err) {
      toast.error("Failed to load mentors");
    }
  };

  const filtered = mentors.filter(
    (m) =>
      m.university.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()))
  );

  const bookSession = async (mentorId) => {
    try {
      await api.post("/sessions/book", {
        mentorId,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        topic: "Career Guidance",
      });
      toast.success("Session booked!");
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  return (
    <>
    <div className="mb-6 p-6 bg-white rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
  <p className="text-sm text-gray-600 mb-4">Ready to share your knowledge?</p>
  <Link href="/become-a-mentor">
    <Button className="w-full">
      <GraduationCap className="mr-2 h-4 w-4" />
      Become a Mentor
    </Button>
  </Link>
</div>
    <div>
      <h2 className="text-2xl font-bold mb-6">Find Your Mentor</h2>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by university or expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mentor) => (
          <div key={mentor._id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg">{mentor.name}</h3>
            <p className="text-sm text-gray-600">{mentor.university}</p>
            <p className="text-sm mt-1">
              {mentor.expertise.join(" · ")}
            </p>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm">{mentor.rating || "New"}</span>
            </div>
            <button
              onClick={() => bookSession(mentor._id)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4" />
              Book Session
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}