
'use client'

import { QuickActions } from '@/components/mvpblocks/ui/quick-actions'
import React from 'react'

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const handleAddUser = () => {
    console.log('Adding new user...');
  };

const ClientAction = () => {
  return (
    <div>
         <QuickActions
                          onAddUser={handleAddUser}
                          onExport={handleExport}
                        />
    </div>
  )
}

export default ClientAction
