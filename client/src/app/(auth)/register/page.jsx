'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api/auth';
import { selectLoading, selectError } from '@/store/userSlice';
import { setError, setLoading, setUser } from '@/store/userSlice';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Loader, GraduationCap, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '',
    role: 'mentee'
  });
  
  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const roles = [
    { 
      value: 'mentee', 
      label: 'Mentee', 
      icon: User, 
      desc: 'Get guidance from university mentors',
      color: 'purple'
    },
    { 
      value: 'mentor', 
      label: 'Mentor', 
      icon: GraduationCap, 
      desc: 'Share your university experience',
      color: 'blue'
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      desc: 'Platform administration',
      color: 'red'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await registerUser(formData);
      
      if (response.success) {
        // Update Redux store
        dispatch(setUser({ 
          user: response.user, 
          token: response.token 
        }));
        
        toast.success(`Welcome, ${formData.fullName}!`);
        
        // Role-based redirect
        setTimeout(() => {
          if (response.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (response.user.role === 'mentor') {
            // Mentor needs to complete profile
            toast.info('Please complete your mentor profile');
            router.push('/mentor/profile-setup');
          } else {
            router.push('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Join MentorConnect
            </h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      disabled={loading}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon 
                        className={`mx-auto mb-1 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} 
                        size={24} 
                      />
                      <div className={`text-xs font-medium ${isSelected ? 'text-purple-600' : 'text-gray-600'}`}>
                        {role.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {roles.find(r => r.value === formData.role)?.desc}
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Full Name"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Email address"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                text-white font-medium rounded-lg hover:opacity-90 transform hover:scale-[1.02] 
                transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl"
            >
              {loading && <Loader className="animate-spin mr-2 inline" size={20} />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
