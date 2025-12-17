export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  walletBalance: number;
  agencyName?: string;
  phone?: string;
}

export interface FlightSearchParams {
  JourneyType: 1 | 2;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  Segments: FlightSegment[];
}

export interface FlightSegment {
  Origin: string;
  Destination: string;
  FlightCabinClass: number;
  PreferredDepartureTime: string;
  PreferredArrivalTime: string;
}

export interface Flight {
  resultIndex: string;
  isLCC: boolean;
  isRefundable: boolean;
  fare: {
    baseFare: number;
    tax: number;
    publishedFare: number;
    offeredFare: number;
  };
  segments: Array<{
    airline: {
      code: string;
      name: string;
      flightNumber: string;
    };
    origin: {
      airport: string;
      city: string;
      depTime: string;
    };
    destination: {
      airport: string;
      city: string;
      arrTime: string;
    };
    duration: number;
  }>;
}

export interface Booking {
  id: string;
  bookingId: string;
  pnr: string;
  status: string;
  totalFare: number;
  agentMarkup: number;
  createdAt: string;
  flight: Flight;
}
