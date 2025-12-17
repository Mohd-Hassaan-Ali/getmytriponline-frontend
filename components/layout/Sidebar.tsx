'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { UserRole } from '@/types/auth';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      icon: '📊', 
      label: 'Dashboard', 
      path: '/dashboard',
      permissions: ['booking_read']
    },
    { 
      icon: '✈️', 
      label: 'Search Flights', 
      path: '/flights/search',
      permissions: ['booking_create']
    },
    { 
      icon: '📋', 
      label: 'Bookings', 
      path: '/bookings',
      permissions: ['booking_read']
    },
    { 
      icon: '💰', 
      label: 'Wallet', 
      path: '/wallet',
      permissions: ['finance_read']
    },
    { 
      icon: '💳', 
      label: 'Billing', 
      path: '/billing',
      permissions: ['finance_read']
    },
    { 
      icon: '📈', 
      label: 'Reports', 
      path: '/reports',
      permissions: ['report_read']
    },
    { 
      icon: '👥', 
      label: 'Users', 
      path: '/users',
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TRAVEL_MANAGER]
    },
    { 
      icon: '🏢', 
      label: 'Organization', 
      path: '/organization',
      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]
    },
    { 
      icon: '⚙️', 
      label: 'Settings', 
      path: '/settings',
      permissions: ['settings_read']
    },
  ];

  return (
    <div className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen sticky top-0 transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-blue-700 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold">Flight Portal</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:bg-blue-700 p-2 rounded">
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const NavButton = (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.path ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-700/50'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );

          if (item.roles || item.permissions) {
            return (
              <PermissionGuard
                key={item.path}
                roles={item.roles}
                permissions={item.permissions}
              >
                {NavButton}
              </PermissionGuard>
            );
          }

          return NavButton;
        })}
      </nav>
    </div>
  );
}
