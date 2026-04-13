/**
 * userStore.ts
 * 
 * Lean store — only non-auth UI state (no application/book mock data).
 * All author application and book data is fetched directly from Supabase
 * via author.service.ts and displayed in the real page components.
 * 
 * Role detection happens via authStore.profile.role (from DB).
 */
import { create } from 'zustand';

interface UserStore {
  // Placeholder for any future lightweight UI state
  _placeholder: null;
}

export const useUserStore = create<UserStore>()(() => ({
  _placeholder: null,
}));

// Re-export types that pages may still import
export type { };
