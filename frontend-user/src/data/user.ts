import type { UserProfile } from '../types';
import { books } from './books';

// Compute accurate stats from actual book data
const purchasedBooks = books.filter((b) => b.purchased);
const readBooks = purchasedBooks.filter((b) => !b.currentPage);
const currentlyReadingBooks = purchasedBooks.filter((b) => b.currentPage);
const wantToReadBooks = books.filter((b) => !b.purchased);

// Days remaining in 2026
const now = new Date();
const endOfYear = new Date(now.getFullYear(), 11, 31);
const daysLeft = Math.ceil((endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

export const currentUser: UserProfile = {
  name: 'Joel',
  username: '@joellalrin',
  totalRead: readBooks.length,
  following: 26,
  followers: 3,
  readingChallenge: {
    goal: 24,
    completed: readBooks.length,
    year: now.getFullYear(),
    daysLeft,
  },
};

export { readBooks, currentlyReadingBooks, wantToReadBooks, purchasedBooks };
