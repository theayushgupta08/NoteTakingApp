import React, { useState, useEffect } from 'react';
import { sendSignInOtp, verifyOtp, getGoogleOAuthUrl } from '../api';
import { useNavigate } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getGoogleOAuthUrl().then(setGoogleUrl).catch(() => setGoogleUrl(''));
  }, []);

  const validate = () => {
    if (!email) return 'Email is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email.';
    if (!otpSent && !otp) return '';
    if (!otp) return 'OTP is required.';
    return '';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err && !otpSent) return setError(err);
    setLoading(true);
    try {
      await sendSignInOtp(email);
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    try {
      const { token, user } = await verifyOtp(email, otp);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-none md:rounded-l-2xl shadow-lg p-8 md:p-16">
        {/* Logo */}
        <div className="flex items-center mb-8 w-full">
          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-2">
            {/* Replace with <img src=... /> for real logo */}
            <span className="text-blue-600 font-bold text-xl">★</span>
          </div>
          <span className="font-semibold text-lg text-gray-700">HD</span>
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">Sign in</h2>
          <p className="text-gray-500 mb-6">Please sign in to continue to your account.</p>
          {error && <div className="text-red-500 mb-3">{error}</div>}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="OTP"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                    {/* Eye icon placeholder */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign in'}
              </button>
            </form>
          )}
          <div className="text-center mt-4">
            <span className="text-gray-500">Need an account? </span>
            <a href="/signup" className="text-blue-600 hover:underline">Create one</a>
          </div>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-black rounded-r-2xl">
        {/* Replace with your actual image */}
        <img src="/assets/react.svg" alt="Background" className="object-cover w-full h-full max-h-[600px] rounded-r-2xl" />
      </div>
    </div>
  );
};

export default SignInPage; 