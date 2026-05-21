"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Building, Briefcase, Camera, X, RefreshCw } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';
import { changePassword } from '@/lib/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const authUser = getUser();
    if (authUser) {
      setUser({
        ...authUser,
        id: String(authUser.id)
      });
    }
  }, [router]);

  if (!user) {
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('Password cannot be empty');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await changePassword(Number(user.id), newPassword);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert('Password changed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md dark:border-gray-800 flex items-center px-6 sticky top-0 z-20">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Chat</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden relative">
          {/* Profile Header section */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-lg overflow-hidden">
                   <User className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform text-gray-600 dark:text-gray-300">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{user.role} &bull; {user.department}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Change Password
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Information Cards */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Full Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">{user.name}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium">Email Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">{user.email}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                  <Building className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8">{user.department}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
                  <Briefcase className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white ml-8 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
              <button 
                onClick={() => { setIsPasswordModalOpen(false); setNewPassword(''); setError(''); }} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your new password below.
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => { setIsPasswordModalOpen(false); setNewPassword(''); setError(''); }} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
