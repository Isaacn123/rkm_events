'use client';

import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/mvpblocks/ui/dashboard-card';
import { getAuthHeaders } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

export default function DashboardStats() {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('http://127.0.0.1:8000/api/user/list/', {
        headers,
      });

      if (!response.ok) {
        console.error('Failed to fetch user stats');
        return;
      }

      const data = await response.json();
      
      // Handle different response formats
      let usersData: User[] = [];
      if (Array.isArray(data)) {
        usersData = data;
      } else if (data.results && Array.isArray(data.results)) {
        usersData = data.results;
      } else if (data.users && Array.isArray(data.users)) {
        usersData = data.users;
      }

      setUserCount(usersData.length);
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
      title: 'Revenue',
      value: '$45,678',
      change: '+8.2%',
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Sessions',
      value: '2,456',
      change: '+15%',
      changeType: 'positive' as const,
      iconName: 'chart-bar' as const,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Page Views',
      value: '34,567',
      change: '-2.4%',
      changeType: 'negative' as const,
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