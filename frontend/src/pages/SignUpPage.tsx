import React, { useState, useEffect } from 'react';
import { sendSignUpOtp, verifyOtp, getGoogleOAuthUrl } from '../api';
import { useNavigate } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUrl, setGoogleUrl] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    getGoogleOAuthUrl().then(setGoogleUrl).catch(() => setGoogleUrl(''));
  }, []);

  const validateStep1 = () => {
    if (!name || !dob || !email) return 'All fields are required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email.';
    return '';
  };

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validateStep1();
    if (err) return setError(err);
    setLoading(true);
    try {
      await sendSignUpOtp(email);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) return setError('OTP is required.');
    setLoading(true);
    try {
      const { token, user } = await verifyOtp(email, otp, name, dob);
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
          <h2 className="text-3xl font-bold mb-2">Sign up</h2>
          <p className="text-gray-500 mb-6">Sign up to enjoy the feature of HD</p>
          {error && <div className="text-red-500 mb-3">{error}</div>}
          {step === 1 && (
            <form onSubmit={handleGetOtp} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Your Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  placeholder="Date of Birth"
                />
              </div>
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
          )}
          {step === 2 && (
            <form onSubmit={handleSignUp} className="space-y-4">
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
                {loading ? 'Signing Up...' : 'Sign up'}
              </button>
            </form>
          )}
          <div className="text-center mt-4">
            <span className="text-gray-500">Already have an account?? </span>
            <a href="/signin" className="text-blue-600 hover:underline">Sign in</a>
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

export default SignUpPage; 