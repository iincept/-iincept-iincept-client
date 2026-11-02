import { useState } from 'react';
import { Settings as SettingsIcon, Check, Loader2, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAdminUser } from '../../redux/adminAuthSlice';
import axiosClient from '../../services/axiosClient';

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.adminAuth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || 'Admin Boss',
    email: user?.email || 'admin@iincept.com',
    password: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.put('/auth/profile', {
        name: form.name,
        email: form.email,
        password: form.password || undefined
      });
      
      dispatch(updateAdminUser(response.data));
      showSuccessMessage('Admin Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="text-left space-y-6">
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans flex items-center gap-2.5">
          <SettingsIcon className="h-6 w-6 text-zinc-800" />
          Admin Profile Settings
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">Configure administrator display name, contact email address, and security password.</p>
      </header>

      <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm p-8 max-w-xl mx-auto">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Display Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Contact Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm transition-all"
            />
          </div>

          <hr className="border-zinc-100 my-4" />

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">New Password (Optional)</label>
            <input
              type="password"
              placeholder="Leave empty to keep existing password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-sm transition-all"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-black hover:bg-zinc-900 disabled:bg-zinc-800 text-white px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer border-0"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
