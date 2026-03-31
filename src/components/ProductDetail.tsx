import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Product, UserProfile } from '../types';
import { firebaseService } from '../services/firebaseService';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Package, 
  Truck, 
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const ref = query.get('ref');
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const p = await firebaseService.getProduct(id);
        if (p) {
          setProduct(p);
          const s = await firebaseService.getUserProfile(p.sellerId);
          setSeller(s);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="text-orange-500 font-bold">Kembali ke Marketplace</button>
      </div>
    );
  }

  const handleBuy = () => {
    const checkoutUrl = `/checkout/${product.id}${ref ? `?ref=${ref}` : ''}`;
    navigate(checkoutUrl);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-bold uppercase tracking-wider">Kembali</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Media Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 relative"
          >
            <img 
              src={product.media?.[activeMedia]?.url || 'https://picsum.photos/seed/product/1200/1200'} 
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.media?.[activeMedia]?.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <PlayCircle className="w-20 h-20 text-white/80" />
              </div>
            )}
          </motion.div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.media?.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMedia(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeMedia === idx ? 'border-orange-500' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={m.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-orange-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/20">
                {product.category}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span className="text-sm font-bold">4.9</span>
                <span className="text-sm text-white/40">(120+ Terjual)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">{product.name}</h1>
            <p className="text-4xl font-black text-white">{formatCurrency(product.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Stok Tersedia</p>
              <p className="text-xl font-bold">{product.stock} Unit</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Pengiriman</p>
              <p className="text-xl font-bold">Instan / Digital</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleBuy}
              className="w-full py-5 bg-orange-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-6 h-6" />
              BELI SEKARANG
            </button>
            <div className="flex items-center justify-center gap-6 text-xs text-white/40 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Escrow Terjamin
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Produk Terverifikasi
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Deskripsi Produk</h3>
            <p className="text-white/60 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-black text-xl">
                {seller?.name?.[0] || 'S'}
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Penjual</p>
                <p className="font-bold">{seller?.name || 'Seller Name'}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">
              Profil Seller
            </button>
          </div>
        </div>
      </div>

      {/* Features / Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
        {[
          { icon: <TrendingUp />, title: "Potensi Cuan Tinggi", desc: "Dapatkan komisi hingga puluhan persen dari setiap penjualan produk ini." },
          { icon: <Users />, title: "Dukungan Affiliator", desc: "Tersedia marketing kit lengkap untuk memudahkan promosi Anda." },
          { icon: <ShieldCheck />, title: "Sistem Escrow", desc: "Dana aman di platform hingga pesanan selesai dan diterima pembeli." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-orange-500/20 transition-all">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-6">
              {item.icon}
            </div>
            <h4 className="text-xl font-bold mb-3">{item.title}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
