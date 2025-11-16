'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Star, Users, TrendingUp, Clock, CheckCircle,
  AlertCircle, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { getMyBookings } from '@/lib/api/bookings';
import { getMyMentorProfile } from '@/lib/api/mentors';
import { SessionCard } from '@/components/features/session-card';
import { ProfileCompletionCard } from '@/components/features/profile-completion-card';
import toast from 'react-hot-toast';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    totalRating: 0,
    totalReviews: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      // Load profile
      const profileData = await getMyMentorProfile().catch(() => null);
      setProfile(profileData);
      
      // Load sessions
      const sessionsData = await getMyBookings();
      const upcoming = sessionsData.filter(s => s.status === 'pending');
      const completed = sessionsData.filter(s => s.status === 'completed');
      
      setStats({
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        totalRating: profileData?.averageRating || 0,
        totalReviews: profileData?.totalReviews || 0,
      });
      
      setUpcomingSessions(upcoming.slice(0, 3));
      
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinSession = (zoomLink) => {
    window.open(zoomLink, '_blank');
  };
  
  if (loading) {
    return (
      <MentorLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </MentorLayout>
    );
  }
  
  return (
    <MentorLayout>
      {/* Approval Status Banner */}
      {!user?.isApproved && (
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Profile Pending Approval
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Your profile is currently under review by our admin team. 
                  You'll be able to accept sessions once approved.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/mentor/profile">
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your mentoring activities
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Stats & Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.upcomingSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={24} className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completedSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalRating.toFixed(1)}
                      <span className="text-lg text-gray-500">/5.0</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star size={24} className="text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
                <Link href="/mentor/sessions" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    onJoin={handleJoinSession}
                    userRole="mentor"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Profile & Quick Actions */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <ProfileCompletionCard profile={profile} />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mentor/availability">
                  <Clock size={18} className="mr-2" />
                  Manage Availability
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mentor/sessions">
                  <Calendar size={18} className="mr-2" />
                  View All Sessions
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mentor/profile">
                  <Users size={18} className="mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorLayout>
  );
}
