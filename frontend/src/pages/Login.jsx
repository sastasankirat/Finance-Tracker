import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Meteor shower animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="meteor meteor-1"></div>
        <div className="meteor meteor-2"></div>
        <div className="meteor meteor-3"></div>
        <div className="meteor meteor-4"></div>
        <div className="meteor meteor-5"></div>
        <div className="meteor meteor-6"></div>
        <div className="meteor meteor-7"></div>
        <div className="meteor meteor-8"></div>
        <div className="meteor meteor-9"></div>
        <div className="meteor meteor-10"></div>
        <div className="meteor meteor-11"></div>
        <div className="meteor meteor-12"></div>
        <div className="meteor meteor-13"></div>
        <div className="meteor meteor-14"></div>
        <div className="meteor meteor-15"></div>
        <div className="meteor meteor-16"></div>
        <div className="meteor meteor-17"></div>
        <div className="meteor meteor-18"></div>
        <div className="meteor meteor-19"></div>
        <div className="meteor meteor-20"></div>
      </div>

      <style>{`
        @keyframes meteorMove {
          0% {
            transform: translate(-100px, -100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translate(calc(100vw + 100px), calc(100vh + 100px));
            opacity: 0;
          }
        }

        @keyframes meteorTail {
          0% {
            width: 0;
          }
          100% {
            width: var(--tail-length);
          }
        }

        .meteor {
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, var(--brightness));
          border-radius: 50%;
          filter: blur(0.5px);
          box-shadow: 
            0 0 8px rgba(255, 255, 255, calc(var(--brightness) * 0.9)),
            0 0 16px rgba(255, 255, 255, calc(var(--brightness) * 0.6)),
            0 0 24px rgba(255, 255, 255, calc(var(--brightness) * 0.3));
          animation: meteorMove var(--duration) var(--easing) infinite;
          animation-delay: var(--delay);
        }

        .meteor::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 50%;
          height: 1.5px;
          background: linear-gradient(to left,
            rgba(255, 255, 255, calc(var(--brightness) * 0.95)) 0%,
            rgba(255, 255, 255, calc(var(--brightness) * 0.7)) 15%,
            rgba(255, 255, 255, calc(var(--brightness) * 0.4)) 40%,
            rgba(255, 255, 255, calc(var(--brightness) * 0.15)) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateY(-50%) rotate(45deg);
          transform-origin: right center;
          filter: blur(1px);
          animation: meteorTail var(--duration) var(--easing) infinite;
          animation-delay: var(--delay);
        }

        .meteor::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 50%;
          height: 3px;
          background: linear-gradient(to left,
            rgba(255, 255, 255, calc(var(--brightness) * 0.6)) 0%,
            rgba(255, 255, 255, calc(var(--brightness) * 0.35)) 20%,
            rgba(255, 255, 255, calc(var(--brightness) * 0.15)) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateY(-50%) rotate(45deg);
          transform-origin: right center;
          filter: blur(3px);
          animation: meteorTail var(--duration) var(--easing) infinite;
          animation-delay: var(--delay);
        }

        .meteor-1 {
          --brightness: 1;
          --duration: 3.5s;
          --easing: cubic-bezier(0.25, 0, 0.75, 1);
          --delay: 0s;
          --tail-length: 180px;
          top: -15%;
          left: -15%;
        }

        .meteor-2 {
          --brightness: 0.7;
          --duration: 4.8s;
          --easing: cubic-bezier(0.35, 0, 0.65, 1);
          --delay: 1.2s;
          --tail-length: 140px;
          top: -10%;
          left: -18%;
        }

        .meteor-3 {
          --brightness: 0.9;
          --duration: 3.2s;
          --easing: cubic-bezier(0.2, 0, 0.8, 1);
          --delay: 2.5s;
          --tail-length: 200px;
          top: -12%;
          left: -5%;
        }

        .meteor-4 {
          --brightness: 0.5;
          --duration: 5.5s;
          --easing: cubic-bezier(0.4, 0, 0.6, 1);
          --delay: 0.8s;
          --tail-length: 100px;
          top: -5%;
          left: -20%;
        }

        .meteor-5 {
          --brightness: 0.85;
          --duration: 4.2s;
          --easing: cubic-bezier(0.3, 0, 0.7, 1);
          --delay: 3.8s;
          --tail-length: 160px;
          top: -8%;
          left: -12%;
        }

        .meteor-6 {
          --brightness: 0.65;
          --duration: 4s;
          --easing: cubic-bezier(0.28, 0, 0.72, 1);
          --delay: 2s;
          --tail-length: 130px;
          top: -18%;
          left: -8%;
        }

        .meteor-7 {
          --brightness: 0.75;
          --duration: 3.8s;
          --easing: cubic-bezier(0.32, 0, 0.68, 1);
          --delay: 4.5s;
          --tail-length: 170px;
          top: -6%;
          left: -16%;
        }

        .meteor-8 {
          --brightness: 0.6;
          --duration: 4.5s;
          --easing: cubic-bezier(0.27, 0, 0.73, 1);
          --delay: 1.8s;
          --tail-length: 125px;
          top: -4%;
          left: -22%;
        }

        .meteor-9 {
          --brightness: 0.95;
          --duration: 3.3s;
          --easing: cubic-bezier(0.22, 0, 0.78, 1);
          --delay: 3.2s;
          --tail-length: 195px;
          top: -14%;
          left: -10%;
        }

        .meteor-10 {
          --brightness: 0.55;
          --duration: 5.2s;
          --easing: cubic-bezier(0.38, 0, 0.62, 1);
          --delay: 0.5s;
          --tail-length: 110px;
          top: -3%;
          left: -25%;
        }

        .meteor-11 {
          --brightness: 0.8;
          --duration: 3.9s;
          --easing: cubic-bezier(0.3, 0, 0.7, 1);
          --delay: 2.8s;
          --tail-length: 165px;
          top: -16%;
          left: -7%;
        }

        .meteor-12 {
          --brightness: 0.7;
          --duration: 4.3s;
          --easing: cubic-bezier(0.33, 0, 0.67, 1);
          --delay: 4.2s;
          --tail-length: 145px;
          top: -9%;
          left: -19%;
        }

        .meteor-13 {
          --brightness: 0.88;
          --duration: 3.6s;
          --easing: cubic-bezier(0.26, 0, 0.74, 1);
          --delay: 1.5s;
          --tail-length: 175px;
          top: -11%;
          left: -13%;
        }

        .meteor-14 {
          --brightness: 0.62;
          --duration: 4.7s;
          --easing: cubic-bezier(0.36, 0, 0.64, 1);
          --delay: 3.5s;
          --tail-length: 120px;
          top: -7%;
          left: -17%;
        }

        .meteor-15 {
          --brightness: 0.92;
          --duration: 3.4s;
          --easing: cubic-bezier(0.24, 0, 0.76, 1);
          --delay: 0.3s;
          --tail-length: 190px;
          top: -13%;
          left: -9%;
        }

        .meteor-16 {
          --brightness: 0.58;
          --duration: 5s;
          --easing: cubic-bezier(0.39, 0, 0.61, 1);
          --delay: 2.2s;
          --tail-length: 115px;
          top: -2%;
          left: -23%;
        }

        .meteor-17 {
          --brightness: 0.78;
          --duration: 4.1s;
          --easing: cubic-bezier(0.31, 0, 0.69, 1);
          --delay: 4.8s;
          --tail-length: 155px;
          top: -17%;
          left: -11%;
        }

        .meteor-18 {
          --brightness: 0.68;
          --duration: 4.4s;
          --easing: cubic-bezier(0.34, 0, 0.66, 1);
          --delay: 1s;
          --tail-length: 135px;
          top: -10%;
          left: -14%;
        }

        .meteor-19 {
          --brightness: 0.83;
          --duration: 3.7s;
          --easing: cubic-bezier(0.29, 0, 0.71, 1);
          --delay: 3.9s;
          --tail-length: 172px;
          top: -15%;
          left: -6%;
        }

        .meteor-20 {
          --brightness: 0.72;
          --duration: 4.6s;
          --easing: cubic-bezier(0.35, 0, 0.65, 1);
          --delay: 2.6s;
          --tail-length: 150px;
          top: -8%;
          left: -21%;
        }
      `}</style>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl mb-6 shadow-2xl border border-white/20">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue your journey</p>
        </div>

        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-lg border border-red-400/40 text-red-300 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 focus:bg-white/10 text-white placeholder-gray-500 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2 tracking-wide">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 focus:bg-white/10 text-white placeholder-gray-500 transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3.5 backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-white group-hover:text-white transition-colors">Sign in with Google</span>
            </button>

            <div className="mt-6 text-center">
              <Link
                to="/login-otp"
                className="text-white hover:text-gray-200 text-sm font-semibold transition-colors underline decoration-white/30 hover:decoration-white/60"
              >
                Login with OTP instead
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:text-gray-200 font-semibold transition-colors underline decoration-white/30 hover:decoration-white/60">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;