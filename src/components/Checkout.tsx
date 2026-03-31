import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Product, UserProfile } from '../types';
import { firebaseService } from '../services/firebaseService';
import { formatCurrency } from '../lib/utils';
import { Loader2, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, Smartphone, QrCode, Building2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

type Step = 'info' | 'payment' | 'instructions' | 'success';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'ewallet' | 'qris' | 'bank';
  description?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'qris', name: 'QRIS (Gopay, OVO, Dana, LinkAja)', icon: <QrCode className="w-5 h-5" />, category: 'qris', description: 'Scan kode QR untuk membayar' },
  { id: 'gopay', name: 'GoPay', icon: <Smartphone className="w-5 h-5" />, category: 'ewallet' },
  { id: 'ovo', name: 'OVO', icon: <Smartphone className="w-5 h-5" />, category: 'ewallet' },
  { id: 'dana', name: 'DANA', icon: <Smartphone className="w-5 h-5" />, category: 'ewallet' },
  { id: 'bank_transfer', name: 'Transfer Bank (Manual)', icon: <Building2 className="w-5 h-5" />, category: 'bank', description: 'Transfer manual ke rekening seller' },
];

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const ref = query.get('ref');
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerBank, setSellerBank] = useState<UserProfile['bankInfo'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<Step>('info');
  
  const [buyerName, setBuyerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const p = await firebaseService.getProduct(id);
        if (p) {
          setProduct(p);
          const s = await firebaseService.getUserProfile(p.sellerId);
          setSellerBank(s?.bankInfo || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('instructions');
  };

  const handleConfirmPurchase = async () => {
    if (!product || !whatsapp) return;

    setProcessing(true);
    try {
      const orderId = await firebaseService.createOrder({
        productId: product.id,
        sellerId: product.sellerId,
        affiliateId: ref || undefined,
        buyerInfo: {
          name: buyerName,
          email: '', // Email not required
          whatsapp: whatsapp,
          address: address
        },
        totalAmount: product.price
      });
      
      // Simulate payment confirmation
      setTimeout(async () => {
        await firebaseService.updateOrderStatus(orderId, 'paid');
        setStep('success');
        setProcessing(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses pembelian.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Checkout</h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    Informasi Pembeli
                  </h3>
                  <form onSubmit={handleNextToPayment} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nama Lengkap</label>
                      <input 
                        required
                        type="text" 
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Contoh: John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">WhatsApp</label>
                      <input 
                        required
                        type="tel" 
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="081234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Alamat Lengkap</label>
                      <textarea 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 transition-colors min-h-[100px]"
                        placeholder="Masukkan alamat pengiriman lengkap Anda"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-orange-500 text-black font-black rounded-xl hover:scale-105 transition-transform mt-4"
                    >
                      LANJUT KE PEMBAYARAN
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    Pilih Metode Pembayaran
                  </h3>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleSelectMethod(method)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-orange-500/50 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            {method.icon}
                          </div>
                          <div className="text-left">
                            <p className="font-bold">{method.name}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{method.description || 'Proses Instan'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'instructions' && (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    Instruksi Pembayaran
                  </h3>
                  
                  <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl mb-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Total Pembayaran</p>
                    <p className="text-3xl font-black">{formatCurrency(product.price)}</p>
                  </div>

                  <div className="space-y-6">
                    {selectedMethod?.id === 'bank_transfer' ? (
                      <div className="space-y-4">
                        <p className="text-sm text-white/60">Silakan transfer ke rekening berikut:</p>
                        <div className="bg-black/40 p-6 rounded-2xl space-y-3 border border-white/5">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Bank</p>
                            <p className="font-bold">{sellerBank?.bankName || 'BCA'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nomor Rekening</p>
                            <p className="text-xl font-black text-orange-500 tracking-wider">{sellerBank?.accountNumber || '1234567890'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Atas Nama</p>
                            <p className="font-bold">{sellerBank?.accountHolder || 'Affilio Escrow'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-6">
                        <div className="w-48 h-48 bg-white p-4 rounded-2xl mx-auto">
                          <QrCode className="w-full h-full text-black" />
                        </div>
                        <p className="text-sm text-white/60">Scan QRIS di atas menggunakan aplikasi e-wallet Anda.</p>
                      </div>
                    )}

                    <button 
                      onClick={handleConfirmPurchase}
                      disabled={processing}
                      className="w-full py-4 bg-orange-500 text-black font-black rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                    >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAYA SUDAH BAYAR'}
                    </button>
                    <button 
                      onClick={() => setStep('payment')}
                      className="w-full text-center text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      Ganti Metode Pembayaran
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-12"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter italic uppercase">Pembayaran Berhasil!</h2>
                <p className="text-white/40 max-w-sm mx-auto">Terima kasih atas pembelian Anda. Produk digital Anda akan segera dikirimkan melalui email.</p>
                <div className="pt-8 flex flex-col gap-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    KEMBALI KE MARKETPLACE
                  </button>
                  <button 
                    onClick={() => navigate('/tracking')}
                    className="w-full py-4 bg-orange-500 text-black font-black rounded-xl hover:scale-105 transition-transform"
                  >
                    LACAK PESANAN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Ringkasan Pesanan</h3>
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <img src={product.media?.[0]?.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{product.name}</p>
                <p className="text-xs text-white/40 mt-1">{product.category}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Harga Produk</span>
                <span>{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Biaya Layanan</span>
                <span className="text-green-500">Gratis</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-3 border-t border-white/5">
                <span>Total</span>
                <span className="text-orange-500">{formatCurrency(product.price)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-[2rem] flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Escrow Aman</p>
              <p className="text-[10px] text-white/40 leading-relaxed">Dana Anda aman di platform kami hingga produk dikonfirmasi diterima.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
