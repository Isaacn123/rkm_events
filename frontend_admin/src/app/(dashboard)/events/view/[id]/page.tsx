'use client'
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthHeaders } from '@/lib/auth';

interface Event {
  id: number;
  title: string;
  description: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  date_range_display?: string;
  time?: string;
  location: string;
  author: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const ViewEventPage = () => {
  const params = useParams();
  const eventId = params.id;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://backend:8000/api/${eventId}/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const eventData: Event = await response.json();
      setEvent(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  const getDateDisplay = (event: Event) => {
    if (event.date_range_display) {
      return event.date_range_display;
    }
    
    if (event.start_date && event.end_date) {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      const formatDateWithOrdinal = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        const getOrdinalSuffix = (day: number): string => {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        
        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
      };
      
      const startFormatted = formatDateWithOrdinal(startDate);
      const endFormatted = formatDateWithOrdinal(endDate);
      
      if (startDate.getFullYear() === endDate.getFullYear()) {
        if (startDate.getMonth() === endDate.getMonth()) {
          const startDay = startDate.getDate();
          const endDay = endDate.getDate();
          const month = startDate.toLocaleDateString('en-US', { month: 'long' });
          const year = startDate.getFullYear();
          
          const getOrdinalSuffix = (day: number): string => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
              case 1: return 'st';
              case 2: return 'nd';
              case 3: return 'rd';
              default: return 'th';
            }
          };
          
          return `${startDay}${getOrdinalSuffix(startDay)} to ${endDay}${getOrdinalSuffix(endDay)} ${month} ${year}`;
        } else {
          return `${startFormatted} to ${endFormatted}`;
        }
      } else {
        return `${startFormatted} to ${endFormatted}`;
      }
    } else if (event.date) {
      const date = new Date(event.date);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      const getOrdinalSuffix = (day: number): string => {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      
      return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    }
    
    return 'No date specified';
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours);
    const isPM = hourNum >= 12;
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Event not found'}</p>
          <Link href="/events">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
          <p className="text-gray-600 mt-2">View event information</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/events">
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Back to Events
            </button>
          </Link>
          <Link href={`/events/edit/${event.id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Edit Event
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {event.image_url && (
          <div className="relative h-64 overflow-hidden">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                event.published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        )}

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date</h3>
                <p className="text-lg text-gray-900">{getDateDisplay(event)}</p>
              </div>
              
              {event.time && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Time</h3>
                  <p className="text-lg text-gray-900">{formatTime(event.time)}</p>
                </div>
              )}
              
              {event.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</h3>
                  <p className="text-lg text-gray-900">{event.location}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {event.author && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Author</h3>
                  <p className="text-lg text-gray-900">{event.author}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Created</h3>
                <p className="text-lg text-gray-900">
                  {new Date(event.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Updated</h3>
                <p className="text-lg text-gray-900">
                  {new Date(event.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          {event.description && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</h3>
              <div 
                className="prose max-w-none text-gray-900"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEventPage; 