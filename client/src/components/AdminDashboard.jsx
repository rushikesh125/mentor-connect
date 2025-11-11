"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Check, X, Users, CalendarCheck, Eye, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchMetrics();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/mentors/applications");
      setApplications(res.data.applications);
    } catch (err) {
      toast.error("Failed to load applications");
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/admin/metrics");
      setMetrics(res.data);
    } catch (err) {
      toast.error("Failed to load metrics");
    }
  };

  const approve = async (id) => {
    try {
      await api.put(`/mentors/applications/${id}/approve`);
      toast.success("Mentor approved");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/mentors/applications/${id}/reject`);
      toast.success("Mentor rejected");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const openPdf = (doc) => {
    try {
      // Validate base64 data
      if (!doc.data || typeof doc.data !== 'string') {
        throw new Error('Invalid document data');
      }
      
      // Check if base64 is valid
      atob(doc.data.replace(/[^A-Za-z0-9+/=]/g, ''));
      
      const dataUri = `data:${doc.contentType};base64,${doc.data}`;
      setSelectedDoc({ dataUri, filename: doc.filename });
    } catch (e) {
      toast.error("Invalid document format");
      console.error("Base64 decode error:", e);
    }
  };

  const closeModal = () => {
    setSelectedDoc(null);
  };

  // Calculate document size in KB
  const getDocumentSize = (base64String) => {
    // Base64 string length * 0.75 (since 4 chars represent 3 bytes)
    // Then divide by 1024 for KB
    const approxBytes = (base64String.length * 0.75);
    return (approxBytes / 1024).toFixed(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold">{metrics.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-xl font-bold">{metrics.totalSessions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Mentor Applications</h3>
      <div className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending applications</p>
        ) : (
          applications.map((app) => (
            <div key={app._id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{app.user?.name}</p>
                  <p className="text-sm text-gray-500 truncate">{app.user?.email}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {app.university} • {app.program} • {app.graduationYear}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {app.expertise?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.bio}</p>

                  {/* Documents */}
                 {app.documents?.length > 0 && (
  <div className="mt-3">
    <p className="text-xs text-gray-500 mb-1">Documents:</p>
    <div className="flex gap-2 flex-wrap">
      {app.documents
        .filter(doc => doc && doc.filename && doc.data) // Filter out invalid docs
        .map((doc, i) => (
          <button
            key={`${app._id}-${i}`} // Use app ID + index for unique key
            onClick={() => openPdf(doc)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            <FileText className="h-3 w-3" />
            {doc.filename} ({getDocumentSize(doc.data)} KB)
          </button>
        ))}
    </div>
  </div>
)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => approve(app._id)}
                    className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
                    title="Approve"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => reject(app._id)}
                    className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                    title="Reject"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Modal */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg truncate pr-4">
                {selectedDoc.filename}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe
                src={selectedDoc.dataUri}
                className="w-full h-full border-0"
                title={selectedDoc.filename}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}