import type { Book, User, Author, Order, Announcement, UISettings } from '../types';

// ── Mock Books ────────────────────────────────────────────────
export const mockBooks: Book[] = [
  {
    id: 'b1', title: 'Kalpana', author: 'Lalhminawla Sailo', authorId: 'a1',
    genre: 'Fiction', price: 149, status: 'approved', featured: true,
    coverColor: 'linear-gradient(135deg,#C17817,#8B4513)',
    pages: 312, rating: 4.7, reviews: 84, sales: 412, revenue: 61388,
    submittedAt: '2026-01-10', publishedAt: '2026-01-15',
    description: 'A beautiful story set in the hills of Mizoram exploring dreams and ambitions.',
    language: 'Mizo', isbn: '978-1-234-56789-0'
  },
  {
    id: 'b2', title: 'Pathian Thu Ziak', author: 'Rev. C. Thanga', authorId: 'a2',
    genre: 'Religious', price: 199, status: 'approved', featured: false,
    coverColor: 'linear-gradient(135deg,#4F8EF7,#1E40AF)',
    pages: 428, rating: 4.9, reviews: 213, sales: 623, revenue: 123877,
    submittedAt: '2025-11-05', publishedAt: '2025-11-20',
    description: 'A profound theological work rooted in Mizo Christian tradition.',
    language: 'Mizo', isbn: '978-1-234-56789-1'
  },
  {
    id: 'b3', title: 'Mizoram History', author: 'Dr. Vanlal Hluna', authorId: 'a3',
    genre: 'History', price: 299, status: 'approved', featured: true,
    coverColor: 'linear-gradient(135deg,#34D399,#065F46)',
    pages: 554, rating: 4.8, reviews: 97, sales: 289, revenue: 86411,
    submittedAt: '2025-09-15', publishedAt: '2025-10-01',
    description: 'Comprehensive history of Mizoram from ancient times to the present.',
    language: 'English', isbn: '978-1-234-56789-2'
  },
  {
    id: 'b4', title: 'Dawt Pa Thu', author: 'Malsawmi Jacob', authorId: 'a4',
    genre: 'Novel', price: 129, status: 'approved', featured: false,
    coverColor: 'linear-gradient(135deg,#A78BFA,#5B21B6)',
    pages: 284, rating: 4.5, reviews: 62, sales: 178, revenue: 22962,
    submittedAt: '2026-02-01', publishedAt: '2026-02-14',
    description: 'A moving novel about love and sacrifice in a changing society.',
    language: 'Mizo', isbn: '978-1-234-56789-3'
  },
  {
    id: 'b5', title: 'The Hills of Aizawl', author: 'Zodingliana Colney', authorId: 'a5',
    genre: 'Travel', price: 179, status: 'approved', featured: true,
    coverColor: 'linear-gradient(135deg,#FB923C,#9A3412)',
    pages: 198, rating: 4.3, reviews: 44, sales: 134, revenue: 23986,
    submittedAt: '2026-03-01', publishedAt: '2026-03-15',
    description: 'A traveller\'s guide and memoir of exploring Aizawl\'s hidden gems.',
    language: 'English', isbn: '978-1-234-56789-4'
  },
  {
    id: 'b6', title: 'Hmar Hla Thar', author: 'Lalkima Hmar', authorId: 'a6',
    genre: 'Poetry', price: 99, status: 'approved', featured: false,
    coverColor: 'linear-gradient(135deg,#22D3EE,#0E7490)',
    pages: 142, rating: 4.6, reviews: 38, sales: 96, revenue: 9504,
    submittedAt: '2026-03-20', publishedAt: '2026-04-01',
    description: 'A collection of fresh Hmar poetry celebrating nature and culture.',
    language: 'Hmar', isbn: '978-1-234-56789-5'
  },
  {
    id: 'b7', title: 'Chawlhna Bial', author: 'Zaihmingthanga', authorId: 'a7',
    genre: 'Short Stories', price: 89, status: 'pending', featured: false,
    coverColor: 'linear-gradient(135deg,#F472B6,#9D174D)',
    pages: 176, rating: 0, reviews: 0, sales: 0, revenue: 0,
    submittedAt: '2026-04-05',
    description: 'Short stories about village life and change in rural Mizoram.',
    language: 'Mizo'
  },
  {
    id: 'b8', title: 'Thlarau Rintlang', author: 'Lalrindika Ralte', authorId: 'a8',
    genre: 'Spiritual', price: 119, status: 'pending', featured: false,
    coverColor: 'linear-gradient(135deg,#6EE7B7,#047857)',
    pages: 234, rating: 0, reviews: 0, sales: 0, revenue: 0,
    submittedAt: '2026-04-07',
    description: 'A spiritual journey through Mizo traditions and modern faith.',
    language: 'Mizo'
  },
  {
    id: 'b9', title: 'Zawlbuk Stories', author: 'Thanchhunga', authorId: 'a9',
    genre: 'History', price: 159, status: 'rejected', featured: false,
    coverColor: 'linear-gradient(135deg,#FBBF24,#92400E)',
    pages: 320, rating: 0, reviews: 0, sales: 0, revenue: 0,
    submittedAt: '2026-03-28',
    description: 'Tales from the traditional Zawlbuk dormitory system of Mizoram.',
    language: 'Mizo'
  },
];

// ── Mock Users ────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: 'u1', name: 'Ringsenvy', email: 'ringsenvy@gmail.com', role: 'admin', status: 'active', avatarColor: '#C17817', joinedAt: '2025-08-01', lastActive: '2026-04-09', booksOwned: 0, totalSpent: 0, country: 'India' },
  { id: 'u2', name: 'Lalthansangi', email: 'lalthan@outlook.com', role: 'user', status: 'active', avatarColor: '#4F8EF7', joinedAt: '2025-09-15', lastActive: '2026-04-08', booksOwned: 11, totalSpent: 1849, country: 'India' },
  { id: 'u3', name: 'Zosangzuali', email: 'zuali@gmail.com', role: 'user', status: 'active', avatarColor: '#34D399', joinedAt: '2025-10-03', lastActive: '2026-04-07', booksOwned: 7, totalSpent: 1043, country: 'India' },
  { id: 'u4', name: 'Lalnunhlua', email: 'nunhlua@yahoo.com', role: 'author', status: 'active', avatarColor: '#A78BFA', joinedAt: '2025-10-20', lastActive: '2026-04-06', booksOwned: 3, totalSpent: 398, country: 'India' },
  { id: 'u5', name: 'Mimi Chhangte', email: 'mimi.c@gmail.com', role: 'user', status: 'active', avatarColor: '#F87171', joinedAt: '2025-11-01', lastActive: '2026-04-05', booksOwned: 15, totalSpent: 2745, country: 'India' },
  { id: 'u6', name: 'Pu Zara', email: 'zara.old@mail.com', role: 'user', status: 'suspended', avatarColor: '#FB923C', joinedAt: '2025-11-18', lastActive: '2026-02-12', booksOwned: 2, totalSpent: 248, country: 'India' },
  { id: 'u7', name: 'Sanga Malsawm', email: 'sanga@gmail.com', role: 'user', status: 'active', avatarColor: '#22D3EE', joinedAt: '2025-12-05', lastActive: '2026-04-04', booksOwned: 6, totalSpent: 754, country: 'Myanmar' },
  { id: 'u8', name: 'Zodinpuii', email: 'zodin@gmail.com', role: 'author', status: 'active', avatarColor: '#6EE7B7', joinedAt: '2026-01-02', lastActive: '2026-04-03', booksOwned: 4, totalSpent: 556, country: 'India' },
  { id: 'u9', name: 'Hminga Tlau', email: 'hminga.t@mail.com', role: 'user', status: 'active', avatarColor: '#F472B6', joinedAt: '2026-01-14', lastActive: '2026-04-02', booksOwned: 8, totalSpent: 1112, country: 'India' },
  { id: 'u10', name: 'Vanlalmawii', email: 'mawii99@gmail.com', role: 'user', status: 'active', avatarColor: '#FBBF24', joinedAt: '2026-02-03', lastActive: '2026-04-01', booksOwned: 5, totalSpent: 645, country: 'India' },
];

// ── Mock Authors ──────────────────────────────────────────────
export const mockAuthors: Author[] = [
  { id: 'a1', name: 'Lalhminawla Sailo', email: 'lhminawla@gmail.com', bio: 'Award-winning Mizo novelist', avatarColor: '#C17817', totalBooks: 3, totalSales: 412, totalRevenue: 61388, rating: 4.7, joinedAt: '2025-09-01', verified: true },
  { id: 'a2', name: 'Rev. C. Thanga', email: 'cthanga@church.mz', bio: 'Renowned theologian and writer', avatarColor: '#4F8EF7', totalBooks: 6, totalSales: 623, totalRevenue: 123877, rating: 4.9, joinedAt: '2025-08-15', verified: true },
  { id: 'a3', name: 'Dr. Vanlal Hluna', email: 'vlhluna@mzu.edu', bio: 'Historian and academic', avatarColor: '#34D399', totalBooks: 4, totalSales: 289, totalRevenue: 86411, rating: 4.8, joinedAt: '2025-07-20', verified: true },
  { id: 'a4', name: 'Malsawmi Jacob', email: 'malsawmi.j@gmail.com', bio: 'Bestselling novelist', avatarColor: '#A78BFA', totalBooks: 5, totalSales: 178, totalRevenue: 22962, rating: 4.5, joinedAt: '2025-10-05', verified: true },
  { id: 'a5', name: 'Zodingliana Colney', email: 'colney@outlook.com', bio: 'Travel writer and journalist', avatarColor: '#FB923C', totalBooks: 2, totalSales: 134, totalRevenue: 23986, rating: 4.3, joinedAt: '2026-01-15', verified: false },
  { id: 'a6', name: 'Lalkima Hmar', email: 'lalkima.h@hmar.org', bio: 'Poet and cultural activist', avatarColor: '#22D3EE', totalBooks: 2, totalSales: 96, totalRevenue: 9504, rating: 4.6, joinedAt: '2026-02-01', verified: false },
];

// ── Mock Orders ───────────────────────────────────────────────
export const mockOrders: Order[] = [
  { id: 'ord001', userId: 'u5', userName: 'Mimi Chhangte', bookId: 'b1', bookTitle: 'Kalpana', amount: 149, status: 'completed', createdAt: '2026-04-08T14:22:00Z', paymentMethod: 'Razorpay' },
  { id: 'ord002', userId: 'u2', userName: 'Lalthansangi', bookId: 'b2', bookTitle: 'Pathian Thu Ziak', amount: 199, status: 'completed', createdAt: '2026-04-08T10:15:00Z', paymentMethod: 'UPI' },
  { id: 'ord003', userId: 'u3', userName: 'Zosangzuali', bookId: 'b3', bookTitle: 'Mizoram History', amount: 299, status: 'completed', createdAt: '2026-04-07T18:44:00Z', paymentMethod: 'Card' },
  { id: 'ord004', userId: 'u9', userName: 'Hminga Tlau', bookId: 'b1', bookTitle: 'Kalpana', amount: 149, status: 'completed', createdAt: '2026-04-07T09:33:00Z', paymentMethod: 'UPI' },
  { id: 'ord005', userId: 'u7', userName: 'Sanga Malsawm', bookId: 'b5', bookTitle: 'The Hills of Aizawl', amount: 179, status: 'refunded', createdAt: '2026-04-06T15:10:00Z', paymentMethod: 'Razorpay' },
  { id: 'ord006', userId: 'u10', userName: 'Vanlalmawii', bookId: 'b4', bookTitle: 'Dawt Pa Thu', amount: 129, status: 'completed', createdAt: '2026-04-06T08:05:00Z', paymentMethod: 'Card' },
  { id: 'ord007', userId: 'u2', userName: 'Lalthansangi', bookId: 'b6', bookTitle: 'Hmar Hla Thar', amount: 99, status: 'completed', createdAt: '2026-04-05T20:11:00Z', paymentMethod: 'UPI' },
  { id: 'ord008', userId: 'u5', userName: 'Mimi Chhangte', bookId: 'b3', bookTitle: 'Mizoram History', amount: 299, status: 'completed', createdAt: '2026-04-05T11:22:00Z', paymentMethod: 'Razorpay' },
  { id: 'ord009', userId: 'u4', userName: 'Lalnunhlua', bookId: 'b2', bookTitle: 'Pathian Thu Ziak', amount: 199, status: 'pending', createdAt: '2026-04-05T07:45:00Z', paymentMethod: 'UPI' },
  { id: 'ord010', userId: 'u8', userName: 'Zodinpuii', bookId: 'b1', bookTitle: 'Kalpana', amount: 149, status: 'completed', createdAt: '2026-04-04T16:30:00Z', paymentMethod: 'Card' },
];

// ── Revenue Chart Data (Daily last 7 days) ────────────────────
export const revenueChartData = [
  { day: 'Mon', revenue: 8420, orders: 42 },
  { day: 'Tue', revenue: 12380, orders: 67 },
  { day: 'Wed', revenue: 9760, orders: 51 },
  { day: 'Thu', revenue: 15240, orders: 83 },
  { day: 'Fri', revenue: 18900, orders: 102 },
  { day: 'Sat', revenue: 22340, orders: 124 },
  { day: 'Sun', revenue: 16480, orders: 89 },
];

// ── Genre Distribution ────────────────────────────────────────
export const genreData = [
  { genre: 'Fiction', count: 28, color: '#C17817' },
  { genre: 'Religious', count: 22, color: '#4F8EF7' },
  { genre: 'History', count: 16, color: '#34D399' },
  { genre: 'Poetry', count: 12, color: '#A78BFA' },
  { genre: 'Novel', count: 11, color: '#F87171' },
  { genre: 'Other', count: 11, color: '#8892A4' },
];

// ── Mock Announcements ────────────────────────────────────────
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1', title: 'Independence Day Sale', type: 'promo', active: true,
    message: 'Get 20% off all books this Independence Day!',
    targetAudience: 'all', createdAt: '2026-04-01', expiresAt: '2026-04-15'
  },
  {
    id: 'ann2', title: 'New Author Programme', type: 'info', active: true,
    message: 'We are now accepting applications from new Mizo authors.',
    targetAudience: 'all', createdAt: '2026-03-25'
  },
  {
    id: 'ann3', title: 'Platform Maintenance', type: 'warning', active: false,
    message: 'Scheduled maintenance on April 20 from 2–4 AM IST.',
    targetAudience: 'all', createdAt: '2026-04-08', expiresAt: '2026-04-20'
  },
];

// ── Default UI Settings ───────────────────────────────────────
export const defaultUISettings: UISettings = {
  heroBannerEnabled: true,
  featuredSectionTitle: 'Featured Picks',
  homeHeroText: 'Your Mizo Reading Universe',
  homeSubText: 'Discover books written by your favourite Mizo authors.',
  maintenanceMode: false,
  allowRegistrations: true,
  maxBooksPerUser: 50,
  defaultCurrency: 'INR',
  platformFeePercent: 15,
  newBooksHighlight: true,
  announcementBannerText: 'Get 20% off all books this Independence Day!',
  announcementBannerActive: true,
};

// ── Dashboard Summary ─────────────────────────────────────────
export function getDashboardStats() {
  const totalBooks = mockBooks.length;
  const publishedBooks = mockBooks.filter(b => b.status === 'approved').length;
  const pendingBooks = mockBooks.filter(b => b.status === 'pending').length;
  const totalUsers = mockUsers.length;
  const totalRevenue = mockBooks.reduce((sum, b) => sum + b.revenue, 0);
  const totalOrders = mockOrders.length;
  return { totalBooks, publishedBooks, pendingBooks, totalUsers, totalRevenue, totalOrders };
}
