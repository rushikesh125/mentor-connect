'use client';

import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDateTime, formatTime, getTimeUntil, canJoinSession, hasSessionEnded } from '@/lib/utils/date';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';

export const SessionCard = ({ session, onComplete, onReview, onJoin, userRole = 'mentee' }) => {
  // Safety checks
  if (!session) return null;
  
  const isMentee = userRole === 'mentee';
  const otherUser = isMentee ? session.mentor : session.mentee;
  
  // More safety checks for nested data
  if (!otherUser) {
    console.warn('SessionCard: Missing mentor/mentee data', session);
    return null;
  }
  
  const canJoin = canJoinSession(session.startTime);
  const isEnded = hasSessionEnded(session.startTime);
  const isPending = session.status === 'pending';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';
  
  const getStatusBadge = () => {
    if (isCancelled) return <Badge variant="destructive">Cancelled</Badge>;
    if (isCompleted) return <Badge variant="success">Completed</Badge>;
    if (canJoin) return <Badge className="bg-yellow-500 text-white">Join Now</Badge>;
    if (isPending) return <Badge variant="default">Upcoming</Badge>;
    return null;
  };
  
  // Safe access to user properties with fallbacks
  const userName = otherUser.fullName || otherUser.name || 'Unknown User';
  const userUniversity = otherUser.university || 'N/A';
  const userProgram = otherUser.program || 'N/A';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* User Info */}
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 ${getAvatarColor(userName)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
              <p className="text-sm text-gray-600 truncate">{userUniversity}</p>
              <p className="text-sm text-gray-500 truncate">{userProgram}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Topic */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-purple-900 line-clamp-2">
            {session.topic || 'No topic provided'}
          </p>
        </div>
        
        {/* Session Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-purple-500 flex-shrink-0" />
            <span>{formatDateTime(session.startTime)}</span>
          </div>
          
          {!isCompleted && !isCancelled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-purple-500 flex-shrink-0" />
              <span>{getTimeUntil(session.startTime)} {isEnded ? 'ago' : 'remaining'}</span>
            </div>
          )}
          
          {session.zoomLink && !isCancelled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video size={16} className="text-purple-500 flex-shrink-0" />
              <span className="text-purple-600 truncate">Zoom link available</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex flex-wrap gap-2">
        {/* Join Button */}
        {canJoin && session.zoomLink && !isCancelled && (
          <Button 
            onClick={() => onJoin?.(session.zoomLink)}
            className="flex-1"
            size="sm"
          >
            <Video size={16} className="mr-2" />
            Join Session
          </Button>
        )}
        
        {/* Complete Button */}
        {isEnded && !isCompleted && !isCancelled && (
          <Button 
            onClick={() => onComplete?.(session._id)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <CheckCircle size={16} className="mr-2" />
            Mark Complete
          </Button>
        )}
        
        {/* Review Button */}
        {isCompleted && !session.hasReviewed && (
          <Button 
            onClick={() => onReview?.(session)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <AlertCircle size={16} className="mr-2" />
            Leave Review
          </Button>
        )}
        
        {/* Empty state for cancelled */}
        {isCancelled && (
          <div className="w-full text-center py-2">
            <p className="text-sm text-gray-500">This session was cancelled</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
