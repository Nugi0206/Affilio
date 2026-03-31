import { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../services/firebaseService';
import { UserProfile, UserRole } from '../types';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, User, ShieldCheck, Users, Store, Loader2, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ user, profile }: { user: any, profile: UserProfile | null }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole | 'buyer'>('affiliate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      
      const existingProfile = await firebaseService.getUserProfile(u.uid);
      if (!existingProfile) {
        const newProfile: UserProfile = {
          uid: u.uid,
          name: u.displayName || 'User',
          email: u.email || '',
          role: role === 'buyer' ? 'affiliate' : role as UserRole, // Default buyer to affiliate role for now or handle separately
          createdAt: new Date().toISOString()
        };
        await firebaseService.createUserProfile(newProfile);
      }
      navigate(role === 'seller' ? '/seller' : role === 'buyer' ? '/tracking' : '/affiliate');
    } catch (err) {
      console.error(err);
      alert('Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'buyer') {
      // For buyers, we just redirect to tracking with their whatsapp
      navigate(`/tracking?whatsapp=${whatsapp}`);
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const u = result.user;
        const newProfile: UserProfile = {
          uid: u.uid,
          name: name,
          email: email,
          role: role as UserRole,
          createdAt: new Date().toISOString()
        };
        await firebaseService.createUserProfile(newProfile);
      }
      navigate(role === 'seller' ? '/seller' : '/affiliate');
    } catch (err) {
      console.error(err);
      alert('Otentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  if (user && profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Anda sudah masuk</h2>
        <p className="text-white/40 mb-8">Selamat datang kembali, {profile.name}!</p>
        <button 
          onClick={() => navigate(profile.role === 'seller' ? '/seller' : profile.role === 'affiliate' ? '/affiliate' : '/admin')}
          className="w-full py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-600 transition-all"
        >
          Buka Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 border border-white/5 p-8 rounded-3xl backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <TrendingUp className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight italic uppercase">Affilio</h2>
          <p className="text-white/40 mt-2">{isLogin ? 'Masuk ke akun Anda' : 'Daftar sebagai partner kami'}</p>
        </div>

        {!isLogin && (
          <div className="grid grid-cols-3 gap-2 mb-8">
            <button 
              onClick={() => setRole('affiliate')}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'affiliate' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Affiliate</span>
            </button>
            <button 
              onClick={() => setRole('seller')}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'seller' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              <Store className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Seller</span>
            </button>
            <button 
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'buyer' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pembeli</span>
            </button>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {role === 'buyer' ? (
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="tel" 
                placeholder="Nomor WhatsApp" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          ) : (
            <>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
            </>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (role === 'buyer' ? 'Lacak Pesanan' : (isLogin ? 'Masuk' : 'Daftar'))}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#050505] px-4 text-white/20">Atau</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Lanjutkan dengan Google
        </button>

        <p className="text-center mt-8 text-sm text-white/40">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-orange-500 font-bold hover:underline"
          >
            {isLogin ? 'Daftar Sekarang' : 'Masuk di sini'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
