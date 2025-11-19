import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();

  // existing state
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  // analytics state (new)
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [savingsRatio, setSavingsRatio] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Add refs for different sections
  const analyticsRef = useRef(null);
  const topRef = useRef(null);

  // visualization colors
  const CHART_COLORS = {
    income: '#14B8A6',
    expense: '#FB7185',
    projection: '#8B5CF6'
  };
  const PIE_COLORS = ['#3B82F6', '#14B8A6', '#8B5CF6', '#F87171', '#FBBF24', '#EC4899', '#60A5FA', '#7C3AED'];

  // ------ fetch & build analytics ------
  useEffect(() => {
    fetchData();
    
    // Add scroll event listener
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const transactionsRes = await api.get('/transactions?limit=1000');
      const summaryRes = await api.get('/transactions/summary/overview');

      const txs = transactionsRes.data.transactions || [];
      const sum = summaryRes.data.summary || {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0
      };

      setTransactions(txs);
      setSummary(sum);

      buildAnalytics(txs, sum);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build analytics data for charts
  const buildAnalytics = (txns, sum) => {
    const normalized = txns.map(t => ({
      ...t,
      amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
      date: t.date ? new Date(t.date) : new Date()
    }));

    // 1) Monthly Income vs Expense (last 12 months)
    const months = getLastNMonths(12);
    const monthlyMap = {};
    months.forEach(m => { monthlyMap[m.key] = { month: m.label, income: 0, expense: 0 }; });

    normalized.forEach(t => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: t.date.toLocaleString('en-IN', { month: 'short', year: 'numeric' }), income: 0, expense: 0 };
      }
      monthlyMap[key][t.type] += t.amount;
    });

    const monthlyArr = months.map(m => monthlyMap[m.key] || { month: m.label, income: 0, expense: 0 });
    setMonthlyData(monthlyArr);

    // 2) Category Breakdown
    const catMap = {};
    normalized.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = 0;
      catMap[t.category] += t.amount;
    });
    const catEntries = Object.entries(catMap)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((c, i) => ({ ...c, color: PIE_COLORS[i % PIE_COLORS.length] }));
    setCategoryData(catEntries);

    // 3) Cash Flow Projection
    const projection = buildCashFlowProjection(normalized, sum.balance, 30);
    setCashFlowData(projection);

    // 4) Heatmap data (last 365 days)
    const heat = buildHeatmap(normalized, 365);
    setHeatmapData(heat);

    // 5) Savings Ratio
    const ratio = (sum.totalIncome > 0)
      ? Math.max(0, Math.round(((sum.totalIncome - sum.totalExpense) / sum.totalIncome) * 100))
      : 0;
    setSavingsRatio(ratio);
  };

  // helper: last N months (keys YYYY-MM, label)
  const getLastNMonths = (n) => {
    const res = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      res.push({ key, label });
    }
    return res;
  };

  // helper: build cash flow projection using average daily net over last 90 days
  const buildCashFlowProjection = (txns, currentBalance, days = 30) => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 90);

    const dailyNetMap = {};
    txns.forEach(t => {
      if (t.date < from) return;
      const dayKey = t.date.toISOString().slice(0, 10);
      if (!dailyNetMap[dayKey]) dailyNetMap[dayKey] = 0;
      dailyNetMap[dayKey] += (t.type === 'income' ? t.amount : -t.amount);
    });
    const dailyValues = Object.values(dailyNetMap);
    const avgDailyNet = dailyValues.length > 0 ? (dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length) : 0;

    const projection = [];
    let balance = currentBalance;
    for (let i = 1; i <= days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      balance += avgDailyNet;
      projection.push({
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        projected: Math.round(balance)
      });
    }
    return projection;
  };

  // helper: build heatmap for last N days
  const buildHeatmap = (txns, days = 365) => {
    const map = {};
    txns.forEach(t => {
      const key = t.date.toISOString().slice(0, 10);
      if (!map[key]) map[key] = 0;
      map[key] += Math.abs(t.amount);
    });

    const res = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const amount = map[key] || 0;
      res.push({ date: key, amount });
    }

    const amounts = res.map(r => r.amount);
    const max = Math.max(...amounts, 1);
    const intensities = res.map(r => {
      return Math.min(1, Math.sqrt(r.amount / max));
    });
    const heat = res.map((r, i) => ({ ...r, intensity: intensities[i] }));
    return heat;
  };

  // ------ existing CRUD handlers ------
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/transactions', {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date
      });

      if (response.data.success) {
        await fetchData();
        setShowAddModal(false);
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await api.delete(`/transactions/${id}`);
      if (response.data.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed');
    }
  };

  // Improved scroll functions
  const scrollToAnalytics = () => {
    if (analyticsRef.current) {
      const analyticsSection = analyticsRef.current;
      const offsetTop = analyticsSection.offsetTop - 80; // Adjust for header height
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Add highlight animation
      analyticsSection.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.3)';
      setTimeout(() => {
        analyticsSection.style.boxShadow = 'none';
      }, 1500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030406] flex items-center justify-center">
        <div className="rounded-2xl p-8 border border-white/6 bg-gradient-to-br from-white/6 to-white/4 backdrop-blur-sm shadow-[0_20px_80px_rgba(59,130,246,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg font-light">Loading your finances...</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: '#030406', fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto" }}>
      <style>{`
        /* Enhanced animations and styles */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@300;400;600&display=swap');

        :root{
          --neon-purple: #8B5CF6;
          --electric-blue: #3B82F6;
          --teal-glow: #14B8A6;
        }

        /* Enhanced cinematic beams & bloom */
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

        /* Enhanced glass card animations */
        .glass-card { 
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); 
          border: 1px solid rgba(255,255,255,0.06); 
          backdrop-filter: blur(8px) saturate(120%); 
          transition: all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-inner-glow { 
          box-shadow: 
            inset 0 -6px 30px rgba(59,130,246,0.02), 
            inset 0 6px 18px rgba(139,92,246,0.02),
            0 4px 20px rgba(0,0,0,0.1);
        }
        .card-hover:hover { 
          transform: translateY(-8px) scale(1.008); 
          box-shadow: 
            0 25px 70px rgba(11,13,19,0.7),
            0 0 0 1px rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
        }
        .smooth-transition { transition: all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        /* Enhanced button animations */
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

        /* Back to top button */
        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 100;
          background: rgba(139, 92, 246, 0.9);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .back-to-top:hover {
          background: rgba(139, 92, 246, 1);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        /* Enhanced heatmap squares */
        .heat-square { 
          transition: all 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94); 
          border-radius: 4px; 
        }
        .heat-square:hover { 
          transform: translateY(-4px) scale(1.2); 
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          z-index: 2;
        }

        /* Chart container animations */
        .chart-container {
          opacity: 0;
          transform: translateY(20px);
          animation: chartSlideUp 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes chartSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Analytics section highlight */
        .analytics-highlight {
          transition: all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border-radius: 16px;
        }

        /* Scrollbar enhancement */
        .transactions-scroll::-webkit-scrollbar { width: 8px; }
        .transactions-scroll::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.08); 
          border-radius: 999px;
          transition: background 200ms ease;
        }
        .transactions-scroll::-webkit-scrollbar-thumb:hover { 
          background: rgba(255,255,255,0.12); 
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

      `}</style>

      {/* nebula */}
      <div className="nebula-layer" aria-hidden>
        <div className="nebula-blob blob-purple"></div>
        <div className="nebula-blob blob-blue"></div>
        <div className="nebula-blob blob-teal"></div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="back-to-top w-12 h-12 rounded-full flex items-center justify-center smooth-transition"
          title="Back to Top"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-white/6 bg-[#030406]/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center glass-card border border-white/8 shadow-[0_6px_30px_rgba(139,92,246,0.06)]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 border border-white/6">
                <span className="text-[#8B5CF6] font-semibold text-lg" style={{ fontFamily: "'Space Grotesk', monospace" }}>₹</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-medium" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif" }}>Finance Tracker</h1>
              <p className="text-xs text-white/60 mt-0.5">A new , modern take on your finances</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-white/50">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg glass-card border border-white/8 hover:scale-[1.02] smooth-transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animation">
          <div className="glass-card card-inner-glow rounded-2xl p-6 smooth-transition card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Balance</p>
                <h2 className="text-3xl font-medium mt-3" style={{ fontFamily: "'Space Grotesk', monospace" }}>{formatCurrency(summary.balance)}</h2>
                <p className={`mt-2 text-xs ${summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.balance >= 0 ? 'Positive balance' : 'Negative balance'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#8B5CF6]/10 to-[#14B8A6]/6 border border-white/6">
                <svg className="w-6 h-6 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card card-inner-glow rounded-2xl p-6 smooth-transition card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Income</p>
                <h2 className="text-3xl font-medium mt-3" style={{ fontFamily: "'Space Grotesk', monospace" }}>{formatCurrency(summary.totalIncome)}</h2>
                <p className="mt-2 text-xs text-teal-300">{summary.incomeCount} {summary.incomeCount === 1 ? 'transaction' : 'transactions'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 to-[#3B82F6]/8 border border-white/6">
                <svg className="w-6 h-6 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card card-inner-glow rounded-2xl p-6 smooth-transition card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Expense</p>
                <h2 className="text-3xl font-medium mt-3" style={{ fontFamily: "'Space Grotesk', monospace" }}>{formatCurrency(summary.totalExpense)}</h2>
                <p className="mt-2 text-xs text-red-400">{summary.expenseCount} {summary.expenseCount === 1 ? 'transaction' : 'transactions'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#F87171]/8 to-[#FB7185]/6 border border-white/6">
                <svg className="w-6 h-6 text-[#FB7185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions & recent transactions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 smooth-transition">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-3 px-4 rounded-xl btn-primary smooth-transition"
              >
                Add Transaction
              </button>

              <button 
                onClick={scrollToAnalytics}
                className="w-full py-3 px-4 rounded-xl border border-white/8 bg-transparent text-white/80 hover:bg-white/2 smooth-transition hover:scale-[1.02]"
              >
                View Analytics
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto transactions-scroll pr-2">
              {transactions.length === 0 ? (
                <div className="text-center py-16 text-white/50">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs text-white/40 mt-1">Add your first transaction to get started</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 rounded-xl border border-white/6 hover:bg-white/2 hover:bg-opacity-2 smooth-transition group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-gradient-to-br from-[#06B6D4]/12 to-[#3B82F6]/8' : 'bg-gradient-to-br from-[#FCA5A5]/8 to-[#FB7185]/6'} border border-white/6 smooth-transition group-hover:scale-105`}>
                        {transaction.type === 'income' ? (
                          <svg className="w-5 h-5 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#FB7185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-xs text-white/50">{transaction.description || 'No description'} • {formatDate(transaction.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`font-medium mono-numbers ${transaction.type === 'income' ? 'text-teal-300' : 'text-red-300'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-lg hover:bg-red-500/10 transform hover:scale-110"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ------------------ ANALYTICS SECTION ------------------ */}
        <div ref={analyticsRef} className="analytics-highlight">
          
          {/* Row 1: Bar chart (monthly) + Savings ratio */}
          <section className="mt-14 grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Monthly Income vs Expense (Bar) */}
            <div className="xl:col-span-2 glass-card rounded-2xl p-6 chart-container">
              <h3 className="text-lg font-medium mb-4">Monthly Income vs Expense</h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#B6B6B6" />
                    <YAxis stroke="#B6B6B6" />
                    <Tooltip contentStyle={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)' }} />
                    <Legend />
                    <Bar dataKey="income" fill={CHART_COLORS.income} name="Income" />
                    <Bar dataKey="expense" fill={CHART_COLORS.expense} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Savings vs Spending Ratio */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-center chart-container">
              <h3 className="text-lg font-medium mb-4">Savings Ratio</h3>
              <div className="text-center">
                <p className="text-sm text-white/60 mb-2">Savings vs Spending</p>
                <div className="text-4xl font-semibold mono-numbers mb-4">
                  {savingsRatio}% 
                </div>
                <div className="w-full bg-white/10 rounded-xl h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#14B8A6] to-[#3B82F6] transition-all duration-1000 ease-out" 
                    style={{ width: `${savingsRatio}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/50 mt-3">Based on total income and expenses</p>
              </div>
            </div>
          </section>

          {/* Row 2: Category Doughnut + Cash Flow Projection */}
          <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown (Donut) */}
            <div className="glass-card rounded-2xl p-6 chart-container">
              <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cash Flow Projection */}
            <div className="glass-card rounded-2xl p-6 chart-container">
              <h3 className="text-lg font-medium mb-4">Cash Flow Projection (30 days)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="dateLabel" stroke="#B6B6B6" />
                    <YAxis stroke="#B6B6B6" />
                    <Tooltip contentStyle={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.06)' }} />
                    <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.projection} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Row 3: Transaction Heatmap */}
          <section className="mt-10 glass-card rounded-2xl p-6 chart-container">
            <h3 className="text-lg font-medium mb-6">Transaction Heatmap (last 365 days)</h3>
            <div className="text-xs text-white/60 mb-3">Darker = more activity</div>

            {/* Heatmap grid: 52 weeks × 7 days */}
            <div className="w-full overflow-x-auto">
              <div className="grid grid-flow-col gap-1" style={{ gridAutoColumns: '12px' }}>
                {renderHeatmapColumns(heatmapData)}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl p-8 glass-card border border-white/8 shadow-[0_30px_80px_rgba(11,13,19,0.7)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">Add Transaction</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-md hover:bg-white/6 smooth-transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, type: 'income', category: '' })} className={`py-3 px-4 rounded-xl border smooth-transition ${formData.type === 'income' ? 'border-[#06B6D4] bg-[#06B6D4]/8' : 'border-white/8 bg-transparent'}`}>Income</button>
                  <button type="button" onClick={() => setFormData({ ...formData, type: 'expense', category: '' })} className={`py-3 px-4 rounded-xl border smooth-transition ${formData.type === 'expense' ? 'border-[#FB7185] bg-[#FB7185]/8' : 'border-white/8 bg-transparent'}`}>Expense</button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Amount</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/8 bg-transparent outline-none smooth-transition focus:border-[#8B5CF6]/40" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/8 bg-transparent smooth-transition focus:border-[#8B5CF6]/40">
                  <option value="">Select category</option>
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Description (Optional)</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/8 bg-transparent smooth-transition focus:border-[#8B5CF6]/40" placeholder="Add a note..." />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/8 bg-transparent smooth-transition focus:border-[#8B5CF6]/40" />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl btn-primary smooth-transition">Add Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ----------------- helper rendering functions -----------------
  function renderHeatmapColumns(heatData) {
    if (!heatData || heatData.length === 0) return null;

    const map = {};
    heatData.forEach(h => (map[h.date] = h));

    const firstDate = new Date(heatData[0].date);
    const start = new Date(firstDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);

    const cols = [];
    const totalDays = heatData.length;
    const newestDate = new Date(heatData[heatData.length - 1].date);

    let cursor = new Date(start);
    while (cursor <= newestDate) {
      const week = [];
      for (let dow = 0; dow < 7; dow++) {
        const key = cursor.toISOString().slice(0, 10);
        const item = map[key] || { date: key, amount: 0, intensity: 0 };
        week.push(item);
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(week);
    }

    return cols.map((week, i) => (
      <div key={`week-${i}`} className="flex flex-col gap-1">
        {week.map((dayItem, j) => {
          const intensity = typeof dayItem.intensity === 'number' ? dayItem.intensity : 0;
          const alpha = Math.min(0.95, 0.06 + intensity * 0.9);
          const bg = `rgba(139,92,246,${alpha})`;
          const title = `${dayItem.date} • ${dayItem.amount ? formatCurrency(dayItem.amount) : 'No activity'}`;
          return (
            <div
              key={`${i}-${j}`}
              title={title}
              className="heat-square"
              style={{
                width: 12,
                height: 12,
                backgroundColor: bg,
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            />
          );
        })}
      </div>
    ));
  }
};

export default Dashboard;