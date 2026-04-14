import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalBooks: number;
  publishedBooks: number;
  pendingBooks: number;
  draftBooks: number;
  rejectedBooks: number;
  totalUsers: number;
  activeUsers: number;
  totalAuthors: number;
  totalPurchases: number;
  totalRevenue: number;
  pendingApplications: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
}

/** Fetch all dashboard stats using count-only queries (no row data transferred) */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [
    totalBooksRes,
    publishedRes,
    pendingBooksRes,
    draftRes,
    rejectedRes,
    totalUsersRes,
    activeUsersRes,
    totalAuthorsRes,
    totalPurchasesRes,
    pendingAppsRes,
    totalAnnouncementsRes,
    activeAnnouncementsRes,
    revenueRes,
  ] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'AUTHOR'),
    supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
    supabase.from('author_applications').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('is_active', true),
    // Revenue still needs actual data — only completed purchases amount
    supabase.from('purchases').select('amount').eq('status', 'COMPLETED'),
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (s: number, p: { amount: number | null }) => s + (p.amount ?? 0),
    0
  );

  return {
    totalBooks:           totalBooksRes.count         ?? 0,
    publishedBooks:       publishedRes.count          ?? 0,
    pendingBooks:         pendingBooksRes.count        ?? 0,
    draftBooks:           draftRes.count              ?? 0,
    rejectedBooks:        rejectedRes.count           ?? 0,
    totalUsers:           totalUsersRes.count         ?? 0,
    activeUsers:          activeUsersRes.count        ?? 0,
    totalAuthors:         totalAuthorsRes.count       ?? 0,
    totalPurchases:       totalPurchasesRes.count     ?? 0,
    totalRevenue,
    pendingApplications:  pendingAppsRes.count        ?? 0,
    totalAnnouncements:   totalAnnouncementsRes.count ?? 0,
    activeAnnouncements:  activeAnnouncementsRes.count ?? 0,
  };
}

/** Fetch recent purchases (join with users + books) */
export async function fetchRecentPurchases(limit = 6) {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id, amount, status, purchased_at,
      users!purchases_user_id_fkey ( full_name, username, email, avatar_url ),
      books!purchases_book_id_fkey ( title, cover_color_primary )
    `)
    .order('purchased_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    purchasedAt: p.purchased_at,
    userName: p.users?.full_name ?? p.users?.username ?? 'Unknown',
    userEmail: p.users?.email ?? '',
    bookTitle: p.books?.title ?? 'Deleted Book',
    coverColor: p.books?.cover_color_primary ?? '#C17817',
  }));
}

/** Fetch top performing books by purchase count */
export async function fetchTopBooks(limit = 5) {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id, title, category, price, average_rating, rating_count, purchase_count, status,
      cover_color_primary, language,
      author_profiles!books_author_id_fkey (
        users!author_profiles_user_id_fkey ( full_name, username )
      )
    `)
    .eq('status', 'PUBLISHED')
    .order('purchase_count', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    author: b.author_profiles?.users?.full_name ?? b.author_profiles?.users?.username ?? 'Unknown',
    category: b.category,
    price: b.price,
    averageRating: b.average_rating,
    ratingCount: b.rating_count,
    purchaseCount: b.purchase_count,
    status: b.status,
    coverColor: b.cover_color_primary ?? '#C17817',
    language: b.language,
    revenue: b.price * b.purchase_count,
  }));
}

/** Fetch pending books for quick-review widget */
export async function fetchPendingBooks(limit = 5) {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id, title, category, created_at, cover_color_primary,
      author_profiles!books_author_id_fkey (
        users!author_profiles_user_id_fkey ( full_name, username )
      )
    `)
    .eq('status', 'PENDING_REVIEW')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    category: b.category,
    createdAt: b.created_at,
    coverColor: b.cover_color_primary ?? '#C17817',
    author: b.author_profiles?.users?.full_name ?? b.author_profiles?.users?.username ?? 'Unknown',
  }));
}

/** Fetch top authors by total_sales */
export async function fetchTopAuthors(limit = 4) {
  const { data, error } = await supabase
    .from('author_profiles')
    .select(`
      id, total_books, total_sales,
      users!author_profiles_user_id_fkey ( full_name, username, avatar_url )
    `)
    .order('total_sales', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((a: any) => ({
    id: a.id,
    totalBooks: a.total_books,
    totalSales: a.total_sales,
    name: a.users?.full_name ?? a.users?.username ?? 'Unknown',
    avatar: a.users?.avatar_url,
  }));
}
