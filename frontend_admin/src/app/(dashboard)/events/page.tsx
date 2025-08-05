'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { getAuthHeaders } from '@/lib/auth';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  start_date?: string;
  end_date?: string;
  date_range_display?: string;
  time: string;
  location: string;
  author: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/list/', {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Events data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Handle different response formats
      let eventsData: Event[] = [];
      if (Array.isArray(data)) {
        eventsData = data;
      } else if (data.results && Array.isArray(data.results)) {
        // Django REST Framework pagination format
        eventsData = data.results;
      } else if (data.events && Array.isArray(data.events)) {
        // Custom response format
        eventsData = data.events;
      } else {
        console.error('Unexpected data format:', data);
        eventsData = [];
      }

      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`http://127.0.0.1:8000/api/${eventId}/`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDateDisplay = (event: Event) => {
    // Use the new date_range_display if available, otherwise fall back to the old format
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage all events created by users</p>
        </div>
        <Link href="/event">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create New Event
          </button>
        </Link>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter by Date Range</h3>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateRangeChange={(startDate, endDate) => {
              setDateRange({ startDate, endDate });
            }}
            placeholder="Select date range to filter events"
            className="max-w-md"
          />
        </div>
      </div>

      {!Array.isArray(events) || events.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            There are no events available. Create your first event to get started.
          </p>
          <Link href="/event">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Create Event
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(events) && events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              {event.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      event.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>📅 {getDateDisplay(event)}</div>
                  {event.time && <div>🕒 {event.time}</div>}
                  {event.location && <div>📍 {event.location}</div>}
                  {event.author && <div>👤 {event.author}</div>}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Link href={`/events/view/${event.id}`}>
                      <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                        View
                      </button>
                    </Link>
                    <Link href={`/events/edit/${event.id}`}>
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                    </Link>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AuthWrapper>
  );
};

export default EventsPage; 