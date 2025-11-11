// components/dashboards/MentorDashboard.js
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { CheckCircle, Clock } from "lucide-react";

export default function MentorDashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      toast.error("Failed to load sessions");
    }
  };

  const completeSession = async (id) => {
    try {
      await api.put(`/sessions/${id}/complete`);
      toast.success("Session marked complete");
      fetchSessions();
    } catch (err) {
      toast.error("Failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Sessions</h2>
      <div className="space-y-4">
        {sessions.map((s) => (
          <div key={s._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="font-medium">{s.mentee.name}</p>
              <p className="text-sm text-gray-600">{s.topic}</p>
              <p className="text-xs text-gray-500">
                {new Date(s.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              {s.status === "completed" ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-5 w-5" /> Done
                </span>
              ) : (
                <button
                  onClick={() => completeSession(s._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}