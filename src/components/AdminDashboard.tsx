import { useState, useEffect } from 'react';
import { UserProfile, Product, Order, Wallet, Transaction, Withdrawal } from '../types';
import { firebaseService } from '../services/firebaseService';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  TrendingUp, 
  Wallet as WalletIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  Activity,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/utils';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'products' | 'withdrawals'>('stats');

  useEffect(() => {
    // Real-time listeners for admin
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => doc.data() as UserProfile));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order));
    });

    const unsubWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snap) => {
      setWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Withdrawal));
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction));
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubProducts();
      unsubOrders();
      unsubWithdrawals();
      unsubTransactions();
    };
  }, []);

  const handleApproveWithdrawal = async (id: string) => {
    if (!confirm('Setujui penarikan dana ini?')) return;
    try {
      await firebaseService.approveWithdrawal(id);
      alert('Penarikan disetujui.');
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui penarikan.');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  const totalVolume = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const platformRevenue = transactions.filter(tx => tx.type === 'platform_fee').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Admin Panel</h1>
        </div>
        <p className="text-white/40 font-medium">Monitoring platform, kelola pengguna, dan proses penarikan dana.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'stats', label: 'Statistik', icon: <Activity className="w-4 h-4" /> },
          { id: 'users', label: 'Pengguna', icon: <Users className="w-4 h-4" /> },
          { id: 'products', label: 'Produk', icon: <Package className="w-4 h-4" /> },
          { id: 'withdrawals', label: 'Penarikan', icon: <WalletIcon className="w-4 h-4" /> },
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
            {activeTab === tab.id && <motion.div layoutId="activeTabAdmin" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Volume Transaksi', value: formatCurrency(totalVolume), icon: <TrendingUp />, color: 'text-green-500' },
                { label: 'Pendapatan Platform', value: formatCurrency(platformRevenue), icon: <DollarSign />, color: 'text-orange-500' },
                { label: 'Total Pengguna', value: users.length, icon: <Users />, color: 'text-blue-500' },
                { label: 'Total Pesanan', value: orders.length, icon: <ShoppingBag />, color: 'text-purple-500' },
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                  <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Transactions */}
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Transaksi Terbaru</h3>
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {transactions.slice(0, 10).map(tx => (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wider">{tx.type.replace('_', ' ')}</p>
                          <p className="text-[10px] text-white/40 font-bold">{formatDate(tx.createdAt)}</p>
                        </div>
                        <p className="font-black text-lg text-orange-500">{formatCurrency(tx.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Withdrawals */}
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Penarikan Menunggu</h3>
                <div className="space-y-4">
                  {withdrawals.filter(w => w.status === 'pending').map(w => (
                    <div key={w.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="font-bold">{formatCurrency(w.amount)}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{w.bankAccount.bankName} - {w.bankAccount.accountNumber}</p>
                      </div>
                      <button 
                        onClick={() => handleApproveWithdrawal(w.id)}
                        className="px-4 py-2 bg-orange-500 text-black font-bold rounded-xl text-xs hover:scale-105 transition-transform"
                      >
                        SETUJUI
                      </button>
                    </div>
                  ))}
                  {withdrawals.filter(w => w.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-white/20 italic">Tidak ada penarikan tertunda.</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Pengguna</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Email</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold">{user.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white/40">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.role === 'seller' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 
                        user.role === 'affiliate' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                        'bg-orange-500/10 border-orange-500/20 text-orange-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] text-white/40 font-bold">{formatDate(user.createdAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold mb-2">{product.name}</h4>
                  <p className="text-2xl font-black text-white mb-4">{formatCurrency(product.price)}</p>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Seller ID: {product.sellerId.slice(0, 8)}...</span>
                    <span className="text-orange-500">Komisi {product.commissionPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'withdrawals' && (
          <motion.div key="withdrawals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Tanggal</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">User ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Jumlah</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Bank</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-[10px] text-white/40 font-bold">{formatDate(w.createdAt)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-xs">{w.userId}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-orange-500">{formatCurrency(w.amount)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-xs">{w.bankAccount.bankName}</p>
                      <p className="text-[10px] text-white/40">{w.bankAccount.accountNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        w.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
