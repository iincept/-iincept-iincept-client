import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLoginUser, clearAdminAuthError, adminLogout } from '../../redux/adminAuthSlice';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.adminAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAdminAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLoginUser({ email, password }))
      .unwrap()
      .then((data) => {
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          alert('Access denied. Only administrators are allowed to enter.');
          dispatch(adminLogout());
        }
      })
      .catch((err) => {
        console.error('Admin login failed:', err);
      });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center py-12 px-4 select-none font-sans text-white relative">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-left">
        
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-9 w-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            ii
          </div>
          <span className="font-bold text-xl tracking-wide uppercase">iiNCEPT Admin</span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold tracking-tight">Sign In to Dashboard</h2>
          <p className="text-xs text-zinc-500 mt-1">Authorized access console for seller configurations</p>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/60 text-rose-300 p-3.5 rounded-xl mb-5 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@iincept.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#0071e3] outline-none text-xs text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#0071e3] outline-none text-xs text-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#0071e3]/60 text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer border-0"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In Console
          </button>
        </form>
      </div>
    </div>
  );
}
