import { useState, useEffect } from 'react';
import { UserProfile, Product, Wallet, Transaction } from '../types';
import { firebaseService } from '../services/firebaseService';
import { 
  TrendingUp, 
  Package, 
  Link as LinkIcon, 
  Copy, 
  Download, 
  Share2, 
  Wallet as WalletIcon, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Users,
  MousePointer2,
  DollarSign,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate, generateAffiliateLink } from '../lib/utils';
import { collection, query, where, onSnapshot, orderBy, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AffiliateDashboard({ profile }: { profile: UserProfile }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'links' | 'wallet'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.uid) return;

    // Real-time listeners
    const unsubWallet = onSnapshot(doc(db, 'wallets', profile.uid), (snap) => {
      if (snap.exists()) setWallet(snap.data() as Wallet);
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc')), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction));
    });

    // Load all products for marketplace
    const loadProducts = async () => {
      const p = await firebaseService.getProducts();
      setProducts(p);
      setLoading(false);
    };

    loadProducts();

    return () => {
      unsubWallet();
      unsubTransactions();
    };
  }, [profile.uid]);

  const handleCopyLink = (productId: string) => {
    const link = generateAffiliateLink(productId, profile.uid);
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">Affiliate Dashboard</h1>
          <p className="text-white/40 font-medium">Halo {profile.name}, siap untuk mempromosikan produk terbaik hari ini?</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('marketplace')} className="px-6 py-3 bg-orange-500 text-black rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-orange-500/20">
            <TrendingUp className="w-4 h-4" />
            Cari Produk Baru
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'marketplace', label: 'Eksplor Produk', icon: <Package className="w-4 h-4" /> },
          { id: 'links', label: 'Link Saya', icon: <LinkIcon className="w-4 h-4" /> },
          { id: 'wallet', label: 'Komisi & Saldo', icon: <WalletIcon className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all relative ${
              activeTab === tab.id ? 'text-orange-500' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeTabAff" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Komisi', value: formatCurrency(wallet?.balance || 0), icon: <DollarSign />, color: 'text-green-500' },
                { label: 'Klik Link', value: '1,240', icon: <MousePointer2 />, color: 'text-orange-500' },
                { label: 'Konversi', value: '4.2%', icon: <TrendingUp />, color: 'text-blue-500' },
                { label: 'Saldo Tersedia', value: formatCurrency(wallet?.balance || 0), icon: <WalletIcon />, color: 'text-purple-500' },
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-white/10 transition-all">
                  <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Products */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Produk Terlaris</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.slice(0, 4).map(product => (
                    <div key={product.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                      <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{product.name}</h4>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1">Komisi {product.commissionPercentage}%</p>
                        <button 
                          onClick={() => handleCopyLink(product.id)}
                          className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-white transition-colors"
                        >
                          {copiedId === product.id ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedId === product.id ? 'Tersalin' : 'Salin Link'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet Summary */}
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Ringkasan Komisi</h3>
                <div className="p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] text-black relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Saldo Komisi</p>
                    <p className="text-4xl font-black tracking-tighter mb-8">{formatCurrency(wallet?.balance || 0)}</p>
                    <button className="w-full py-4 bg-black text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-black/20">
                      TARIK KOMISI
                    </button>
                  </div>
                  <TrendingUp className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 -rotate-12" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'marketplace' && (
          <motion.div key="marketplace" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                placeholder="Cari produk untuk dipromosikan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500">
                      Komisi {product.commissionPercentage}%
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-bold mb-2">{product.name}</h4>
                    <p className="text-2xl font-black text-white mb-6">{formatCurrency(product.price)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleCopyLink(product.id)}
                        className="py-3 bg-orange-500 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {copiedId === product.id ? <CheckCircle2 className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        {copiedId === product.id ? 'Tersalin' : 'Salin Link'}
                      </button>
                      <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Kit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'links' && (
          <motion.div key="links" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Produk</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Link Affiliate</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.slice(0, 5).map(product => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black rounded-lg overflow-hidden">
                            <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <p className="font-bold text-sm">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 max-w-xs">
                          <code className="text-[10px] text-white/40 truncate bg-black/40 px-2 py-1 rounded">
                            {generateAffiliateLink(product.id, profile.uid)}
                          </code>
                          <button onClick={() => handleCopyLink(product.id)} className="p-1 hover:text-orange-500 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-green-500">
                          Aktif
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div key="wallet" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Saldo Komisi</p>
                  <p className="text-5xl font-black tracking-tighter text-orange-500 mb-8">{formatCurrency(wallet?.balance || 0)}</p>
                  <div className="space-y-4">
                    <button className="w-full py-4 bg-orange-500 text-black font-black rounded-2xl hover:scale-105 transition-transform">
                      TARIK KOMISI
                    </button>
                    <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold">Minimal penarikan Rp 50.000</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Riwayat Komisi</h3>
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {transactions.map(tx => (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase tracking-wider">{tx.type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-white/40 font-bold">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <p className={`font-black text-lg ${
                          tx.type === 'withdrawal' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    ))}
                    {transactions.length === 0 && <div className="text-center py-20 text-white/20 italic">Belum ada riwayat komisi.</div>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
