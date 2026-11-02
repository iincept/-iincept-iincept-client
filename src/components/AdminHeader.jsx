import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../redux/adminAuthSlice';

export default function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.adminAuth);

  // Generate dynamic breadcrumbs from URL paths
  const pathnames = location.pathname.split('/').filter((x) => x);
  const pageName = pathnames[1] ? pathnames[1] : 'Dashboard';

  const handleLogout = () => {
    dispatch(adminLogout());
    alert('Logged out successfully!');
    navigate('/admin/login');
  };

  return (
    <header className="h-16 border-b border-zinc-150 bg-white px-8 flex items-center justify-between shrink-0 select-none">
      {/* Breadcrumb Display */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 capitalize">
        <span>Admin</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-800 font-bold tracking-tight">{pageName}</span>
      </div>

      {/* Admin actions and Avatar Profile widget */}
      <div className="flex items-center gap-5">
        {/* Quick notifications bell */}
        <button className="h-9 w-9 rounded-xl hover:bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer">
          <Bell className="h-4 w-4" />
        </button>

        <span className="h-6 w-px bg-zinc-200" />

        {/* User Info & Quick Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-800 block leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold block leading-none mt-0.5">
              {user?.email || 'admin@iincept.com'}
            </span>
          </div>

          {/* Quick logout button */}
          <button 
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl hover:bg-rose-50 border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-rose-600 transition-all cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
