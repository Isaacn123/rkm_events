// components/dashboard/DashboardClient.tsx
'use client';

import { useState } from 'react';
import { DashboardHeader } from './mvpblocks/ui/dashboard-header';

export default function DashboardClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);



  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  return (
    <DashboardHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRefresh={handleRefresh}
      onExport={handleExport}
      isRefreshing={isRefreshing}
    />
  );
}
