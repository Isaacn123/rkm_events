
import { RecentActivity } from '@/components/mvpblocks/ui/recent-activity';
import { RevenueChart } from '@/components/mvpblocks/ui/revenue-chart';
import { SystemStatus } from '@/components/mvpblocks/ui/system-status';
import React from 'react'
import UsersTableWrapper from '@/components/UsersTableWrapper';
import ClientAction from './clientAction';
import AuthWrapper from '@/components/AuthWrapper';
import DashboardStats from './DashboardStats';

const Dashboard = () => {
  return (
    <AuthWrapper>
    <div>
           <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
          <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome Admin
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Here&apos;s what&apos;s happening with your platform today.
                </p>
              </div>

              {/* Stats Cards */}
              <DashboardStats />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                {/* Charts Section */}
                <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                  <RevenueChart />
                  <UsersTableWrapper />
                </div>

                {/* Sidebar Section */}
                <div className="space-y-4 sm:space-y-6">
                 <ClientAction />
                  <SystemStatus />
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}

export default Dashboard;
