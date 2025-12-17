'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';

export default function FlightResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    const data = localStorage.getItem('searchResults');
    if (!data) {
      router.push('/flights/search');
      return;
    }
    setResults(JSON.parse(data));
  }, [router]);

  const handleBookNow = async (flight: any) => {
    setLoading(true);
    try {
      const fareRuleRes = await api.post('/tbo/fare-rule', { traceId: results.TraceId, resultIndex: flight.ResultIndex });
      const fareQuoteRes = await api.post('/tbo/fare-quote', { traceId: results.TraceId, resultIndex: flight.ResultIndex });
      const ssrRes = await api.post('/tbo/ssr', { traceId: results.TraceId, resultIndex: flight.ResultIndex });
      
      localStorage.setItem('selectedFlight', JSON.stringify({
        flight,
        fareQuote: fareQuoteRes.data.data,
        fareRules: fareRuleRes.data.data,
        ssrData: ssrRes.data.data,
        traceId: results.TraceId,
        passengerCounts: results.passengerCounts
      }));
      router.push('/flights/booking');
    } catch (err: any) {
      alert('Failed to get fare details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!results) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const flights = results.Results[0] || [];
  
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.Fare.PublishedFare - b.Fare.PublishedFare;
    if (sortBy === 'duration') return a.Segments[0][0].Duration - b.Segments[0][0].Duration;
    if (sortBy === 'departure') return new Date(a.Segments[0][0].Origin.DepTime).getTime() - new Date(b.Segments[0][0].Origin.DepTime).getTime();
    return 0;
  });

  const filteredFlights = sortedFlights.filter(flight => {
    if (filterBy === 'nonstop') return !flight.Segments[0][0].StopOver;
    if (filterBy === 'morning') {
      const hour = new Date(flight.Segments[0][0].Origin.DepTime).getHours();
      return hour >= 6 && hour < 12;
    }
    if (filterBy === 'afternoon') {
      const hour = new Date(flight.Segments[0][0].Origin.DepTime).getHours();
      return hour >= 12 && hour < 18;
    }
    if (filterBy === 'evening') {
      const hour = new Date(flight.Segments[0][0].Origin.DepTime).getHours();
      return hour >= 18;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Flight Results</h1>
            <p className="text-gray-600">{filteredFlights.length} flights found</p>
          </div>
          <button
            onClick={() => router.push('/flights/search')}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            New Search
          </button>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'price', label: 'Price', icon: '💰' },
              { value: 'duration', label: 'Duration', icon: '⏱️' },
              { value: 'departure', label: 'Time', icon: '🕐' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
            {[
              { value: 'all', label: 'All', icon: '✈️' },
              { value: 'nonstop', label: 'Non-stop', icon: '🎯' },
              { value: 'morning', label: 'Morning', icon: '🌅' },
              { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
              { value: 'evening', label: 'Evening', icon: '🌆' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilterBy(option.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterBy === option.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block lg:w-64 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Sort by</h3>
              <div className="space-y-2">
                {[
                  { value: 'price', label: 'Price (Low to High)', icon: '💰' },
                  { value: 'duration', label: 'Duration', icon: '⏱️' },
                  { value: 'departure', label: 'Departure Time', icon: '🕐' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Filter by</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Flights', icon: '✈️' },
                  { value: 'nonstop', label: 'Non-stop', icon: '🎯' },
                  { value: 'morning', label: 'Morning (6AM-12PM)', icon: '🌅' },
                  { value: 'afternoon', label: 'Afternoon (12PM-6PM)', icon: '☀️' },
                  { value: 'evening', label: 'Evening (6PM+)', icon: '🌆' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterBy(option.value)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      filterBy === option.value ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flight Results */}
          <div className="flex-1 space-y-4">
            {filteredFlights.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              filteredFlights.map((flight: any, index: number) => {
                const segment = flight.Segments[0][0];
                const fare = flight.Fare;
                const depTime = new Date(segment.Origin.DepTime);
                const arrTime = new Date(segment.Destination.ArrTime);
                const duration = Math.floor(segment.Duration / 60);
                const minutes = segment.Duration % 60;
                
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="p-4 sm:p-6">
                      {/* Airline Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://www.gstatic.com/flights/airline_logos/70px/${segment.Airline.AirlineCode}.png`}
                              alt={segment.Airline.AirlineName}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                            <span className="text-blue-600 font-bold text-sm hidden">{segment.Airline.AirlineCode}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{segment.Airline.AirlineName}</h3>
                            <p className="text-sm text-gray-500">{segment.Airline.AirlineCode}-{segment.Airline.FlightNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {flight.IsLCC && (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">LCC</span>
                          )}
                          {!segment.StopOver && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Non-stop</span>
                          )}
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="space-y-4">
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {depTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                              </div>
                              <div className="text-sm font-medium text-gray-600">{segment.Origin.Airport.AirportCode}</div>
                            </div>
                            <div className="flex-1 px-3 text-center">
                              <div className="text-sm font-medium text-gray-600">{duration}h {minutes}m</div>
                              <div className="flex items-center justify-center my-1">
                                <div className="w-8 border-t border-gray-300"></div>
                                <svg className="w-4 h-4 text-blue-500 mx-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                </svg>
                                <div className="w-8 border-t border-gray-300"></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {segment.StopOver ? `${segment.StopOver} stop` : 'Direct'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {arrTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                              </div>
                              <div className="text-sm font-medium text-gray-600">{segment.Destination.Airport.AirportCode}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-blue-600">
                              ₹{fare.PublishedFare.toLocaleString()}
                            </div>
                            <button
                              onClick={() => handleBookNow(flight)}
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {loading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span className="hidden xs:inline">Processing...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Book Now
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-center">
                                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {depTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                                  </div>
                                  <div className="text-sm font-medium text-gray-600">{segment.Origin.Airport.AirportCode}</div>
                                  <div className="text-xs text-gray-500">{segment.Origin.Airport.CityName}</div>
                                </div>

                                <div className="flex-1 px-4">
                                  <div className="text-center mb-2">
                                    <div className="text-sm font-medium text-gray-600">{duration}h {minutes}m</div>
                                    <div className="text-xs text-gray-500">
                                      {segment.StopOver ? `${segment.StopOver} stop` : 'Direct'}
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                      <div className="w-full border-t-2 border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                      <span className="bg-white px-2">
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                        </svg>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {arrTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                                  </div>
                                  <div className="text-sm font-medium text-gray-600">{segment.Destination.Airport.AirportCode}</div>
                                  <div className="text-xs text-gray-500">{segment.Destination.Airport.CityName}</div>
                                </div>
                              </div>
                            </div>

                            <div className="ml-6 text-right">
                              <div className="mb-4">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                  ₹{fare.PublishedFare.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">per person</div>
                              </div>
                              <button
                                onClick={() => handleBookNow(flight)}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {loading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Book Now
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}