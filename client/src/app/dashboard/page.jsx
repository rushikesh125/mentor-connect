'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Users, TrendingUp, Search, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getMyBookings } from '@/lib/api/bookings';
import { getAllMentors } from '@/lib/api/mentors';
import { MentorCard } from '@/components/features/mentor-card';
import { SessionCard } from '@/components/features/session-card';
import { formatDate } from '@/lib/utils/date';
import toast from 'react-hot-toast';

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    pendingReviews: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      // Load sessions
      const sessionsData = await getMyBookings();
      const upcoming = sessionsData.filter(s => s.status === 'pending');
      const completed = sessionsData.filter(s => s.status === 'completed');
      const needsReview = completed.filter(s => !s.hasReviewed);
      
      setStats({
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        pendingReviews: needsReview.length,
      });
      
      setUpcomingSessions(upcoming.slice(0, 3));
      
      // Load featured mentors
      const mentorsData = await getAllMentors();
      setFeaturedMentors(mentorsData.slice(0, 3));
      
    } catch (error) {
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
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your mentorship journey
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">Ready to learn from the best?</h3>
              <p className="text-purple-100">Find mentors from top universities and book your session today</p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/search">
                <Search size={20} className="mr-2" />
                Find Mentors
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
            <Link href="/sessions" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map(session => (
              <SessionCard
                key={session._id}
                session={session}
                onJoin={handleJoinSession}
                userRole="mentee"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Featured Mentors */}
      {featuredMentors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Mentors</h2>
            <Link href="/search" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {upcomingSessions.length === 0 && featuredMentors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-6">Find and connect with mentors from top universities</p>
            <Button asChild>
              <Link href="/search">
                <Search size={20} className="mr-2" />
                Browse Mentors
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
