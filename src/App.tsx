import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserProfile } from './types';
import { firebaseService } from './services/firebaseService';
import { 
  ShoppingBag, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  Package, 
  TrendingUp, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Store,
  Users,
  Wallet as WalletIcon,
  PlusCircle,
  Download,
  Share2,
  ExternalLink,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  QrCode,
  Smartphone,
  Info,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from './lib/utils';

// Components
import Marketplace from './components/Marketplace';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import SellerDashboard from './components/SellerDashboard';
import AffiliateDashboard from './components/AffiliateDashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await firebaseService.getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-xl font-bold tracking-tighter uppercase italic">Affilio</span>
                </Link>
                
                <div className="hidden md:flex items-center gap-6">
                  <Link to="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Marketplace</Link>
                  <Link to="/tracking" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Lacak Pesanan</Link>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link 
                      to={profile?.role === 'seller' ? '/seller' : profile?.role === 'affiliate' ? '/affiliate' : profile?.role === 'admin' ? '/admin' : '/auth'}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-white/40 hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/auth"
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-full transition-all shadow-lg shadow-orange-500/20"
                  >
                    Mulai Sekarang
                  </Link>
                )}
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-black border-b border-white/5 p-4 space-y-4"
              >
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-white/60">Marketplace</Link>
                <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-white/60">Lacak Pesanan</Link>
                {user ? (
                  <>
                    <Link 
                      to={profile?.role === 'seller' ? '/seller' : profile?.role === 'affiliate' ? '/affiliate' : '/admin'}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-orange-500 font-medium"
                    >
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500">Logout</button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 bg-orange-500 text-black font-bold rounded-lg text-center">Login</Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/tracking" element={<OrderTracking />} />
            <Route path="/tracking/:id" element={<OrderTracking />} />
            <Route path="/auth" element={<Auth user={user} profile={profile} />} />
            
            {/* Protected Routes */}
            <Route path="/seller/*" element={profile?.role === 'seller' ? <SellerDashboard profile={profile} /> : <Auth user={user} profile={profile} />} />
            <Route path="/affiliate/*" element={profile?.role === 'affiliate' ? <AffiliateDashboard profile={profile} /> : <Auth user={user} profile={profile} />} />
            <Route path="/admin/*" element={profile?.role === 'admin' ? <AdminDashboard profile={profile} /> : <Auth user={user} profile={profile} />} />
          </Routes>
        </main>

        <footer className="border-t border-white/5 py-12 mt-20 bg-black/40">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-bold tracking-tighter uppercase italic">Affilio</span>
            </div>
            <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
              Platform marketplace SaaS modern yang menghubungkan seller dan affiliator dengan sistem pembayaran escrow yang aman.
            </p>
            <div className="flex justify-center gap-8 text-sm text-white/20">
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Bantuan</a>
            </div>
            <p className="mt-12 text-xs text-white/10">© 2026 Affilio. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
