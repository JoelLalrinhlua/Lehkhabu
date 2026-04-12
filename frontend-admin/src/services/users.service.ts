import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'USER' | 'AUTHOR' | 'ADMIN';
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  // Derived / joined fields
  purchaseCount: number;
  totalSpent: number;
}

export interface AdminAuthorProfile {
  id: string;
  userId: string;
  penName?: string;
  website?: string;
  totalBooks: number;
  totalSales: number;
  createdAt: string;
  // joined
  user?: AdminUser;
}

export interface AdminApplication {
  id: string;
  userId: string;
  writingSample: string;
  motivation: string;
  genre: string;
  socialLinks?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  submittedAt: string;
  reviewedAt?: string;
  // joined 
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

/** Fetch all users */
export async function fetchUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, email, username, full_name, role, is_active, is_email_verified,
      avatar_url, bio, followers_count, following_count, created_at, updated_at
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch purchase stats per user
  const { data: purchaseData } = await supabase
    .from('purchases')
    .select('user_id, amount, status')
    .eq('status', 'COMPLETED');

  const statsByUser: Record<string, { count: number; spent: number }> = {};
  (purchaseData ?? []).forEach((p: any) => {
    if (!statsByUser[p.user_id]) statsByUser[p.user_id] = { count: 0, spent: 0 };
    statsByUser[p.user_id].count += 1;
    statsByUser[p.user_id].spent += p.amount ?? 0;
  });

  return (data ?? []).map((u: any): AdminUser => ({
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.full_name,
    role: u.role,
    isActive: u.is_active,
    isEmailVerified: u.is_email_verified,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    followersCount: u.followers_count ?? 0,
    followingCount: u.following_count ?? 0,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    purchaseCount: statsByUser[u.id]?.count ?? 0,
    totalSpent: statsByUser[u.id]?.spent ?? 0,
  }));
}

/** Update user status (active/suspended) */
export async function updateUserActive(userId: string, isActive: boolean) {
  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/** Update user role */
export async function updateUserRole(userId: string, role: AdminUser['role']) {
  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/** Fetch author profiles with user info */
export async function fetchAuthors(): Promise<AdminAuthorProfile[]> {
  const { data, error } = await supabase
    .from('author_profiles')
    .select(`
      id, user_id, pen_name, website, total_books, total_sales, created_at,
      users!author_profiles_user_id_fkey (
        id, email, username, full_name, avatar_url, is_active, created_at
      )
    `)
    .order('total_sales', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((a: any): AdminAuthorProfile => ({
    id: a.id,
    userId: a.user_id,
    penName: a.pen_name,
    website: a.website,
    totalBooks: a.total_books,
    totalSales: a.total_sales,
    createdAt: a.created_at,
    user: a.users ? {
      id: a.users.id,
      email: a.users.email,
      username: a.users.username,
      fullName: a.users.full_name,
      role: 'AUTHOR',
      isActive: a.users.is_active,
      isEmailVerified: false,
      followersCount: 0,
      followingCount: 0,
      createdAt: a.users.created_at,
      updatedAt: a.users.created_at,
      purchaseCount: 0,
      totalSpent: 0,
    } : undefined,
  }));
}

/** Fetch all author applications */
export async function fetchApplications(): Promise<AdminApplication[]> {
  const { data, error } = await supabase
    .from('author_applications')
    .select(`
      id, user_id, writing_sample, motivation, genre, social_links,
      status, admin_notes, reviewed_by, submitted_at, reviewed_at,
      users!author_applications_user_id_fkey ( full_name, username, email, avatar_url )
    `)
    .order('submitted_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((a: any): AdminApplication => ({
    id: a.id,
    userId: a.user_id,
    writingSample: a.writing_sample,
    motivation: a.motivation,
    genre: a.genre,
    socialLinks: a.social_links,
    status: a.status,
    adminNotes: a.admin_notes,
    reviewedBy: a.reviewed_by,
    submittedAt: a.submitted_at,
    reviewedAt: a.reviewed_at,
    userName: a.users?.full_name ?? a.users?.username ?? 'Unknown',
    userEmail: a.users?.email ?? '',
    userAvatar: a.users?.avatar_url,
  }));
}

/** Approve an author application: update status + upgrade user role */
export async function approveApplication(applicationId: string, userId: string, reviewerId: string) {
  // Update application
  const { error: appErr } = await supabase
    .from('author_applications')
    .update({
      status: 'APPROVED',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId);
  if (appErr) throw appErr;

  // Upgrade user role to AUTHOR
  const { error: userErr } = await supabase
    .from('users')
    .update({ role: 'AUTHOR', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (userErr) throw userErr;

  // Create author_profile if not exists
  const { data: existing } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from('author_profiles').insert({
      user_id: userId,
      total_books: 0,
      total_sales: 0,
    });
  }
}

/** Reject an author application */
export async function rejectApplication(applicationId: string, reviewerId: string, adminNotes?: string) {
  const { error } = await supabase
    .from('author_applications')
    .update({
      status: 'REJECTED',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes ?? null,
    })
    .eq('id', applicationId);
  if (error) throw error;
}

/** Fetch admin accounts */
export async function fetchAdminAccounts() {
  const { data, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Create admin account */
export async function createAdminAccount(email: string, fullName: string, role: 'admin' | 'super_admin' = 'admin') {
  const { error } = await supabase
    .from('admin_accounts')
    .insert({ email, full_name: fullName, role });
  if (error) throw error;
}

/** Toggle admin account active state */
export async function toggleAdminActive(adminId: string, isActive: boolean) {
  const { error } = await supabase
    .from('admin_accounts')
    .update({ is_active: isActive })
    .eq('id', adminId);
  if (error) throw error;
}
