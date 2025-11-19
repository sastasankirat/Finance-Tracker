import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#030406] text-white relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@300;400;600&display=swap');

        :root{
          --neon-purple: #8B5CF6;
          --electric-blue: #3B82F6;
          --teal-glow: #14B8A6;
        }

        /* Cinematic beams & bloom */
        .nebula-layer { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .nebula-blob { position: absolute; width: 680px; height: 680px; filter: blur(110px); opacity: 0.45; border-radius: 50%; mix-blend-mode: screen; animation: floatSlow 18s ease-in-out infinite; }
        .blob-purple { background: radial-gradient(circle at 30% 30%, var(--neon-purple) 0%, rgba(139,92,246,0.6) 30%, transparent 60%); left: -12%; top: -18%; }
        .blob-blue   { background: radial-gradient(circle at 70% 70%, var(--electric-blue) 0%, rgba(59,130,246,0.55) 25%, transparent 60%); right: -8%; bottom: -10%; animation-delay: 3s; }
        .blob-teal   { background: radial-gradient(circle at 50% 40%, var(--teal-glow) 0%, rgba(20,184,166,0.45) 20%, transparent 55%); left: 20%; bottom: -22%; animation-delay: 6s; opacity: 0.32; }
        
        @keyframes floatSlow { 
          0% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
          33% { transform: translate3d(-24px,12px,0) scale(1.05) rotate(1deg); }
          66% { transform: translate3d(12px,-8px,0) scale(1.02) rotate(-1deg); }
          100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        }

        /* Glass card effects */
        .glass-card { 
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); 
          border: 1px solid rgba(255,255,255,0.06); 
          backdrop-filter: blur(8px) saturate(120%); 
          transition: all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-hover:hover { 
          transform: translateY(-8px) scale(1.008); 
          box-shadow: 
            0 25px 70px rgba(11,13,19,0.7),
            0 0 0 1px rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
        }

        /* Button animations */
        .btn-primary {
          background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12));
          border: 1px solid rgba(139,92,246,0.3);
          transition: all 280ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(139,92,246,0.15);
          border-color: rgba(139,92,246,0.5);
          background: linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.18));
        }

        /* Staggered animation for cards */
        .stagger-animation > * {
          opacity: 0;
          transform: translateY(15px);
          animation: staggerSlideUp 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .stagger-animation > *:nth-child(1) { animation-delay: 100ms; }
        .stagger-animation > *:nth-child(2) { animation-delay: 200ms; }
        .stagger-animation > *:nth-child(3) { animation-delay: 300ms; }
        
        @keyframes staggerSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hero text glow */
        .hero-glow {
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
        }

        /* Feature icon animations */
        .feature-icon {
          transition: all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-hover:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      {/* nebula background */}
      <div className="nebula-layer" aria-hidden>
        <div className="nebula-blob blob-purple"></div>
        <div className="nebula-blob blob-blue"></div>
        <div className="nebula-blob blob-teal"></div>
      </div>

      {/* Glassmorphic Navigation */}
      <nav className="relative backdrop-blur-xl bg-[#030406]/80 border-b border-white/6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-card border border-white/8 shadow-[0_6px_30px_rgba(139,92,246,0.06)]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 border border-white/6">
                  <span className="text-[#8B5CF6] font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', monospace" }}>₹</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-medium" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>Finance Tracker</h1>
                <p className="text-xs text-white/60 mt-0.5">A cinematic take on personal finance</p>
              </div>
            </div>
            <div className="space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 glass-card border border-white/8 hover:scale-[1.02] transition-all duration-300 font-medium rounded-xl"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-white/80 hover:text-white transition-all duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 btn-primary rounded-xl font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 glass-card border border-[#8B5CF6]/30 text-[#8B5CF6] rounded-full text-sm font-medium">
              Next-Gen Financial Management
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight hero-glow" style={{ fontFamily: "'Space Grotesk', monospace" }}>
            <span className="text-white">Master Your </span>
            <span className="bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent">
              Finances
            </span>
          </h1>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience financial tracking with advanced analytics, 
            real-time insights, and beautiful visualizations that make money management effortless.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 stagger-animation">
            {/* Feature 1: Analytics */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>Advanced Analytics</h3>
              <p className="text-white/60 leading-relaxed">
                Deep insights with interactive charts, monthly trends, and category breakdowns that reveal your spending patterns
              </p>
            </div>

            {/* Feature 2: Real-time Tracking */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#14B8A6]/20 to-[#06B6D4]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>Real-time Tracking</h3>
              <p className="text-white/60 leading-relaxed">
                Instant transaction updates with cash flow projections and 30-day forecasts to keep you ahead of your finances
              </p>
            </div>

            {/* Feature 3: Security */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#F87171]/20 to-[#FB7185]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#FB7185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>Bank-grade Security</h3>
              <p className="text-white/60 leading-relaxed">
                Military-grade encryption with secure authentication, OTP verification, and Google OAuth for peace of mind
              </p>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid md:grid-cols-3 gap-8 mt-12 stagger-animation">
            {/* Feature 4: Heatmap Visualization */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>Activity Heatmap</h3>
              <p className="text-white/60 leading-relaxed">
                365-day transaction visualization that shows your financial activity patterns at a glance
              </p>
            </div>

            {/* Feature 5: AI Monthly Reports */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#F59E0B]/20 to-[#FBBF24]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#FBBF24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>AI Monthly Reports</h3>
              <p className="text-white/60 leading-relaxed">
                Automated intelligent financial analysis delivered to your inbox at month-end with personalized insights and recommendations
              </p>
            </div>

            {/* Feature 6: Multi-device Sync */}
            <div className="glass-card rounded-2xl p-8 card-hover group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-gradient-to-br from-[#3B82F6]/20 to-[#60A5FA]/20 border border-white/6">
                <div className="feature-icon">
                  <svg className="w-8 h-8 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white" style={{ fontFamily: "'Space Grotesk', monospace" }}>Multi-device Sync</h3>
              <p className="text-white/60 leading-relaxed">
                Access your financial data anywhere, anytime with seamless synchronization across all your devices
              </p>
            </div>
          </div>

          {/* CTA Section */}
          {!user && (
            <div className="mt-16 text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  Ready to Transform Your Financial Journey?
                </h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Join thousands of users who have already taken control of their finances with our cinematic dashboard experience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-3 px-10 py-4 btn-primary text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-3 px-10 py-4 glass-card border border-white/8 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Already have an account?
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

            </div>
          )}

          {/* For logged-in users */}
          {user && (
            <div className="mt-16 text-center">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-3 px-10 py-4 btn-primary text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300"
              >
                Go to Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/6 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass-card border border-white/8">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 border border-white/6">
                <span className="text-[#8B5CF6] font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', monospace" }}>₹</span>
              </div>
            </div>
            <span className="text-lg font-medium" style={{ fontFamily: "'Space Grotesk', monospace" }}>Finance Tracker</span>
          </div>
          <p className="text-white/60 text-sm">
            Built with passion for better financial management • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;