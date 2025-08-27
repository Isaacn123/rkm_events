'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Music, Users } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';
import { API_ENDPOINTS } from '@/lib/api';

interface ChartData {
  month: string;
  value: number;
  growth: number;
  color: string;
}

interface AnalyticsData {
  audioUploads: ChartData[];
  userRegistrations: ChartData[];
  eventCreations: ChartData[];
}

export const RevenueChart = memo(() => {
  const [chartType, setChartType] = useState<'audio' | 'users' | 'events'>('audio');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    audioUploads: [],
    userRegistrations: [],
    eventCreations: []
  });

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      
      // Fetch audio data
      const audioResponse = await fetch(API_ENDPOINTS.AUDIOS.ADMIN, { headers });
      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        const audios = Array.isArray(audioData) ? audioData : (audioData.results || []);
        const audioUploads = generateMonthlyData(audios, 'created_at');
        setAnalyticsData(prev => ({ ...prev, audioUploads }));
      }

      // Fetch user data
      const userResponse = await fetch('http://45.56.120.65:8001/api/user/list/', { headers });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const users = Array.isArray(userData) ? userData : (userData.results || userData.users || []);
        const userRegistrations = generateMonthlyData(users, 'date_joined');
        setAnalyticsData(prev => ({ ...prev, userRegistrations }));
      }

      // Fetch event data
      const eventResponse = await fetch(API_ENDPOINTS.EVENTS.LIST, { headers });
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        const events = Array.isArray(eventData) ? eventData : (eventData.results || []);
        const eventCreations = generateMonthlyData(events, 'created_at');
        setAnalyticsData(prev => ({ ...prev, eventCreations }));
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMonthlyData = (data: Array<Record<string, unknown>>, dateField: string): ChartData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500'];
    
    return months.map((month, index) => {
      const monthData = data.filter(item => {
        const dateValue = item[dateField];
        if (typeof dateValue !== 'string' && typeof dateValue !== 'number') return false;
        const date = new Date(dateValue);
        return date.getMonth() === index;
      });
      
      const value = monthData.length;
      const prevMonth = index > 0 ? data.filter(item => {
        const dateValue = item[dateField];
        if (typeof dateValue !== 'string' && typeof dateValue !== 'number') return false;
        const date = new Date(dateValue);
        return date.getMonth() === index - 1;
      }).length : 0;
      
      const growth = prevMonth > 0 ? Math.round(((value - prevMonth) / prevMonth) * 100) : 0;
      
      return {
        month,
        value,
        growth,
        color: colors[index]
      };
    });
  };

  const updateChartData = useCallback(() => {
    switch (chartType) {
      case 'audio':
        setChartData(analyticsData.audioUploads);
        break;
      case 'users':
        setChartData(analyticsData.userRegistrations);
        break;
      case 'events':
        setChartData(analyticsData.eventCreations);
        break;
    }
  }, [chartType, analyticsData]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    updateChartData();
  }, [updateChartData]);

  const getChartTitle = () => {
    switch (chartType) {
      case 'audio':
        return 'Audio Uploads';
      case 'users':
        return 'User Registrations';
      case 'events':
        return 'Event Creations';
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'audio':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'users':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'events':
        return <Calendar className="h-5 w-5 text-purple-500" />;
    }
  };

  const getSummaryStats = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const avg = Math.round(total / chartData.length);
    const growth = chartData.length > 1 ? 
      Math.round(((chartData[chartData.length - 1].value - chartData[0].value) / Math.max(chartData[0].value, 1)) * 100) : 0;
    
    return { total, avg, growth };
  };

  const summaryStats = getSummaryStats();

  return (
    <div className="border-border bg-card/40 rounded-xl border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            {getChartIcon()}
            {getChartTitle()} Analytics
          </h3>
          <p className="text-muted-foreground text-sm">
            Monthly {getChartTitle().toLowerCase()} performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={chartType === 'audio' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartType('audio')}
          >
            <Music className="mr-2 h-4 w-4" />
            Audio
          </Button>
          <Button 
            variant={chartType === 'users' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartType('users')}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button 
            variant={chartType === 'events' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setChartType('events')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </Button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative mb-4 h-64 rounded-lg p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        ) : (
          <div className="flex h-full items-end justify-between gap-3">
            {chartData.map((item, index) => {
              const maxValue = Math.max(...chartData.map(d => d.value), 1);
              const heightPercentage = (item.value / maxValue) * 180;
              
              return (
                <div
                  key={item.month}
                  className="group flex flex-1 flex-col items-center"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}px` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`w-full ${item.color} relative min-h-[20px] cursor-pointer rounded-t-lg transition-opacity hover:opacity-80`}
                  >
                    {/* Tooltip */}
                    <div className="border-border bg-popover absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform rounded-lg border px-3 py-2 text-sm whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <div className="font-medium">
                        {item.value} {chartType === 'audio' ? 'uploads' : chartType === 'users' ? 'users' : 'events'}
                      </div>
                      <div
                        className={`text-xs ${item.growth > 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {item.growth > 0 ? '+' : ''}
                        {item.growth}%
                      </div>
                    </div>
                  </motion.div>
                  <div className="text-muted-foreground mt-2 text-center text-xs font-medium">
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="border-border/50 grid grid-cols-3 gap-4 border-t pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{summaryStats.total}</div>
          <div className="text-muted-foreground text-xs">
            Total {chartType === 'audio' ? 'Uploads' : chartType === 'users' ? 'Users' : 'Events'}
          </div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${summaryStats.growth > 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {summaryStats.growth > 0 ? '+' : ''}{summaryStats.growth}%
          </div>
          <div className="text-muted-foreground text-xs">Growth Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{summaryStats.avg}</div>
          <div className="text-muted-foreground text-xs">Average</div>
        </div>
      </div>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';
