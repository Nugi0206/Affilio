import { Product } from '../types';
import { Image as ImageIcon, Video, ExternalLink, X, Download, FileText, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketingKitModalProps {
  product: Product;
  onClose: () => void;
}

export default function MarketingKitModal({ product, onClose }: MarketingKitModalProps) {
  const photos = product.marketingKit?.filter(item => item.type === 'image') || [];
  const videos = product.marketingKit?.filter(item => item.type === 'video') || [];
  const banners = product.marketingKit?.filter(item => item.type === 'banner') || [];
  const documents = product.marketingKit?.filter(item => item.type === 'document') || [];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0A0A0B] w-full max-w-4xl rounded-[2.5rem] border border-white/5 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter italic uppercase leading-none">Marketing Kit</h2>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{product.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
          {/* Photos */}
          {photos.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Foto Produk
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 group relative bg-white/5">
                    <img src={p.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <a href={p.url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button className="p-2 bg-orange-500 text-black rounded-lg hover:scale-110 transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                <Video className="w-4 h-4" /> Video Promosi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate max-w-[200px]">{v.description || 'Video Promosi'}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">MP4 / Video</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={v.url} target="_blank" rel="noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button className="p-3 bg-orange-500 text-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-orange-500/20">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Banners */}
          {banners.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-4 h-4" /> Banner Iklan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b, i) => (
                  <div key={i} className="aspect-[21/9] rounded-2xl overflow-hidden border border-white/5 group relative bg-white/5">
                    <img src={b.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <button className="px-6 py-3 bg-orange-500 text-black font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Banner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Caption & Dokumen
              </h3>
              <div className="space-y-3">
                {documents.map((d, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{d.description || 'Caption Promosi'}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">PDF / Text</p>
                      </div>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(!product.marketingKit || product.marketingKit.length === 0) && (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
              <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Marketing Kit Kosong</h3>
              <p className="text-white/40">Seller belum mengunggah marketing kit untuk produk ini.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
          <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Gunakan aset ini untuk meningkatkan konversi Anda.</p>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all uppercase tracking-widest">
            Download Semua (.zip)
          </button>
        </div>
      </motion.div>
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
