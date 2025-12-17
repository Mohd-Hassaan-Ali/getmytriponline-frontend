'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function BookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [ssrData, setSSRData] = useState<any>(null);
  const [fareRules, setFareRules] = useState<any>(null);
  const [selectedBaggage, setSelectedBaggage] = useState<any>({});
  const [selectedMeals, setSelectedMeals] = useState<any>({});
  const [selectedSeats, setSelectedSeats] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('selectedFlight');
    if (!data) {
      router.push('/flights/search');
      return;
    }
    
    const parsed = JSON.parse(data);
    setBookingData(parsed);
    
    const isInternational = parsed.flight.Segments[0][0].Origin.Airport.CountryCode !== parsed.flight.Segments[0][0].Destination.Airport.CountryCode;
    const counts = parsed.passengerCounts || {adults: 1, children: 0, infants: 0};
    
    const paxList = [];
    for (let i = 0; i < counts.adults; i++) {
      paxList.push({
        Title: 'Mr',
        FirstName: '',
        LastName: '',
        PaxType: 1,
        DateOfBirth: '',
        Gender: 1,
        AddressLine1: '',
        City: '',
        CountryCode: 'IN',
        CountryName: 'India',
        Nationality: 'IN',
        ContactNo: '',
        Email: '',
        IsLeadPax: i === 0,
        PassportNo: isInternational ? '' : undefined,
        PassportExpiry: isInternational ? '' : undefined,
        PAN: parsed.fareQuote.IsPanRequiredAtBook || parsed.fareQuote.IsPanRequiredAtTicket ? '' : undefined
      });
    }
    for (let i = 0; i < counts.children; i++) {
      paxList.push({
        Title: 'Miss',
        FirstName: '',
        LastName: '',
        PaxType: 2,
        DateOfBirth: '',
        Gender: 2,
        AddressLine1: '',
        City: '',
        CountryCode: 'IN',
        CountryName: 'India',
        Nationality: 'IN',
        ContactNo: '',
        Email: '',
        IsLeadPax: false,
        PassportNo: isInternational ? '' : undefined,
        PassportExpiry: isInternational ? '' : undefined
      });
    }
    for (let i = 0; i < counts.infants; i++) {
      paxList.push({
        Title: 'Mstr',
        FirstName: '',
        LastName: '',
        PaxType: 3,
        DateOfBirth: '',
        Gender: 1,
        AddressLine1: '',
        City: '',
        CountryCode: 'IN',
        CountryName: 'India',
        Nationality: 'IN',
        ContactNo: '',
        Email: '',
        IsLeadPax: false,
        PassportNo: isInternational ? '' : undefined,
        PassportExpiry: isInternational ? '' : undefined
      });
    }
    setPassengers(paxList);
    
    // Load SSR data
    console.log('SSR Data:', parsed.ssrData);
    console.log('Fare Rules:', parsed.fareRules);
    if (parsed.ssrData) {
      setSSRData(parsed.ssrData);
    }
    
    // Load fare rules
    if (parsed.fareRules) {
      setFareRules(parsed.fareRules);
    }
  }, [router]);

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const validateStep1 = () => {
    if (!passengers[0].ContactNo || passengers[0].ContactNo.length < 10) {
      setError('Valid phone number is mandatory');
      return false;
    }
    if (bookingData.flight.IsLCC && !passengers[0].Email) {
      setError('Email is mandatory for LCC flights');
      return false;
    }
    if (bookingData.flight.IsLCC && !passengers[0].AddressLine1) {
      setError('Address is mandatory for LCC flights');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && !validateStep1()) return;
    setCurrentStep(currentStep + 1);
  };

  const handleBook = async () => {
    setError('');
    setLoading(true);

    try {
      const bookRes = await api.post('/tbo/book', {
        traceId: bookingData.traceId,
        resultIndex: bookingData.flight.ResultIndex,
        passengers,
        fareQuoteData: bookingData.fareQuote,
        isLCC: bookingData.flight.IsLCC
      });
      
      if (bookRes.data.status === 'success') {
        const pnr = bookRes.data.data?.PNR || bookRes.data.data?.Response?.PNR || 'N/A';
        const bookingId = bookRes.data.data?.BookingId || bookRes.data.data?.Response?.BookingId || 'N/A';
        
        try {
          await api.post('/tbo/booking-details', {
            traceId: bookingData.traceId,
            bookingId: bookingId
          });
        } catch (err) {
          console.error('GetBookingDetails error:', err);
        }
        
        alert(`Booking successful!\\nPNR: ${pnr}\\nBooking ID: ${bookingId}`);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const segment = bookingData.flight.Segments[0][0];
  const fare = bookingData.fareQuote.Fare;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Complete Your Booking</h1>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 font-medium">Passenger Details</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{width: currentStep >= 2 ? '100%' : '0%'}}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 font-medium">Add-ons & Review</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{width: currentStep >= 3 ? '100%' : '0%'}}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {/* Step 1: Passenger Details */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Passenger Details</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border-b pb-4 mb-4">
                      <h3 className="font-medium mb-3">Passenger {index + 1} ({passenger.PaxType === 1 ? 'Adult' : passenger.PaxType === 2 ? 'Child' : 'Infant'})</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Title *</label>
                          <select value={passenger.Title} onChange={(e) => { updatePassenger(index, 'Title', e.target.value); updatePassenger(index, 'Gender', e.target.value === 'Mr' ? 1 : 2); }} className="w-full px-3 py-2 border rounded" required>
                            <option value="Mr">Mr</option>
                            <option value="Ms">Ms</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Mstr">Mstr (Infant)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">First Name *</label>
                          <input type="text" value={passenger.FirstName} onChange={(e) => updatePassenger(index, 'FirstName', e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Last Name *</label>
                          <input type="text" value={passenger.LastName} onChange={(e) => updatePassenger(index, 'LastName', e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Date of Birth *</label>
                          <input type="date" value={passenger.DateOfBirth} onChange={(e) => updatePassenger(index, 'DateOfBirth', e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        {passenger.IsLeadPax && (
                          <>
                            <div>
                              <label className="block text-sm mb-1">Contact Number *</label>
                              <input type="tel" value={passenger.ContactNo} onChange={(e) => updatePassenger(index, 'ContactNo', e.target.value)} className="w-full px-3 py-2 border rounded" required />
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Email {bookingData.flight.IsLCC && '*'}</label>
                              <input type="email" value={passenger.Email} onChange={(e) => updatePassenger(index, 'Email', e.target.value)} className="w-full px-3 py-2 border rounded" required={bookingData.flight.IsLCC} />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm mb-1">Address {bookingData.flight.IsLCC && '*'}</label>
                              <input type="text" value={passenger.AddressLine1} onChange={(e) => updatePassenger(index, 'AddressLine1', e.target.value)} className="w-full px-3 py-2 border rounded" required={bookingData.flight.IsLCC} />
                            </div>
                            <div>
                              <label className="block text-sm mb-1">City</label>
                              <input type="text" value={passenger.City} onChange={(e) => updatePassenger(index, 'City', e.target.value)} className="w-full px-3 py-2 border rounded" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">Continue to Add-ons</button>
                </form>
              </div>
            )}

            {/* Step 2: Add-ons & SSR */}
            {currentStep === 2 && ssrData && (
              <div className="space-y-6">
                {/* Baggage */}
                {ssrData.Baggage && ssrData.Baggage[0] && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Extra Baggage
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">Add extra baggage to your journey</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ssrData.Baggage[0].map((bag: any, idx: number) => (
                          <div key={idx} className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedBaggage[0]?.Code === bag.Code ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                          }`} onClick={() => setSelectedBaggage({...selectedBaggage, 0: bag})}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedBaggage[0]?.Code === bag.Code ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                                  }`}>
                                    {selectedBaggage[0]?.Code === bag.Code && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{bag.Weight > 0 ? `${bag.Weight} kg` : 'No Baggage'}</p>
                                    <p className="text-xs text-gray-500">{bag.Origin} → {bag.Destination}</p>
                                  </div>
                                </div>
                                {bag.Text && <p className="text-xs text-gray-600 mt-2 ml-8">{bag.Text}</p>}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-gray-900">₹{bag.Price.toLocaleString()}</p>
                                {bag.Price === 0 && <span className="text-xs text-green-600 font-medium">Included</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {ssrData.MealDynamic && ssrData.MealDynamic[0] && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        In-Flight Meals
                      </h2>
                      <p className="text-orange-100 text-sm mt-1">Pre-order your favorite meals</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ssrData.MealDynamic[0].map((meal: any, idx: number) => (
                          <div key={idx} className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedMeals[0]?.Code === meal.Code ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                          }`} onClick={() => setSelectedMeals({...selectedMeals, 0: meal})}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedMeals[0]?.Code === meal.Code ? 'border-orange-600 bg-orange-600' : 'border-gray-300'
                                  }`}>
                                    {selectedMeals[0]?.Code === meal.Code && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{meal.Code === 'NoMeal' ? 'No Meal' : meal.Code}</p>
                                    <p className="text-xs text-gray-500">{meal.Origin} → {meal.Destination}</p>
                                  </div>
                                </div>
                                {meal.AirlineDescription && <p className="text-sm text-gray-700 mt-2 ml-8">{meal.AirlineDescription}</p>}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-gray-900">₹{meal.Price.toLocaleString()}</p>
                                {meal.Price === 0 && <span className="text-xs text-green-600 font-medium">Free</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seats */}
                {ssrData.SeatDynamic && ssrData.SeatDynamic[0] && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Seat Selection
                      </h2>
                      <p className="text-purple-100 text-sm mt-1">Choose your preferred seat</p>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center"><div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded mr-2"></div><span>Available</span></div>
                        <div className="flex items-center"><div className="w-8 h-8 bg-purple-100 border-2 border-purple-500 rounded mr-2"></div><span>Selected</span></div>
                        <div className="flex items-center"><div className="w-8 h-8 bg-gray-200 border-2 border-gray-400 rounded mr-2"></div><span>Occupied</span></div>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                          {ssrData.SeatDynamic[0].SegmentSeat[0].RowSeats.slice(1).map((row: any, rowIdx: number) => (
                            <div key={rowIdx} className="flex items-center justify-center mb-2">
                              <span className="w-8 text-center text-sm font-medium text-gray-600">{row.Seats[0].RowNo}</span>
                              <div className="flex space-x-2">
                                {row.Seats.map((seat: any, seatIdx: number) => {
                                  const isAvailable = seat.AvailablityType === 1;
                                  const isSelected = selectedSeats[0]?.Code === seat.Code;
                                  const seatTypeLabel = seat.SeatType === 1 ? 'W' : seat.SeatType === 2 ? 'A' : seat.SeatType === 3 ? 'M' : '';
                                  
                                  return (
                                    <div key={seatIdx} className="relative">
                                      <button
                                        type="button"
                                        disabled={!isAvailable}
                                        onClick={() => isAvailable && setSelectedSeats({...selectedSeats, 0: seat})}
                                        className={`w-10 h-10 rounded text-xs font-medium transition-all ${
                                          isSelected ? 'bg-purple-600 text-white border-2 border-purple-700 shadow-lg scale-110' :
                                          isAvailable ? 'bg-green-50 text-gray-700 border-2 border-green-500 hover:bg-green-100 hover:scale-105' :
                                          'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                                        }`}
                                      >
                                        {seat.SeatNo}
                                      </button>
                                      {isAvailable && seat.Price > 0 && (
                                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">₹{seat.Price}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button onClick={() => setCurrentStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300">Back</button>
                  <button onClick={handleBook} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fare Summary Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Fare Summary</h2>
              
              <div className="mb-4 pb-4 border-b">
                <p className="font-bold">{segment.Airline.AirlineName}</p>
                <p className="text-sm text-gray-600">{segment.Origin.Airport.AirportCode} → {segment.Destination.Airport.AirportCode}</p>
                <p className="text-xs text-gray-500">{new Date(segment.Origin.DepTime).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{fare.BaseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{fare.Tax.toLocaleString()}</span>
                </div>
                {Object.keys(selectedBaggage).length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Baggage</span>
                    <span>₹{Object.values(selectedBaggage).reduce((sum: number, b: any) => sum + (b?.Price || 0), 0).toLocaleString()}</span>
                  </div>
                )}
                {Object.keys(selectedMeals).length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Meals</span>
                    <span>₹{Object.values(selectedMeals).reduce((sum: number, m: any) => sum + (m?.Price || 0), 0).toLocaleString()}</span>
                  </div>
                )}
                {Object.keys(selectedSeats).length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Seats</span>
                    <span>₹{Object.values(selectedSeats).reduce((sum: number, s: any) => sum + (s?.Price || 0), 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(fare.PublishedFare + Object.values(selectedBaggage).reduce((sum: number, b: any) => sum + (b?.Price || 0), 0) + Object.values(selectedMeals).reduce((sum: number, m: any) => sum + (m?.Price || 0), 0) + Object.values(selectedSeats).reduce((sum: number, s: any) => sum + (s?.Price || 0), 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Instant confirmation</p>
                <p>✓ Free cancellation within 24hrs</p>
                <p>✓ Secure payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
