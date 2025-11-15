'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader, X } from 'lucide-react';
import { searchMentors } from '@/lib/api/mentors';
import { MentorCard } from '@/components/features/mentor-card';
import toast from 'react-hot-toast';

export default function SearchMentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    university: '',
    program: '',
    expertise: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadMentors();
  }, []);
  
  const loadMentors = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const data = await searchMentors(searchFilters);
      setMentors(data);
    } catch (error) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    
    loadMentors(activeFilters);
  };
  
  const handleClearFilters = () => {
    setFilters({
      university: '',
      program: '',
      expertise: '',
    });
    loadMentors();
  };
  
  const hasActiveFilters = Object.values(filters).some(val => val !== '');
  
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Mentor</h1>
        <p className="text-gray-600">
          Connect with mentors from top universities worldwide
        </p>
      </div>
      
      {/* Search & Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* University */}
              <div className="flex-1">
                <Input
                  placeholder="University (e.g., Stanford)"
                  value={filters.university}
                  onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                  icon={Search}
                />
              </div>
              
              {/* Program */}
              <div className="flex-1">
                <Input
                  placeholder="Program (e.g., Computer Science)"
                  value={filters.program}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                />
              </div>
              
              {/* Expertise */}
              <div className="flex-1">
                <Input
                  placeholder="Expertise (e.g., Admissions)"
                  value={filters.expertise}
                  onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                </Button>
                {hasActiveFilters && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearFilters}
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {loading ? 'Searching...' : `${mentors.length} mentor${mentors.length !== 1 ? 's' : ''} found`}
        </p>
      </div>
      
      {/* Mentors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map(mentor => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or clear filters
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
