import { useState, useEffect } from 'react';
import { UserProfile, Product, Order, Wallet, Transaction, MarketingKitItem } from '../types';
import { firebaseService } from '../services/firebaseService';
import { 
  PlusCircle, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  Wallet as WalletIcon, 
  Settings, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Download, 
  Share2, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Building2,
  CreditCard,
  User,
  Smartphone,
  Mail,
  Info,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/utils';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  product?: Product | null;
}

function ProductModal({ isOpen, onClose, sellerId, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.category || 'Digital');
  const [commission, setCommission] = useState(product?.commissionPercentage?.toString() || '10');
  const [imageUrl, setImageUrl] = useState(product?.media?.[0]?.url || '');
  const [marketingKit, setMarketingKit] = useState<MarketingKitItem[]>(product?.marketingKit || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData: Omit<Product, 'id' | 'createdAt'> = {
        sellerId,
        name,
        description,
        price: Number(price),
        commissionPercentage: Number(commission),
        stock: 999,
        category,
        media: [{ type: 'image', url: imageUrl }],
        marketingKit
      };

      if (product) {
        await firebaseService.updateProduct(product.id, productData);
      } else {
        await firebaseService.createProduct(productData);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  const addKitItem = (type: MarketingKitItem['type']) => {
    const url = prompt(`Masukkan URL ${type}:`);
    if (url) {
      setMarketingKit([...marketingKit, { type, url, description: `Aset ${type}` }]);
    }
  };

  const removeKitItem = (index: number) => {
    setMarketingKit(marketingKit.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0A0A0B] w-full max-w-2xl rounded-[2.5rem] border border-white/5 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter italic uppercase">{product ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nama Produk</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-orange-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Deskripsi</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-orange-500 outline-none min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Harga (IDR)</label>
                <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-orange-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Komisi Affiliate (%)</label>
                <input required type="number" value={commission} onChange={e => setCommission(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-orange-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">URL Gambar Utama</label>
              <input required value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-orange-500 outline-none" placeholder="https://..." />
            </div>
            
            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Marketing Kit (Aset Promosi)</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => addKitItem('image')} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10"><ImageIcon className="w-3 h-3" /> Tambah Foto</button>
                <button type="button" onClick={() => addKitItem('video')} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10"><Video className="w-3 h-3" /> Tambah Video</button>
              </div>
              
              <div className="space-y-2">
                {marketingKit.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {item.type === 'image' ? <ImageIcon className="w-4 h-4 text-orange-500" /> : <Video className="w-4 h-4 text-blue-500" />}
                      <span className="text-xs truncate max-w-[200px]">{item.url}</span>
                    </div>
                    <button type="button" onClick={() => removeKitItem(i)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button disabled={loading} className="w-full py-4 bg-orange-500 text-black font-black rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SIMPAN PRODUK'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function SellerDashboard({ profile }: { profile: UserProfile }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'wallet'>('overview');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await firebaseService.deleteProduct(id);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus produk.');
    }
  };

  useEffect(() => {
    if (!profile.uid) return;

    // Real-time listeners
    const unsubProducts = onSnapshot(query(collection(db, 'products'), where('sellerId', '==', profile.uid), where('status', '!=', 'deleted')), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('sellerId', '==', profile.uid), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order));
    });

    const unsubWallet = onSnapshot(doc(db, 'wallets', profile.uid), (snap) => {
      if (snap.exists()) setWallet(snap.data() as Wallet);
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc')), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction));
    });

    setLoading(false);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubWallet();
      unsubTransactions();
    };
  }, [profile.uid]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">Seller Dashboard</h1>
          <p className="text-white/40 font-medium">Selamat datang kembali, {profile.name}. Kelola produk dan pantau penjualan Anda.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pengaturan Bank
          </button>
          <button 
            onClick={handleAddProduct}
            className="px-6 py-3 bg-orange-500 text-black rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </header>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sellerId={profile.uid} 
        product={editingProduct}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'products', label: 'Produk Saya', icon: <Package className="w-4 h-4" /> },
          { id: 'orders', label: 'Pesanan Masuk', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'wallet', label: 'Dompet & Saldo', icon: <WalletIcon className="w-4 h-4" /> },
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
            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Penjualan', value: formatCurrency(wallet?.balance || 0), icon: <TrendingUp />, color: 'text-green-500' },
                { label: 'Pesanan Aktif', value: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length, icon: <ShoppingBag />, color: 'text-orange-500' },
                { label: 'Total Produk', value: products.length, icon: <Package />, color: 'text-blue-500' },
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
              {/* Recent Orders */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tighter italic uppercase">Pesanan Terbaru</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-orange-500 uppercase tracking-widest hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight">#{order.id.slice(-8)}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">{formatCurrency(order.totalAmount)}</p>
                        <p className={`text-[10px] font-black uppercase tracking-tighter ${
                          order.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                        }`}>{order.status}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-center py-12 text-white/20 italic">Belum ada pesanan masuk.</p>}
                </div>
              </div>

              {/* Quick Actions / Wallet Summary */}
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Ringkasan Dompet</h3>
                <div className="p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] text-black relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Saldo Tersedia</p>
                    <p className="text-4xl font-black tracking-tighter mb-8">{formatCurrency(wallet?.balance || 0)}</p>
                    <button className="w-full py-4 bg-black text-white font-black rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-black/20">
                      TARIK SALDO
                    </button>
                  </div>
                  <WalletIcon className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 -rotate-12" />
                </div>
                
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Tips Penjualan</h4>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">Gunakan marketing kit yang menarik untuk membantu affiliator mempromosikan produk Anda lebih efektif.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={product.media?.[0]?.url || 'https://picsum.photos/seed/product/800/450'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-bold mb-2">{product.name}</h4>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-2xl font-black text-white">{formatCurrency(product.price)}</p>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Komisi</p>
                        <p className="text-sm font-bold text-green-500">{product.commissionPercentage}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Kit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleAddProduct}
                className="aspect-[4/5] md:aspect-auto border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:bg-orange-500 group-hover:text-black transition-all">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-white/20 group-hover:text-orange-500">Tambah Produk Baru</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Pesanan</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Pembeli</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Total</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold">#{order.id.slice(-8)}</p>
                        <p className="text-[10px] text-white/40 font-bold">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-sm">{order.buyerInfo.name}</p>
                        <p className="text-[10px] text-white/40 font-bold">{order.buyerInfo.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-orange-500">{formatCurrency(order.totalAmount)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          order.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-20 text-white/20 italic">Belum ada pesanan masuk.</div>}
            </div>
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div key="wallet" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Saldo Tersedia</p>
                  <p className="text-5xl font-black tracking-tighter text-orange-500 mb-8">{formatCurrency(wallet?.balance || 0)}</p>
                  <div className="space-y-4">
                    <button className="w-full py-4 bg-orange-500 text-black font-black rounded-2xl hover:scale-105 transition-transform">
                      TARIK SEKARANG
                    </button>
                    <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold">Minimal penarikan Rp 50.000</p>
                  </div>
                </div>
                
                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
                  <h4 className="text-xs font-black uppercase tracking-widest mb-6">Informasi Bank</h4>
                  {profile.bankInfo ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Bank</p>
                          <p className="font-bold">{profile.bankInfo.bankName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nomor Rekening</p>
                        <p className="text-xl font-black tracking-widest">{profile.bankInfo.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Atas Nama</p>
                        <p className="font-bold">{profile.bankInfo.accountHolder}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-4" />
                      <p className="text-sm text-white/40 mb-4">Anda belum mengatur informasi bank untuk penarikan.</p>
                      <button className="text-orange-500 font-bold text-sm uppercase tracking-widest">Atur Sekarang</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-black tracking-tighter italic uppercase">Riwayat Transaksi</h3>
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
                    {transactions.length === 0 && <div className="text-center py-20 text-white/20 italic">Belum ada riwayat transaksi.</div>}
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
