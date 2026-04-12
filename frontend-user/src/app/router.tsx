import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import LibraryPage from '../pages/LibraryPage';
import BookDetailPage from '../pages/BookDetailPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileSettingsPage from '../pages/settings/ProfileSettingsPage';
import AccountSettingsPage from '../pages/settings/AccountSettingsPage';
import PublicProfilePage from '../pages/PublicProfilePage';
import ReaderPage from '../pages/ReaderPage';
import AuthorApplicationPage from '../pages/AuthorApplicationPage';
import AuthorDashboardPage from '../pages/AuthorDashboardPage';

export const router = createBrowserRouter([
  // Public auth route
  {
    path: '/auth',
    element: <AuthPage />,
  },

  // All main app pages — protected behind login
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,                       element: <HomePage />              },
      { path: 'explore',                   element: <ExplorePage />           },
      { path: 'search',                    element: <ExplorePage />           },
      { path: 'library',                   element: <LibraryPage />           },
      { path: 'book/:id',                  element: <BookDetailPage />        },
      { path: 'u/:username',               element: <PublicProfilePage />     },
      { path: 'profile',                   element: <ProfilePage />           },
      { path: 'profile/settings/profile',  element: <ProfileSettingsPage />   },
      { path: 'profile/settings/account',  element: <AccountSettingsPage />   },
      { path: 'apply',                     element: <AuthorApplicationPage /> },
      { path: 'author',                    element: <AuthorDashboardPage />   },
    ],
  },

  // ReaderPage is standalone — full-screen, no AppLayout chrome, still protected
  {
    path: '/read/:id',
    element: (
      <ProtectedRoute>
        <ReaderPage />
      </ProtectedRoute>
    ),
  },
]);
