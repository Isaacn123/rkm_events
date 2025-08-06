'use client';

import { UsersTable } from '@/components/mvpblocks/ui/users-table';
import { useState, useEffect } from 'react';
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

export default function UsersTableWrapper() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch('http://backend:8000/api/user/list/', {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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

      // Sort by date_joined to get most recent first
      const sortedUsers = usersData
        .sort((a, b) => new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime())
        .slice(0, 5); // Get only the 5 most recent users

      setUsers(sortedUsers);
    } catch (err) {
      console.error('Fetch recent users error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    console.log('Adding user...');
    // Update state or open a modal, etc.
  };

  if (loading) {
    return (
      <div className="border-border bg-card/40 rounded-xl border p-3 sm:p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-border bg-card/40 rounded-xl border p-3 sm:p-6">
        <div className="text-center text-red-600">
          <p>Error loading recent users: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <UsersTable 
      onAddUser={handleAddUser} 
      users={users}
    />
  );
}

