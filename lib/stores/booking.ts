import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingState {
  searchParams: FlightSearchParams | null;
  searchResults: any[];
  selectedFlight: any | null;
  passengers: Passenger[];
  bookingStep: 'search' | 'select' | 'passenger' | 'payment' | 'confirmation';
  
  setSearchParams: (params: FlightSearchParams) => void;
  setSearchResults: (results: any[]) => void;
  setSelectedFlight: (flight: any) => void;
  addPassenger: (passenger: Passenger) => void;
  updatePassenger: (index: number, passenger: Passenger) => void;
  removePassenger: (index: number) => void;
  setBookingStep: (step: BookingState['bookingStep']) => void;
  resetBooking: () => void;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  tripType: 'oneway' | 'roundtrip';
  cabinClass: 'economy' | 'business' | 'first';
}

interface Passenger {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  passportNumber?: string;
  passportExpiry?: string;
  nationality: string;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      searchParams: null,
      searchResults: [],
      selectedFlight: null,
      passengers: [],
      bookingStep: 'search',
      
      setSearchParams: (params) => set({ searchParams: params }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      
      addPassenger: (passenger) => set((state) => ({
        passengers: [...state.passengers, passenger]
      })),
      
      updatePassenger: (index, passenger) => set((state) => ({
        passengers: state.passengers.map((p, i) => i === index ? passenger : p)
      })),
      
      removePassenger: (index) => set((state) => ({
        passengers: state.passengers.filter((_, i) => i !== index)
      })),
      
      setBookingStep: (step) => set({ bookingStep: step }),
      
      resetBooking: () => set({
        searchParams: null,
        searchResults: [],
        selectedFlight: null,
        passengers: [],
        bookingStep: 'search'
      })
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        searchParams: state.searchParams,
        selectedFlight: state.selectedFlight,
        passengers: state.passengers,
        bookingStep: state.bookingStep
      })
    }
  )
);