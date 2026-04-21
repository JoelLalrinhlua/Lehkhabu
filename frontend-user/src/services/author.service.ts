import { supabase } from '../lib/supabase';

/* ── Types ──────────────────────────────────────────────────────── */

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface AuthorApplication {
  id: string;
  user_id: string;
  writing_sample: string;
  motivation: string;
  genre: string;
  social_links?: string;
  sample_file_url?: string;
  sample_file_name?: string;
  status: ApplicationStatus;
  admin_notes?: string;
  reviewed_by?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface AuthorBook {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  language: string;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  file_url: string | null;
  cover_color_primary: string | null;
  cover_color_secondary: string | null;
  price: number;
  is_free: boolean;
  total_pages: number | null;
  average_rating: number;
  rating_count: number;
  purchase_count: number;
  view_count: number;
  status: BookStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

/* ── Author Applications ─────────────────────────────────────────── */

/** Upload a sample file to the application-files bucket */
export async function uploadApplicationFile(userId: string, file: File): Promise<{ url: string; name: string }> {
  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('application-files')
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`File upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from('application-files').getPublicUrl(path);
  // For private buckets, create a signed URL valid for 1 year
  const { data: signed, error: signErr } = await supabase.storage
    .from('application-files')
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr) throw signErr;
  return { url: signed.signedUrl, name: file.name };
}

/** Submit an author application */
export async function submitAuthorApplication(payload: {
  userId: string;
  writingSample: string;
  motivation: string;
  genre: string;
  socialLinks?: string;
  sampleFileUrl?: string;
  sampleFileName?: string;
}): Promise<AuthorApplication> {
  // Check for existing pending/approved application
  const { data: existing } = await supabase
    .from('author_applications')
    .select('id, status')
    .eq('user_id', payload.userId)
    .in('status', ['PENDING', 'APPROVED'])
    .maybeSingle();

  if (existing) {
    if (existing.status === 'APPROVED') throw new Error('You are already an approved author.');
    throw new Error('You already have a pending application.');
  }

  const { data, error } = await supabase
    .from('author_applications')
    .insert({
      user_id: payload.userId,
      writing_sample: payload.writingSample,
      motivation: payload.motivation,
      genre: payload.genre,
      social_links: payload.socialLinks ?? null,
      sample_file_url: payload.sampleFileUrl ?? null,
      sample_file_name: payload.sampleFileName ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AuthorApplication;
}

/** Fetch the latest author application for a user */
export async function fetchMyApplication(userId: string): Promise<AuthorApplication | null> {
  const { data, error } = await supabase
    .from('author_applications')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AuthorApplication | null;
}

/* ── Author Books ───────────────────────────────────────────────── */

/** Get current user's author profile */
export async function fetchMyAuthorProfile(userId: string) {
  const { data, error } = await supabase
    .from('author_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Fetch all books by the current author (all statuses) */
export async function fetchMyBooks(authorProfileId: string): Promise<AuthorBook[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('author_id', authorProfileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AuthorBook[];
}

/** Upload a book cover image */
export async function uploadBookCover(authorId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${authorId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from('book-covers').getPublicUrl(path);
  return data.publicUrl;
}

/** Upload a book file (PDF / EPUB / DOCX) */
export async function uploadBookFile(authorId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${authorId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('book-files')
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`File upload failed: ${error.message}`);

  // Return a 1-year signed URL (private bucket)
  const { data, error: signErr } = await supabase.storage
    .from('book-files')
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr) throw signErr;
  return data.signedUrl;
}

/** Create a new book draft */
export async function createBook(payload: {
  authorProfileId: string;
  title: string;
  description: string;
  language: string;
  category: string;
  tags: string[];
  price: number;
  isFree: boolean;
  totalPages?: number;
  coverImageUrl?: string;
  fileUrl?: string;
  coverColorPrimary?: string;
  coverColorSecondary?: string;
}): Promise<AuthorBook> {
  // Generate slug
  const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from('books')
    .insert({
      author_id: payload.authorProfileId,
      title: payload.title,
      slug,
      description: payload.description,
      language: payload.language,
      category: payload.category,
      tags: payload.tags,
      price: payload.price,
      is_free: payload.isFree,
      total_pages: payload.totalPages ?? null,
      cover_image_url: payload.coverImageUrl ?? null,
      file_url: payload.fileUrl ?? null,
      cover_color_primary: payload.coverColorPrimary ?? null,
      cover_color_secondary: payload.coverColorSecondary ?? null,
      status: 'PUBLISHED', // Authors can publish directly
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as AuthorBook;
}

/** Update an existing book */
export async function updateBook(bookId: string, updates: Partial<{
  title: string;
  description: string;
  language: string;
  category: string;
  tags: string[];
  price: number;
  isFree: boolean;
  totalPages: number;
  coverImageUrl: string;
  fileUrl: string;
  coverColorPrimary: string;
  coverColorSecondary: string;
}>): Promise<AuthorBook> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.language !== undefined) dbUpdates.language = updates.language;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.isFree !== undefined) dbUpdates.is_free = updates.isFree;
  if (updates.totalPages !== undefined) dbUpdates.total_pages = updates.totalPages;
  if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl;
  if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl;
  if (updates.coverColorPrimary !== undefined) dbUpdates.cover_color_primary = updates.coverColorPrimary;
  if (updates.coverColorSecondary !== undefined) dbUpdates.cover_color_secondary = updates.coverColorSecondary;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('books')
    .update(dbUpdates)
    .eq('id', bookId)
    .select()
    .single();

  if (error) throw error;
  return data as AuthorBook;
}

/** Delete a book */
export async function deleteBook(bookId: string): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
}

/* ── Notifications ──────────────────────────────────────────────── */

/** Fetch unread notifications for the current user */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as Notification[];
}

/** Mark a notification as read */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

/** Subscribe to real-time notifications for a user */
export function subscribeToNotifications(
  userId: string,
  onNew: (notification: Notification) => void
) {
  const channelId = `notifications:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNew(payload.new as Notification)
    )
    .subscribe();
}

/** Subscribe to role changes for the current user (real-time) */
export function subscribeToUserRole(
  userId: string,
  onRoleChange: (newRole: string) => void
) {
  const channelId = `user-role:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new.role !== payload.old.role) {
          onRoleChange(payload.new.role as string);
        }
      }
    )
    .subscribe();
}

/** Subscribe to application status changes */
export function subscribeToApplicationStatus(
  userId: string,
  onStatusChange: (status: ApplicationStatus, adminNotes?: string) => void
) {
  const channelId = `application:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'author_applications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onStatusChange(payload.new.status as ApplicationStatus, payload.new.admin_notes);
      }
    )
    .subscribe();
}
