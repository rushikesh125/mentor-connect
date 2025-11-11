// app/become-a-mentor/page.js
"use client";

import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default function BecomeMentorPage() {
  const [formData, setFormData] = useState({
    university: "",
    program: "",
    graduationYear: "",
    expertise: [""],
    bio: "",
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("university", formData.university);
    data.append("program", formData.program);
    data.append("graduationYear", formData.graduationYear);
    formData.expertise.forEach((exp) => data.append("expertise[]", exp));
    data.append("bio", formData.bio);
    documents.forEach((file) => data.append("documents", file));

    try {
      await api.post("/mentors/apply", data);
      toast.success("Application submitted! Wait for approval.");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Submission failed. Try again.");
    }
    setLoading(false);
  };

  const addExpertise = () => {
    setFormData({ ...formData, expertise: [...formData.expertise, ""] });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
          <p className="text-gray-600">Share your knowledge and help students succeed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div>
            <Label htmlFor="university">University</Label>
            <Input
              id="university"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              type="number"
              value={formData.graduationYear}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Expertise (Add multiple)</Label>
            {formData.expertise.map((exp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={exp}
                  onChange={(e) => {
                    const newExp = [...formData.expertise];
                    newExp[index] = e.target.value;
                    setFormData({ ...formData, expertise: newExp });
                  }}
                  placeholder="e.g., React, Python"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newExp = formData.expertise.filter((_, i) => i !== index);
                    setFormData({ ...formData, expertise: newExp });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addExpertise}>
              + Add Expertise
            </Button>
          </div>

          <div>
            <Label htmlFor="bio">Bio (Your Story)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Tell us about your experience..."
              required
            />
          </div>

          <div>
            <Label>Documents (Degree/ID Proof)</Label>
            <Input
              type="file"
              multiple
              onChange={(e) => setDocuments(Array.from(e.target.files))}
              accept=".pdf,.jpg,.png"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
}