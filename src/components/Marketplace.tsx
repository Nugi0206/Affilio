import { useState, useEffect } from 'react';
import { Product } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/utils';

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Digital', 'Kursus', 'E-book', 'Software', 'Layanan'];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const p = await firebaseService.getProducts();
        setProducts(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-orange-600 p-8 md:p-16">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md px-4 py-2 rounded-full mb-6"
          >
            <TrendingUp className="w-4 h-4 text-black" />
            <span className="text-xs font-bold uppercase tracking-wider text-black">Marketplace Terpercaya</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-none mb-6"
          >
            TEMUKAN PRODUK <br /> TERBAIK UNTUK ANDA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-black/70 text-lg font-medium mb-8"
          >
            Beli produk berkualitas atau bergabung sebagai affiliator untuk mulai menghasilkan komisi hari ini.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/auth" className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-black/20">
              Mulai Berjualan
            </Link>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-md text-black font-bold rounded-2xl border border-black/10 hover:bg-white/30 transition-all">
              Pelajari Lebih Lanjut
            </button>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <ShoppingBag className="w-full h-full -rotate-12 translate-x-1/4 translate-y-1/4" />
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text" 
            placeholder="Cari produk digital, kursus..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' 
                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={product.media?.[0]?.url || 'https://picsum.photos/seed/product/800/800'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/20">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-orange-500 text-orange-500" />
                      ))}
                      <span className="text-[10px] text-white/40 ml-1">(4.9)</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Harga</p>
                        <p className="text-xl font-black text-white">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Affiliate Info Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-[10px] font-bold text-green-500 border border-green-500/20">
                  Komisi {product.commissionPercentage}%
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Produk tidak ditemukan</h3>
            <p className="text-white/40">Coba gunakan kata kunci lain atau kategori yang berbeda.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
