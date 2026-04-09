import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardPage from '../features/analytics/DashboardPage';
import BooksPage from '../features/books/BooksPage';
import AuthorsPage from '../features/books/AuthorsPage';
import UsersPage from '../features/users/UsersPage';
import OrdersPage from '../features/analytics/OrdersPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import AnnouncementsPage from '../features/analytics/AnnouncementsPage';
import UISettingsPage from '../features/analytics/UISettingsPage';
import SettingsPage from '../features/analytics/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true,           element: <DashboardPage /> },
      { path: 'books',         element: <BooksPage /> },
      { path: 'authors',       element: <AuthorsPage /> },
      { path: 'users',         element: <UsersPage /> },
      { path: 'orders',        element: <OrdersPage /> },
      { path: 'analytics',     element: <AnalyticsPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'ui-settings',   element: <UISettingsPage /> },
      { path: 'settings',      element: <SettingsPage /> },
    ],
  },
]);
