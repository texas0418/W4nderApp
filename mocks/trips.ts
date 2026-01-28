import { Trip, Activity, DayItinerary } from '@/types';
import { destinations } from './destinations';

const createActivity = (
  id: string,
  name: string,
  description: string,
  image: string,
  duration: string,
  price: number,
  category: string,
  rating: number,
  time: string,
  location: string,
  isBooked: boolean = true
): Activity => ({
  id,
  name,
  description,
  image,
  duration,
  price,
  currency: 'EUR',
  category,
  rating,
  time,
  location,
  isBooked,
});

const santoriniItinerary: DayItinerary[] = [
  {
    day: 1,
    date: '2025-06-15',
    title: 'Arrival & Oia Sunset',
    activities: [
      createActivity(
        'a1',
        'Airport Transfer & Hotel Check-in',
        'Private transfer from Santorini Airport to your hotel in Oia',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
        '45 min',
        45,
        'Transport',
        4.8,
        '14:00',
        'Santorini Airport'
      ),
      createActivity(
        'a2',
        'Oia Village Exploration',
        'Wander through the iconic white-washed streets of Oia',
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400',
        '2 hours',
        0,
        'Sightseeing',
        4.9,
        '16:00',
        'Oia Village'
      ),
      createActivity(
        'a3',
        'Sunset Dinner at Ammoudi Bay',
        'Fresh seafood dinner with stunning caldera views',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        '2 hours',
        85,
        'Dining',
        4.9,
        '19:00',
        'Ammoudi Bay'
      ),
    ],
  },
  {
    day: 2,
    date: '2025-06-16',
    title: 'Volcanic Adventure',
    activities: [
      createActivity(
        'a4',
        'Caldera Cruise & Volcano Hike',
        'Sail to the volcanic islands and hike to the crater',
        'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=400',
        '5 hours',
        95,
        'Adventure',
        4.7,
        '09:00',
        'Old Port'
      ),
      createActivity(
        'a5',
        'Hot Springs Swimming',
        'Swim in the natural hot springs near the volcano',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        '1 hour',
        0,
        'Wellness',
        4.5,
        '13:00',
        'Palea Kameni'
      ),
      createActivity(
        'a6',
        'Wine Tasting Tour',
        'Visit three local wineries and taste Assyrtiko wines',
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
        '3 hours',
        75,
        'Food & Drink',
        4.8,
        '17:00',
        'Pyrgos Village'
      ),
    ],
  },
  {
    day: 3,
    date: '2025-06-17',
    title: 'Beach Day & Culture',
    activities: [
      createActivity(
        'a7',
        'Red Beach Morning',
        'Relax at the famous red sand beach surrounded by red cliffs',
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400',
        '3 hours',
        0,
        'Beach',
        4.6,
        '09:00',
        'Akrotiri'
      ),
      createActivity(
        'a8',
        'Akrotiri Archaeological Site',
        'Explore the ancient Minoan city preserved in volcanic ash',
        'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400',
        '2 hours',
        15,
        'Cultural',
        4.8,
        '13:00',
        'Akrotiri'
      ),
      createActivity(
        'a9',
        'Fira Evening Stroll',
        'Explore the vibrant capital with shopping and dinner',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
        '4 hours',
        60,
        'Entertainment',
        4.7,
        '18:00',
        'Fira'
      ),
    ],
  },
  {
    day: 4,
    date: '2025-06-18',
    title: 'Departure',
    activities: [
      createActivity(
        'a10',
        'Sunrise Yoga Session',
        'Start your day with caldera-view yoga',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        '1 hour',
        25,
        'Wellness',
        4.9,
        '06:30',
        'Hotel Terrace'
      ),
      createActivity(
        'a11',
        'Farewell Brunch',
        'Final Greek breakfast with fresh pastries',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        '1.5 hours',
        35,
        'Dining',
        4.8,
        '08:30',
        'Hotel Restaurant'
      ),
      createActivity(
        'a12',
        'Airport Transfer',
        'Private transfer to Santorini Airport',
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
        '30 min',
        40,
        'Transport',
        4.8,
        '11:00',
        'Hotel'
      ),
    ],
  },
];

export const trips: Trip[] = [
  {
    id: '1',
    destination: destinations[0],
    startDate: '2025-06-15',
    endDate: '2025-06-18',
    status: 'upcoming',
    totalBudget: 2500,
    spentBudget: 1850,
    currency: 'EUR',
    travelers: 2,
    itinerary: santoriniItinerary,
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
  },
  {
    id: '2',
    destination: destinations[1],
    startDate: '2025-09-10',
    endDate: '2025-09-17',
    status: 'planning',
    totalBudget: 4000,
    spentBudget: 0,
    currency: 'USD',
    travelers: 2,
    itinerary: [],
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  },
  {
    id: '3',
    destination: destinations[2],
    startDate: '2024-11-20',
    endDate: '2024-11-28',
    status: 'completed',
    totalBudget: 3200,
    spentBudget: 2890,
    currency: 'USD',
    travelers: 2,
    itinerary: [],
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  },
];

export const upcomingTrips = trips.filter(t => t.status === 'upcoming');
export const planningTrips = trips.filter(t => t.status === 'planning');
export const completedTrips = trips.filter(t => t.status === 'completed');
