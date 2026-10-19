import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';
import { fetchWishlist } from '../redux/wishlistSlice';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import AIChatWidget from '../components/AIChatWidget';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';

export default function MainLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll without delay to keep transition fast and crisp
    });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased overflow-x-hidden w-full relative">
      {/* Top Banner Promotion / Support Utilities */}
      <Header />

      {/* Primary Brand Navigation (Search, Logo, Cart, Wishlist, User Profile dropdown) */}
      <Navbar />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Global AI Chat Support Widget */}
      <AIChatWidget />

      {/* Main Outlet for nested routes */}
      <main className="flex-grow w-full min-w-0 pt-0 pb-8 shrink-0">
        <div key={location.key || (location.pathname + location.search)} className="page-smooth-enter w-full h-full min-w-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
