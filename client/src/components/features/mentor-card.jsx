'use client';

import Link from 'next/link';
import { Star, MapPin, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getInitials, getAvatarColor, formatRating } from '@/lib/utils/helpers';

export const MentorCard = ({ mentor }) => {
  // Safety checks
  if (!mentor) return null;
  
  const averageRating = mentor.averageRating || 0;
  const totalReviews = mentor.totalReviews || 0;
  const mentorName = mentor.fullName || mentor.name || 'Unknown Mentor';
  const mentorUniversity = mentor.university || 'N/A';
  const mentorProgram = mentor.program || 'N/A';
  const mentorBio = mentor.bio || 'No bio available';
  const mentorExpertise = mentor.expertise || [];
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 ${getAvatarColor(mentorName)} rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
            {getInitials(mentorName)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {mentorName}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{mentorUniversity}</span>
            </p>
            
            {/* Rating */}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{formatRating(averageRating)}</span>
                </div>
                <span className="text-xs text-gray-500">({totalReviews} reviews)</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Program */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <BookOpen size={16} className="text-purple-500 flex-shrink-0" />
          <span className="truncate">{mentorProgram}</span>
          {mentor.graduationYear && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Class of {mentor.graduationYear}</span>
            </>
          )}
        </div>
        
        {/* Expertise Tags */}
        {mentorExpertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mentorExpertise.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
            {mentorExpertise.length > 3 && (
              <Badge variant="secondary">+{mentorExpertise.length - 3}</Badge>
            )}
          </div>
        )}
        
        {/* Bio Preview */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {mentorBio}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link href={`/mentors/${mentor.id || mentor._id}`}>
            View Profile
          </Link>
        </Button>
        <Button size="sm" asChild className="flex-1">
          <Link href={`/mentors/${mentor.id || mentor._id}?action=book`}>
            Book Session
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
