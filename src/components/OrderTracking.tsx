import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Order, Product } from '../types';
import { firebaseService } from '../services/firebaseService';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ShoppingBag, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Mail,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(id || searchParams.get('whatsapp') || '');
  const [searchType, setSearchType] = useState<'id' | 'whatsapp'>(searchParams.get('whatsapp') ? 'whatsapp' : 'id');
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const whatsapp = searchParams.get('whatsapp');
    if (id) {
      handleSearch(id, 'id');
    } else if (whatsapp) {
      handleSearch(whatsapp, 'whatsapp');
    }
  }, [id, searchParams]);

  const handleSearch = async (query: string, type: 'id' | 'whatsapp') => {
    if (!query) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setOrders([]);
    
    try {
      if (type === 'id') {
        const unsubscribe = onSnapshot(doc(db, 'orders', query), async (docSnap) => {
          if (docSnap.exists()) {
            const orderData = { id: docSnap.id, ...docSnap.data() } as Order;
            setOrder(orderData);
            const p = await firebaseService.getProduct(orderData.productId);
            setProduct(p);
          } else {
            setError('Pesanan tidak ditemukan. Periksa kembali ID pesanan Anda.');
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        const results = await firebaseService.getOrdersByWhatsapp(query);
        if (results.length > 0) {
          setOrders(results);
        } else {
          setError('Tidak ada pesanan ditemukan untuk nomor WhatsApp ini.');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pesanan.');
      setLoading(false);
    }
  };

  const getStatusStep = (status: Order['status']) => {
    const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed'];
    return steps.indexOf(status);
  };

  const timeline = [
    { status: 'pending', label: 'Pesanan Dibuat', icon: <Clock className="w-5 h-5" /> },
    { status: 'paid', label: 'Pembayaran Dikonfirmasi', icon: <CheckCircle2 className="w-5 h-5" /> },
    { status: 'processing', label: 'Sedang Diproses Seller', icon: <Package className="w-5 h-5" /> },
    { status: 'shipped', label: 'Pesanan Dikirim', icon: <Truck className="w-5 h-5" /> },
    { status: 'completed', label: 'Pesanan Selesai', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tighter italic uppercase mb-4">Lacak Pesanan</h1>
        <p className="text-white/40">Masukkan ID pesanan atau nomor WhatsApp Anda untuk melihat status pesanan.</p>
      </div>

      <div className="max-w-xl mx-auto mb-12 space-y-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
          <button 
            onClick={() => setSearchType('id')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${searchType === 'id' ? 'bg-orange-500 text-black' : 'text-white/40 hover:text-white'}`}
          >
            ID Pesanan
          </button>
          <button 
            onClick={() => setSearchType('whatsapp')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${searchType === 'whatsapp' ? 'bg-orange-500 text-black' : 'text-white/40 hover:text-white'}`}
          >
            Nomor WhatsApp
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text" 
            placeholder={searchType === 'id' ? "Contoh: ord_123456789" : "Contoh: 081234567890"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button 
            onClick={() => handleSearch(searchQuery, searchType)}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LACAK'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-500 flex items-center justify-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {orders.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Daftar Pesanan Anda</h3>
            {orders.map(o => (
              <button 
                key={o.id}
                onClick={() => handleSearch(o.id, 'id')}
                className="w-full p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">#{o.id.slice(-8)}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{formatDate(o.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-orange-500">{formatCurrency(o.totalAmount)}</p>
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-60">{o.status}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-orange-500 transition-colors" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {order && product && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Status Card */}
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">ID Pesanan</p>
                  <p className="text-xl font-black text-orange-500">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Status Saat Ini</p>
                  <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 font-bold uppercase text-xs tracking-wider">
                    {order.status}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
                {timeline.map((step, idx) => {
                  const isCompleted = getStatusStep(order.status) >= getStatusStep(step.status as any);
                  const isCurrent = order.status === step.status;
                  
                  return (
                    <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-4 md:w-1/5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isCompleted ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/20'
                      } ${isCurrent ? 'scale-125 ring-4 ring-orange-500/20' : ''}`}>
                        {step.icon}
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-white/20'}`}>
                          {step.label}
                        </p>
                        {isCurrent && <p className="text-[10px] text-orange-500 font-black mt-1 uppercase tracking-tighter animate-pulse">Aktif</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Info */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Detail Produk</h3>
                <div className="flex gap-6 mb-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black flex-shrink-0">
                    <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold leading-tight mb-2">{product.name}</h4>
                    <p className="text-sm text-white/40">{product.category}</p>
                    <p className="text-lg font-black text-orange-500 mt-2">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-white/20" />
                    <span className="text-white/40">Dipesan pada:</span>
                    <span className="font-bold">{formatDate(order.createdAt)}</span>
                  </div>
                  {order.shippingInfo?.trackingNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="w-4 h-4 text-white/20" />
                      <span className="text-white/40">Resi / Akses:</span>
                      <span className="font-bold text-orange-500">{order.shippingInfo.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buyer Info */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Informasi Pengiriman</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <User className="w-5 h-5 text-white/20 mt-1" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nama Penerima</p>
                      <p className="font-bold">{order.buyerInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-white/20 mt-1" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Email Pengiriman</p>
                      <p className="font-bold">{order.buyerInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Smartphone className="w-5 h-5 text-white/20 mt-1" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">WhatsApp</p>
                      <p className="font-bold">{order.buyerInfo.whatsapp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            {order.status === 'completed' && (
              <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-black">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Pesanan Selesai</h4>
                    <p className="text-sm text-white/40">Produk telah berhasil dikirim dan diterima.</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-green-500 text-black font-bold rounded-xl hover:scale-105 transition-transform">
                  KONFIRMASI PENERIMAAN
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
