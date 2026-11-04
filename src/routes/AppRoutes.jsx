import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Wishlist from '../pages/Wishlist';
import Categories from '../pages/Categories';
import Iphone from '../pages/Iphone';
import Macbook from '../pages/Macbook';
import Ipad from '../pages/Ipad';
import Watch from '../pages/Watch';
import Airpods from '../pages/Airpods';
import TvHome from '../pages/TvHome';
import Accessories from '../pages/Accessories';
import AppleCare from '../pages/AppleCare';
import About from '../pages/About';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import Loader from '../components/Loader';

// Lazy-loaded Admin Layout & Pages for bundle optimization
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Products = lazy(() => import('../pages/admin/Products'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const Users = lazy(() => import('../pages/admin/Users'));
const Coupons = lazy(() => import('../pages/admin/Coupons'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const HeroBanners = lazy(() => import('../pages/admin/HeroBanners'));
const AppleCategories = lazy(() => import('../pages/admin/AppleCategories'));
const Testimonials = lazy(() => import('../pages/admin/Testimonials'));
const NavbarManager = lazy(() => import('../pages/admin/NavbarManager'));
const CategoryIconsManager = lazy(() => import('../pages/admin/CategoryIconsManager'));
const AppleCareManager = lazy(() => import('../pages/admin/AppleCareManager'));
const DisplayAppleCareManager = lazy(() => import('../pages/admin/DisplayAppleCareManager'));
const IpadAppleCareManager = lazy(() => import('../pages/admin/IpadAppleCareManager'));
const IphoneAppleCareManager = lazy(() => import('../pages/admin/IphoneAppleCareManager'));
const WatchAppleCareManager = lazy(() => import('../pages/admin/WatchAppleCareManager'));
const AirpodsAppleCareManager = lazy(() => import('../pages/admin/AirpodsAppleCareManager'));
const TvHomeAppleCareManager = lazy(() => import('../pages/admin/TvHomeAppleCareManager'));
const HomePodAppleCareManager = lazy(() => import('../pages/admin/HomePodAppleCareManager'));
const ProductAppleCareManager = lazy(() => import('../pages/admin/ProductAppleCareManager'));
const FooterManager = lazy(() => import('../pages/admin/FooterManager'));
const AdminReturns = lazy(() => import('../pages/admin/Returns'));
const AdminEnquiries = lazy(() => import('../pages/admin/Enquiries'));
const AdminSalesReport = lazy(() => import('../pages/admin/SalesReport'));
const NewArrivalsManager = lazy(() => import('../pages/admin/NewArrivalsManager'));

// Lazy-loaded secondary user pages
const Search = lazy(() => import('../pages/Search'));
const Contact = lazy(() => import('../pages/Contact'));
const Faq = lazy(() => import('../pages/Faq'));
const Policies = lazy(() => import('../pages/Policies'));
const ShippingPolicy = lazy(() => import('../pages/ShippingPolicy'));
const ReturnsRefundPolicy = lazy(() => import('../pages/ReturnsRefundPolicy'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const BulkOrders = lazy(() => import('../pages/BulkOrders'));
const Compare = lazy(() => import('../pages/Compare'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));

const SuspenseWrapper = ({ children, message = 'Loading content...' }) => (
  <Suspense fallback={<Loader fullscreen={false} message={message} />}>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    children: [
      { path: '', element: <Home /> },
      { path: 'shop', element: <Navigate to="/" replace /> },
      { path: 'iphone', element: <Iphone /> },
      { path: 'iphone-duo', element: <Navigate to="/iphone?search=iPhone%20Duo" replace /> },
      { path: 'iphone_duo', element: <Navigate to="/iphone?search=iPhone%20Duo" replace /> },
      { path: 'iphone/duo', element: <Navigate to="/iphone?search=iPhone%20Duo" replace /> },
      { path: 'macbook', element: <Macbook /> },
      { path: 'ipad', element: <Ipad /> },
      { path: 'watch', element: <Watch /> },
      { path: 'airpods', element: <Airpods /> },
      { path: 'tv-home', element: <TvHome /> },
      { path: 'accessories', element: <Accessories /> },
      { path: 'applecare', element: <AppleCare /> },
      { path: 'categories', element: <Categories /> },
      { path: 'product/:id', element: <ProductDetails /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper message="Loading Profile...">
              <Profile />
            </SuspenseWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper message="Loading Orders...">
              <Orders />
            </SuspenseWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <SuspenseWrapper message="Loading Order Details...">
              <OrderDetails />
            </SuspenseWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'reset-password',
        element: (
          <SuspenseWrapper message="Loading Password Reset...">
            <ResetPassword />
          </SuspenseWrapper>
        )
      },
      {
        path: 'forgot-password',
        element: (
          <SuspenseWrapper message="Loading Forgot Password...">
            <ForgotPassword />
          </SuspenseWrapper>
        )
      },
      {
        path: 'login',
        element: (
          <SuspenseWrapper message="Loading Sign In...">
            <Login />
          </SuspenseWrapper>
        )
      },
      {
        path: 'signup',
        element: (
          <SuspenseWrapper message="Loading Sign Up...">
            <Signup />
          </SuspenseWrapper>
        )
      },
      { path: 'addresses', element: <Navigate to="/checkout" replace /> },
      {
        path: 'wishlist',
        element: <ProtectedRoute><Wishlist /></ProtectedRoute>
      },
      { path: 'about', element: <About /> },
      { path: 'search', element: <SuspenseWrapper><Search /></SuspenseWrapper> },
      { path: 'contact', element: <SuspenseWrapper><Contact /></SuspenseWrapper> },
      { path: 'faq', element: <SuspenseWrapper><Faq /></SuspenseWrapper> },
      { path: 'shipping-policy', element: <SuspenseWrapper><ShippingPolicy /></SuspenseWrapper> },
      { path: 'returns-refund-policy', element: <SuspenseWrapper><ReturnsRefundPolicy /></SuspenseWrapper> },
      { path: 'returns-policy', element: <SuspenseWrapper><ReturnsRefundPolicy /></SuspenseWrapper> },
      { path: 'privacy-policy', element: <SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper> },
      { path: 'privacy', element: <SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper> },
      { path: 'terms-of-service', element: <SuspenseWrapper><TermsOfService /></SuspenseWrapper> },
      { path: 'terms', element: <SuspenseWrapper><TermsOfService /></SuspenseWrapper> },
      { path: 'policies/shipping', element: <SuspenseWrapper><ShippingPolicy /></SuspenseWrapper> },
      { path: 'policies/returns', element: <SuspenseWrapper><ReturnsRefundPolicy /></SuspenseWrapper> },
      { path: 'policies/privacy', element: <SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper> },
      { path: 'policies/terms', element: <SuspenseWrapper><TermsOfService /></SuspenseWrapper> },
      { path: 'policies/:type', element: <SuspenseWrapper><Policies /></SuspenseWrapper> },
      { path: 'policies', element: <Navigate to="/shipping-policy" replace /> },
      { path: 'bulk-orders', element: <SuspenseWrapper><BulkOrders /></SuspenseWrapper> },
      { path: 'compare', element: <SuspenseWrapper><Compare /></SuspenseWrapper> }
    ]
  },
  {
    path: '/admin/login',
    element: <SuspenseWrapper message="Loading Admin Panel..."><AdminLogin /></SuspenseWrapper>
  },
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <SuspenseWrapper message="Loading Admin Panel...">
          <AdminLayout />
        </SuspenseWrapper>
      </AdminProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
      { path: 'products', element: <SuspenseWrapper><Products /></SuspenseWrapper> },
      { path: 'categories', element: <SuspenseWrapper><AdminCategories /></SuspenseWrapper> },
      { path: 'orders', element: <SuspenseWrapper><AdminOrders /></SuspenseWrapper> },
      { path: 'users', element: <SuspenseWrapper><Users /></SuspenseWrapper> },
      { path: 'coupons', element: <SuspenseWrapper><Coupons /></SuspenseWrapper> },
      { path: 'hero-banners', element: <SuspenseWrapper><HeroBanners /></SuspenseWrapper> },
      { path: 'latest-apple', element: <SuspenseWrapper><NewArrivalsManager /></SuspenseWrapper> },
      { path: 'new-arrivals', element: <SuspenseWrapper><NewArrivalsManager /></SuspenseWrapper> },
      { path: 'apple-categories', element: <SuspenseWrapper><AppleCategories /></SuspenseWrapper> },
      { path: 'testimonials', element: <SuspenseWrapper><Testimonials /></SuspenseWrapper> },
      { path: 'navbar-menu', element: <SuspenseWrapper><NavbarManager /></SuspenseWrapper> },
      { path: 'category-icons', element: <SuspenseWrapper><CategoryIconsManager /></SuspenseWrapper> },
      { path: 'applecare', element: <SuspenseWrapper><AppleCareManager /></SuspenseWrapper> },
      { path: 'display-applecare', element: <SuspenseWrapper><DisplayAppleCareManager /></SuspenseWrapper> },
      { path: 'displayapplecare', element: <SuspenseWrapper><DisplayAppleCareManager /></SuspenseWrapper> },
      { path: 'ipad-applecare', element: <SuspenseWrapper><IpadAppleCareManager /></SuspenseWrapper> },
      { path: 'iphone-applecare', element: <SuspenseWrapper><IphoneAppleCareManager /></SuspenseWrapper> },
      { path: 'watch-applecare', element: <SuspenseWrapper><WatchAppleCareManager /></SuspenseWrapper> },
      { path: 'airpods-applecare', element: <SuspenseWrapper><AirpodsAppleCareManager /></SuspenseWrapper> },
      { path: 'tv-home-applecare', element: <SuspenseWrapper><TvHomeAppleCareManager /></SuspenseWrapper> },
      { path: 'tvhome-applecare', element: <SuspenseWrapper><TvHomeAppleCareManager /></SuspenseWrapper> },
      { path: 'homepod-applecare', element: <SuspenseWrapper><HomePodAppleCareManager /></SuspenseWrapper> },
      { path: 'product-applecare', element: <SuspenseWrapper><ProductAppleCareManager /></SuspenseWrapper> },
      { path: 'footer-menu', element: <SuspenseWrapper><FooterManager /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><Settings /></SuspenseWrapper> },
      { path: 'returns', element: <SuspenseWrapper><AdminReturns /></SuspenseWrapper> },
      { path: 'enquiries', element: <SuspenseWrapper><AdminEnquiries /></SuspenseWrapper> },
      { path: 'sales-report', element: <SuspenseWrapper><AdminSalesReport /></SuspenseWrapper> }
    ]
  },
  { path: '*', element: <NotFound /> }
]);

export default router;
