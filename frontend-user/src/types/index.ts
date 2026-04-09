export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  description: string;
  totalPages: number;
  currentPage?: number;
  coverColors: [string, string];
  coverTextColor: string;
  coverImage?: string;
  price: number;
  purchased: boolean;
  content: string[];
}

export interface UserProfile {
  name: string;
  username: string;
  totalRead: number;
  following: number;
  followers: number;
  readingChallenge: {
    goal: number;
    completed: number;
    year: number;
    daysLeft: number;
  };
}

export interface Category {
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export type ShelfType = 'reading' | 'wantToRead' | 'read';
