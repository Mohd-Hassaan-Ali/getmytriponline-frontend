'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Search, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrganizationSwitcher } from './organization-switcher';
import { useOrganization } from '@/components/providers/organization-provider';
import { UserRole } from '@/types/auth';

function getRoleDisplay(role: UserRole): { label: string; color: string } {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return { label: 'Super Admin', color: 'text-red-600' };
    case UserRole.ORG_ADMIN:
      return { label: 'Admin', color: 'text-purple-600' };
    case UserRole.TRAVEL_MANAGER:
      return { label: 'Travel Manager', color: 'text-blue-600' };
    case UserRole.APPROVER:
      return { label: 'Approver', color: 'text-green-600' };
    case UserRole.TRAVELER:
      return { label: 'Traveler', color: 'text-gray-600' };
    case UserRole.VIEWER:
      return { label: 'Viewer', color: 'text-gray-500' };
    default:
      return { label: 'User', color: 'text-gray-600' };
  }
}

export default function Header() {
  const router = useRouter();
  const { user: orgUser, organization } = useOrganization();
  const [user, setUser] = useState<any>(null);
  const roleDisplay = orgUser ? getRoleDisplay(orgUser.role) : null;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">Flight Portal</h2>
          <OrganizationSwitcher />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search flights, bookings..."
              className="pl-10 w-80"
            />
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            {roleDisplay && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-md">
                <Shield className="h-3 w-3" />
                <span className={`text-xs font-medium ${roleDisplay.color}`}>
                  {roleDisplay.label}
                </span>
              </div>
            )}
            
            <div className="text-right">
              <p className="text-sm text-gray-600">{orgUser?.firstName} {orgUser?.lastName}</p>
              <p className="text-xs text-gray-500">{orgUser?.email}</p>
            </div>
            
            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
