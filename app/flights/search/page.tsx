'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AirportSelector from '@/components/AirportSelector';
import DashboardLayout from '@/components/DashboardLayout';

export default function FlightSearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    tripType: 'oneway'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.origin || !formData.destination) {
      setError('Please select both origin and destination airports');
      return;
    }
    
    if (formData.origin === formData.destination) {
      setError('Origin and destination cannot be the same');
      return;
    }
    
    setLoading(true);

    try {
      const searchData = {
        JourneyType: formData.tripType === 'oneway' ? 1 : 2,
        PreferredAirlines: null,
        Segments: [
          {
            Origin: formData.origin,
            Destination: formData.destination,
            FlightCabinClass: 1,
            PreferredDepartureTime: formData.departDate + 'T00:00:00',
            PreferredArrivalTime: formData.departDate + 'T00:00:00'
          }
        ],
        AdultCount: formData.adults,
        ChildCount: formData.children,
        InfantCount: formData.infants
      };

      if (formData.tripType === 'roundtrip' && formData.returnDate) {
        searchData.Segments.push({
          Origin: formData.destination,
          Destination: formData.origin,
          FlightCabinClass: 1,
          PreferredDepartureTime: formData.returnDate + 'T00:00:00',
          PreferredArrivalTime: formData.returnDate + 'T00:00:00'
        });
      }

      const response = await api.post('/tbo/search', searchData);
      
      if (response.data.status === 'success') {
        const results = response.data.data;
        if (results.Results && results.Results[0] && results.Results[0].length > 0) {
          localStorage.setItem('searchResults', JSON.stringify({...results, passengerCounts: {adults: formData.adults, children: formData.children, infants: formData.infants}}));
          router.push('/flights/results');
        } else {
          setError('No flights found for this route');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Search Flights ✈️
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Find the best deals for your customers</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Trip Type */}
          <div className="p-4 sm:p-6 bg-gray-50 border-b">
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setFormData({...formData, tripType: 'oneway'})}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
                  formData.tripType === 'oneway'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                One Way
              </button>
              <button
                onClick={() => setFormData({...formData, tripType: 'roundtrip'})}
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
                  formData.tripType === 'roundtrip'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                Round Trip
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              {/* Route */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 relative">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <AirportSelector
                      value={formData.origin}
                      onChange={(code) => setFormData({...formData, origin: code})}
                      placeholder="Select departure city"
                      label=""
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, origin: formData.destination, destination: formData.origin})}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <AirportSelector
                      value={formData.destination}
                      onChange={(code) => setFormData({...formData, destination: code})}
                      placeholder="Select destination city"
                      label=""
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                  <input
                    type="date"
                    value={formData.departDate}
                    onChange={(e) => setFormData({...formData, departDate: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {formData.tripType === 'roundtrip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.tripType === 'roundtrip'}
                      min={formData.departDate}
                    />
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Passengers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Adults</div>
                      <div className="text-xs text-gray-500">12+ years</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{formData.adults}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, adults: Math.min(9, formData.adults + 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Children</div>
                      <div className="text-xs text-gray-500">2-12 years</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, children: Math.max(0, formData.children - 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{formData.children}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, children: Math.min(9, formData.children + 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Infants</div>
                      <div className="text-xs text-gray-500">Under 2 years</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, infants: Math.max(0, formData.infants - 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium">{formData.infants}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, infants: Math.min(formData.adults, formData.infants + 1)})}
                        className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading || !formData.origin || !formData.destination}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 px-6 rounded-lg font-medium text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                    Search Flights
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Routes */}
        <div className="mt-6 sm:mt-8">
          <h3 className="font-medium text-gray-800 mb-3 text-center">Popular Routes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai' },
              { from: 'BOM', to: 'BLR', label: 'Mumbai → Bangalore' },
              { from: 'DEL', to: 'BLR', label: 'Delhi → Bangalore' },
              { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa' },
            ].map((route, index) => (
              <button
                key={index}
                onClick={() => setFormData({...formData, origin: route.from, destination: route.to})}
                className="p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-xs sm:text-sm text-center"
              >
                <div className="font-medium text-gray-800">{route.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}