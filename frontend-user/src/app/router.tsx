import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import LibraryPage from '../pages/LibraryPage';
import BookDetailPage from '../pages/BookDetailPage';
import ProfilePage from '../pages/ProfilePage';
import ReaderPage from '../pages/ReaderPage';

export const router = createBrowserRouter([
  {
    // All main app pages share the AppLayout (top header + bottom nav)
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,           element: <HomePage />     },
      { path: 'explore',       element: <ExplorePage />  },
      { path: 'search',        element: <ExplorePage />  }, // alias for nav
      { path: 'library',       element: <LibraryPage />  },
      { path: 'book/:id',      element: <BookDetailPage /> },
      { path: 'profile',       element: <ProfilePage />  },
    ],
  },
  {
    // ReaderPage is standalone — full-screen, no AppLayout chrome
    path: '/read/:id',
    element: <ReaderPage />,
  },
]);
