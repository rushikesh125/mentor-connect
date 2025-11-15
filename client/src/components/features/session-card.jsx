'use client';

import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDateTime, formatTime, getTimeUntil, canJoinSession, hasSessionEnded } from '@/lib/utils/date';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';

export const SessionCard = ({ session, onComplete, onReview, onJoin, userRole = 'mentee' }) => {
  const isMentee = userRole === 'mentee';
  const otherUser = isMentee ? session.mentor : session.mentee;
  const canJoin = canJoinSession(session.startTime);
  const isEnded = hasSessionEnded(session.startTime);
  const isPending = session.status === 'pending';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';
  
  const getStatusBadge = () => {
    if (isCancelled) return <Badge variant="destructive">Cancelled</Badge>;
    if (isCompleted) return <Badge variant="success">Completed</Badge>;
    if (canJoin) return <Badge variant="warning">Join Now</Badge>;
    if (isPending) return <Badge variant="default">Upcoming</Badge>;
    return null;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* User Info */}
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 ${getAvatarColor(otherUser.fullName)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getInitials(otherUser.fullName)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
              <p className="text-sm text-gray-600">{otherUser.university}</p>
              <p className="text-sm text-gray-500">{otherUser.program}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div>
            {getStatusBadge()}
          </div>
        </div>
        
        {/* Topic */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-purple-900">{session.topic}</p>
        </div>
        
        {/* Session Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-purple-500" />
            <span>{formatDateTime(session.startTime)}</span>
          </div>
          
          {!isCompleted && !isCancelled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-purple-500" />
              <span>{getTimeUntil(session.startTime)} {isEnded ? 'ago' : 'remaining'}</span>
            </div>
          )}
          
          {session.zoomLink && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video size={16} className="text-purple-500" />
              <span className="text-purple-600 truncate">{session.zoomLink}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex flex-wrap gap-2">
        {/* Join Button */}
        {canJoin && session.zoomLink && (
          <Button 
            onClick={() => onJoin?.(session.zoomLink)}
            className="flex-1"
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
          >
            <AlertCircle size={16} className="mr-2" />
            Leave Review
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
