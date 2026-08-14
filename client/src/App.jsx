import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Loader from './components/ui/Loader';

// Lazy loading pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/auth/GoogleCallback'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const Contact = lazy(() => import('./pages/legal/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const Clients = lazy(() => import('./pages/Clients'));
const InvoiceList = lazy(() => import('./pages/InvoiceList'));
const CreateInvoice = lazy(() => import('./pages/CreateInvoice'));
const EditInvoice = lazy(() => import('./pages/EditInvoice'));
const InvoiceView = lazy(() => import('./pages/InvoiceView'));

const router = createBrowserRouter([
  { path: '/', element: <Suspense fallback={<Loader />}><Landing /></Suspense> },
  { path: '/login', element: <Suspense fallback={<Loader />}><Login /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<Loader />}><Signup /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={<Loader />}><ForgotPassword /></Suspense> },
  { path: '/reset-password', element: <Suspense fallback={<Loader />}><ResetPassword /></Suspense> },
  { path: '/auth/google', element: <Suspense fallback={<Loader />}><GoogleCallback /></Suspense> },
  { path: '/privacy', element: <Suspense fallback={<Loader />}><Privacy /></Suspense> },
  { path: '/terms', element: <Suspense fallback={<Loader />}><Terms /></Suspense> },
  { path: '/cookies', element: <Suspense fallback={<Loader />}><Cookies /></Suspense> },
  { path: '/contact', element: <Suspense fallback={<Loader />}><Contact /></Suspense> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: 'dashboard', element: <Suspense fallback={<Loader />}><Dashboard /></Suspense> },
          { path: 'business-profile', element: <Suspense fallback={<Loader />}><BusinessProfile /></Suspense> },
          { path: 'clients', element: <Suspense fallback={<Loader />}><Clients /></Suspense> },
          { path: 'invoices', element: <Suspense fallback={<Loader />}><InvoiceList /></Suspense> },
          { path: 'invoices/create', element: <Suspense fallback={<Loader />}><CreateInvoice /></Suspense> },
          { path: 'invoices/edit/:id', element: <Suspense fallback={<Loader />}><EditInvoice /></Suspense> },
          { path: 'invoices/view/:id', element: <Suspense fallback={<Loader />}><InvoiceView /></Suspense> },
        ]
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
};

export default App;
