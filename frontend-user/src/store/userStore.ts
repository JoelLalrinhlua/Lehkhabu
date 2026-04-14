/**
 * userStore.ts
 *
 * Lean store — only non-auth UI state (no application/book mock data).
 * All author application and book data is fetched directly from Supabase
 * via author.service.ts and displayed in the real page components.
 *
 * Role detection happens via authStore.profile.role (from DB).
 *
 * Currently no global user UI state is needed beyond authStore.
 * This file exists to maintain the import path should state be needed in future.
 */
