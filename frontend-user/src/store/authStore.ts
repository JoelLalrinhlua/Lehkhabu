import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserProfile, upsertUserProfile } from '../services/auth.service';

export interface AppUserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'USER' | 'AUTHOR' | 'ADMIN';
  is_active: boolean;
  following_count: number;
  followers_count: number;
  supabase_uid: string;
  created_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: AppUserProfile | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  loadProfile: (uid: string) => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    set({ loading: true });

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({ session, user: session.user });
      await get().loadProfile(session.user.id);
    }

    // Listen for auth changes (sign-in, sign-out, token refresh)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().loadProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });

    set({ loading: false, initialized: true });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  loadProfile: async (uid: string) => {
    try {
      let profile = await fetchUserProfile(uid);

      // If no profile exists yet (e.g. DB trigger hasn't created it), create it
      if (!profile) {
        const user = get().user;
        if (user) {
          const meta = user.user_metadata as { full_name?: string; username?: string } | null;
          profile = await upsertUserProfile(
            uid,
            user.email ?? '',
            meta?.full_name ?? '',
            meta?.username ?? `user_${uid.slice(0, 8)}`
          );
        }
      }

      set({ profile: profile as AppUserProfile | null });

      // Load user-specific book data (shelf, purchases) after profile is set
      if (profile?.id) {
        const { useBooksStore } = await import('./booksStore');
        useBooksStore.getState().loadUserData(profile.id);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  },

  clearAuth: () => {
    set({ session: null, user: null, profile: null });
  },
}));
