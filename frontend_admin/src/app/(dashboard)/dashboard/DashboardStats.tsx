'use client';

import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/mvpblocks/ui/dashboard-card';
import { getAuthHeaders } from '@/lib/auth';
import { API_ENDPOINTS } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

interface RecentUpload {
  id: number;
  title: string;
  artist: string;
  created_at: string;
}

interface AudioItem {
  id: number;
  title: string;
  published: boolean;
  is_featured: boolean;
  created_at: string;
}

interface EventItem {
  id: number;
  title: string;
  published: boolean;
  end_date?: string;
  date?: string;
  created_at: string;
}

interface AudioStats {
  total_audios: number;
  published_audios: number;
  featured_audios: number;
  public_audios?: number;
  total_duration?: string;
  recent_uploads?: RecentUpload[];
}

interface EventStats {
  total_events: number;
  published_events: number;
  upcoming_events: number;
  past_events: number;
}

export default function DashboardStats() {
  const [userCount, setUserCount] = useState(0);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      console.log('Fetching stats...'); // Debug log
      const headers = await getAuthHeaders();
      console.log('Headers:', headers); // Debug log
      
      // Fetch user stats
      const userResponse = await fetch('http://45.56.120.65:8001/api/user/list/', {
        headers,
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Handle different response formats
        let usersData: User[] = [];
        if (Array.isArray(userData)) {
          usersData = userData;
        } else if (userData.results && Array.isArray(userData.results)) {
          usersData = userData.results;
        } else if (userData.users && Array.isArray(userData.users)) {
          usersData = userData.users;
        }

        setUserCount(usersData.length);
      }

      // Fetch audio stats - get the list and count them
      const audioResponse = await fetch(API_ENDPOINTS.AUDIOS.ADMIN, {
        headers,
      });

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        console.log('Audio list response:', audioData); // Debug log
        
        // Handle different response formats
        let audiosData: AudioItem[] = [];
        if (Array.isArray(audioData)) {
          audiosData = audioData as AudioItem[];
        } else if (audioData.results && Array.isArray(audioData.results)) {
          audiosData = audioData.results as AudioItem[];
        }
        
        const totalAudios = audiosData.length;
        const publishedAudios = audiosData.filter((audio: AudioItem) => audio.published === true).length;
        const featuredAudios = audiosData.filter((audio: AudioItem) => audio.is_featured === true).length;
        
        setAudioStats({
          total_audios: totalAudios,
          published_audios: publishedAudios,
          featured_audios: featuredAudios
        });
      } else {
        console.error('Audio list response not ok:', audioResponse.status, audioResponse.statusText);
      }

      // Fetch event stats - get the list and count them
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS.LIST, {
        headers,
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        console.log('Event list response:', eventData); // Debug log
        console.log('Event data type:', typeof eventData); // Debug log
        console.log('Event data keys:', Object.keys(eventData || {})); // Debug log
        
        // Handle different response formats
        let eventsData: EventItem[] = [];
        if (Array.isArray(eventData)) {
          eventsData = eventData as EventItem[];
          console.log('Events data is array, length:', eventsData.length); // Debug log
        } else if (eventData.results && Array.isArray(eventData.results)) {
          eventsData = eventData.results as EventItem[];
          console.log('Events data from results, length:', eventsData.length); // Debug log
        } else {
          console.log('No valid events data found'); // Debug log
        }
        
        if (eventsData.length > 0) {
          console.log('First event sample:', eventsData[0]); // Debug log
        }
        
        const now = new Date();
        const totalEvents = eventsData.length;
        const publishedEvents = eventsData.filter((event: EventItem) => {
          console.log('Checking event published:', event.title, event.published); // Debug log
          return event.published === true;
        }).length;
        const upcomingEvents = eventsData.filter((event: EventItem) => {
          const eventDate = event.end_date || event.date;
          if (!eventDate) return false;
          return new Date(eventDate) > now;
        }).length;
        const pastEvents = totalEvents - upcomingEvents;
        
        console.log('Event stats calculated:', { totalEvents, publishedEvents, upcomingEvents, pastEvents }); // Debug log
        
        setEventStats({
          total_events: totalEvents,
          published_events: publishedEvents,
          upcoming_events: upcomingEvents,
          past_events: pastEvents
        });
      } else {
        console.error('Event list response not ok:', eventResponse.status, eventResponse.statusText);
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: loading ? '...' : userCount.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      iconName: 'users' as const,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Published Audios',
      value: loading ? '...' : (audioStats?.published_audios || 0).toString(),
      change: `${audioStats?.total_audios || 0} total`,
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Published Events',
      value: loading ? '...' : (eventStats?.published_events || 0).toString(),
      change: `${eventStats?.total_events || 0} total`,
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Featured Content',
      value: loading ? '...' : (audioStats?.featured_audios || 0).toString(),
      change: 'Featured audios',
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <DashboardCard key={stat.title} stat={stat} index={index} />
      ))}
    </div>
  );
} 