import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'user' | 'author';
export type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface BookSubmission {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  pages: number;
  coverColor: string;
  submittedAt: string;
}

export interface AuthorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bio: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  books: BookSubmission[];
}

export interface AuthorBookEntry {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  price: number;
  pages: number;
  coverColor: string;
  publishedAt: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
}

interface UserStore {
  role: UserRole;
  applicationStatus: ApplicationStatus;
  application: AuthorApplication | null;
  authorBooks: AuthorBookEntry[];
  submitApplication: (app: Omit<AuthorApplication, 'id' | 'userId' | 'status' | 'submittedAt'>) => void;
  publishBook: (book: Omit<AuthorBookEntry, 'id' | 'publishedAt' | 'sales' | 'revenue' | 'rating' | 'reviews'>) => void;
  // Admin-triggered actions (simulated for frontend-only)
  _approveApplication: () => void;
  _rejectApplication: (note: string) => void;
}

const COVER_COLORS = [
  'linear-gradient(135deg,#C17817,#8B4513)',
  'linear-gradient(135deg,#4F8EF7,#1E40AF)',
  'linear-gradient(135deg,#34D399,#065F46)',
  'linear-gradient(135deg,#A78BFA,#5B21B6)',
  'linear-gradient(135deg,#FB923C,#9A3412)',
  'linear-gradient(135deg,#22D3EE,#0E7490)',
  'linear-gradient(135deg,#F472B6,#9D174D)',
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      role: 'user',
      applicationStatus: 'none',
      application: null,
      authorBooks: [],

      submitApplication: (appData) => {
        const id = `app_${Date.now()}`;
        const application: AuthorApplication = {
          ...appData,
          id,
          userId: 'u_current',
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };
        set({ applicationStatus: 'pending', application });
      },

      publishBook: (bookData) => {
        const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
        const newBook: AuthorBookEntry = {
          ...bookData,
          id: `ab_${Date.now()}`,
          publishedAt: new Date().toISOString(),
          sales: 0,
          revenue: 0,
          rating: 0,
          reviews: 0,
          coverColor: randomColor,
        };
        set((s) => ({ authorBooks: [newBook, ...s.authorBooks] }));
      },

      _approveApplication: () => {
        const app = get().application;
        if (!app) return;
        set({
          role: 'author',
          applicationStatus: 'approved',
          application: { ...app, status: 'approved', reviewedAt: new Date().toISOString() },
        });
      },

      _rejectApplication: (note: string) => {
        const app = get().application;
        if (!app) return;
        set({
          applicationStatus: 'rejected',
          application: { ...app, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNote: note },
        });
      },
    }),
    { name: 'lehkhabu-user-store' }
  )
);
