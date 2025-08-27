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

interface AudioStats {
  total_audios: number;
  published_audios: number;
  featured_audios: number;
  total_duration: string;
}

interface EventStats {
  total_events: number;
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
      const headers = await getAuthHeaders();
      
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

      // Fetch audio stats
      const audioResponse = await fetch(API_ENDPOINTS.AUDIOS.STATISTICS, {
        headers,
      });

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        setAudioStats(audioData);
      }

      // Fetch event stats
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS.LIST, {
        headers,
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        
        // Calculate event stats from the list
        const events = Array.isArray(eventData) ? eventData : (eventData.results || []);
        const now = new Date();
        
        const totalEvents = events.length;
        const upcomingEvents = events.filter((event: Record<string, unknown>) => 
          new Date((event.end_date || event.date) as string) > now
        ).length;
        const pastEvents = totalEvents - upcomingEvents;
        
        setEventStats({
          total_events: totalEvents,
          upcoming_events: upcomingEvents,
          past_events: pastEvents
        });
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
      title: 'Total Audios',
      value: loading ? '...' : (audioStats?.total_audios || 0).toString(),
      change: `${audioStats?.published_audios || 0} published`,
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Events',
      value: loading ? '...' : (eventStats?.total_events || 0).toString(),
      change: `${eventStats?.upcoming_events || 0} upcoming`,
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