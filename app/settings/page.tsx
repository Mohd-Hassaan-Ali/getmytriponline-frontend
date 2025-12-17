'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) router.push('/auth/login');
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input type="text" value={user?.name || ''} className="w-full px-4 py-2 border rounded-lg" readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={user?.email || ''} className="w-full px-4 py-2 border rounded-lg" readOnly />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Agency Name</label>
                <input type="text" value={user?.agency_name || ''} className="w-full px-4 py-2 border rounded-lg" readOnly />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💵 Markup Settings</h3>
            <p className="text-gray-600 mb-4">Configure your pricing markup rules</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Configure Markup
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔑 API Access</h3>
            <p className="text-gray-600 mb-4">Manage API keys for integration</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium">
              View API Keys
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔔 Notifications</h3>
            <p className="text-gray-600 mb-4">Configure email and SMS alerts</p>
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium">
              Manage Alerts
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
