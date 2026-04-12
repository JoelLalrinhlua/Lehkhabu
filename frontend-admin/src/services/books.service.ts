import { supabase } from '../lib/supabase';

export interface AdminBook {
  id: string;
  title: string;
  author: string;
  authorId: string;
  category: string;
  price: number;
  isFree: boolean;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  coverImageUrl?: string;
  coverColorPrimary?: string;
  coverColorSecondary?: string;
  totalPages?: number;
  wordCount?: number;
  averageRating: number;
  ratingCount: number;
  purchaseCount: number;
  language: string;
  description?: string;
  isbn?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fetch all books with author name joined from author_profiles + users */
export async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id, title, category, price, is_free, status, cover_image_url,
      cover_color_primary, cover_color_secondary, total_pages, word_count,
      average_rating, rating_count, purchase_count, language, description,
      isbn, tags, published_at, created_at, updated_at,
      author_profiles!books_author_id_fkey (
        id,
        users!author_profiles_user_id_fkey ( full_name, username )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((b: any): AdminBook => ({
    id: b.id,
    title: b.title,
    author: b.author_profiles?.users?.full_name ?? b.author_profiles?.users?.username ?? 'Unknown',
    authorId: b.author_profiles?.id ?? '',
    category: b.category,
    price: b.price,
    isFree: b.is_free,
    status: b.status,
    coverImageUrl: b.cover_image_url,
    coverColorPrimary: b.cover_color_primary,
    coverColorSecondary: b.cover_color_secondary,
    totalPages: b.total_pages,
    wordCount: b.word_count,
    averageRating: b.average_rating,
    ratingCount: b.rating_count,
    purchaseCount: b.purchase_count,
    language: b.language,
    description: b.description,
    isbn: b.isbn,
    tags: b.tags ?? [],
    publishedAt: b.published_at,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  }));
}

/** Update book status (approve / reject / archive) */
export async function updateBookStatus(
  bookId: string,
  status: AdminBook['status']
) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'PUBLISHED') updates.published_at = new Date().toISOString();
  if (status !== 'PUBLISHED') updates.published_at = null;

  const { error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', bookId);

  if (error) throw error;
}

/** Delete a book */
export async function deleteBook(bookId: string) {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
}

/** Fetch genre distribution */
export async function fetchGenreDistribution() {
  const { data, error } = await supabase
    .from('books')
    .select('category')
    .eq('status', 'PUBLISHED');
  if (error) throw error;

  const counts: Record<string, number> = {};
  (data ?? []).forEach((b: any) => {
    const cat = b.category || 'Other';
    counts[cat] = (counts[cat] ?? 0) + 1;
  });

  const COLORS = ['#C17817', '#4F8EF7', '#34D399', '#A78BFA', '#F87171', '#FB923C', '#22D3EE', '#6EE7B7', '#F472B6', '#FBBF24'];
  return Object.entries(counts).map(([genre, count], i) => ({
    genre,
    count,
    color: COLORS[i % COLORS.length],
  }));
}
