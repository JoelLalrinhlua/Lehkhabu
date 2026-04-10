import { create } from 'zustand';
import type { Book, ShelfEntry, ReadingProgress } from '../services/books.service';
import {
  fetchAllBooks,
  fetchUserShelf,
  upsertShelfEntry,
  removeShelfEntry,
  fetchReadingProgress,
  checkPurchase,
  fetchUserPurchases,
} from '../services/books.service';

interface BooksState {
  // All published books
  books: Book[];
  booksLoading: boolean;
  booksError: string | null;

  // User-specific data
  shelf: ShelfEntry[];
  shelfLoading: boolean;
  purchases: string[]; // book IDs the user has purchased
  readingProgress: Record<string, ReadingProgress>;

  // Actions
  loadBooks: (opts?: { category?: string; search?: string }) => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
  toggleWishlist: (userId: string, bookId: string) => Promise<void>;
  markReading: (userId: string, bookId: string) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;
  isOwned: (bookId: string) => boolean;
}

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  booksLoading: false,
  booksError: null,
  shelf: [],
  shelfLoading: false,
  purchases: [],
  readingProgress: {},

  loadBooks: async (opts = {}) => {
    set({ booksLoading: true, booksError: null });
    try {
      const books = await fetchAllBooks(opts);
      set({ books, booksLoading: false });
    } catch (e) {
      set({
        booksError: e instanceof Error ? e.message : 'Failed to load books',
        booksLoading: false,
      });
    }
  },

  loadUserData: async (userId: string) => {
    set({ shelfLoading: true });
    try {
      const [shelfData, purchasesData] = await Promise.all([
        fetchUserShelf(userId),
        fetchUserPurchases(userId),
      ]);

      const purchasedBookIds = purchasesData.map(
        (p: { book_id: string }) => p.book_id
      );

      set({
        shelf: shelfData as ShelfEntry[],
        purchases: purchasedBookIds,
        shelfLoading: false,
      });
    } catch (e) {
      console.error('Failed to load user book data:', e);
      set({ shelfLoading: false });
    }
  },

  toggleWishlist: async (userId: string, bookId: string) => {
    const { shelf } = get();
    const existing = shelf.find((s) => s.book_id === bookId && s.shelf === 'WANT_TO_READ');

    if (existing) {
      // Remove from wishlist
      await removeShelfEntry(userId, bookId);
      set({ shelf: shelf.filter((s) => !(s.book_id === bookId && s.shelf === 'WANT_TO_READ')) });
    } else {
      // Add to wishlist
      const newEntry = await upsertShelfEntry(userId, bookId, 'WANT_TO_READ') as unknown as ShelfEntry;
      set({ shelf: [...shelf.filter((s) => s.book_id !== bookId), newEntry] });
    }
  },

  markReading: async (userId: string, bookId: string) => {
    const newEntry = await upsertShelfEntry(userId, bookId, 'READING') as unknown as ShelfEntry;
    const { shelf } = get();
    set({ shelf: [...shelf.filter((s) => s.book_id !== bookId), newEntry] });
  },

  isInWishlist: (bookId: string) => {
    return get().shelf.some((s) => s.book_id === bookId && s.shelf === 'WANT_TO_READ');
  },

  isOwned: (bookId: string) => {
    const { purchases, books } = get();
    const book = books.find((b) => b.id === bookId);
    return purchases.includes(bookId) || (book?.is_free ?? false);
  },
}));
