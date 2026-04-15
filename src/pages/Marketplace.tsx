import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ShoppingBag, Plus, Search, Filter, Star, Loader2, MessageSquare } from 'lucide-react';

export default function Marketplace({ userData }: { userData: any }) {
  const [gigs, setGigs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGig, setNewGig] = useState({
    title: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'gigs'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setGigs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddGig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'gigs'), {
        user_id: userData.id,
        title: newGig.title,
        description: newGig.description,
        price: parseFloat(newGig.price),
        rating: 5.0,
        created_at: new Date().toISOString()
      });
      setShowAdd(false);
      setNewGig({ title: '', description: '', price: '' });
    } catch (err) {
      console.error("Failed to add gig:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Marketplace</h2>
          <p className="text-white/40 text-sm">Sell your skills and hire others</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#5B2EFF] p-3 rounded-2xl shadow-lg shadow-[#5B2EFF]/20 hover:scale-110 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
        <input 
          type="text" 
          placeholder="Search services..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FFA3]">
          <Filter size={18} />
        </button>
      </div>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-[#5B2EFF]/30 p-6 rounded-3xl space-y-4"
        >
          <h3 className="font-bold">Post a New Gig</h3>
          <form onSubmit={handleAddGig} className="space-y-4">
            <input
              type="text"
              placeholder="Gig Title (e.g. Logo Design)"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
              value={newGig.title}
              onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF] min-h-[100px]"
              value={newGig.description}
              onChange={(e) => setNewGig({ ...newGig, description: e.target.value })}
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">₦</span>
              <input
                type="number"
                placeholder="Price"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF]"
                value={newGig.price}
                onChange={(e) => setNewGig({ ...newGig, price: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#5B2EFF] font-bold py-3 rounded-xl">Post Gig</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-6 bg-white/5 font-bold py-3 rounded-xl">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Gigs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00FFA3]" /></div>
        ) : gigs.length > 0 ? gigs.map((gig) => (
          <motion.div 
            key={gig.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/5 p-4 rounded-3xl space-y-4 hover:bg-white/10 transition-all"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#5B2EFF]/10 rounded-2xl flex items-center justify-center shrink-0">
                <ShoppingBag className="text-[#5B2EFF]" size={32} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg">{gig.title}</h4>
                  <span className="text-[#00FFA3] font-black">₦{gig.price}</span>
                </div>
                <p className="text-xs text-white/40 line-clamp-2">{gig.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-[10px] text-white/60">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span>{gig.rating} (12)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/60">
                    <MessageSquare size={12} />
                    <span>Contact</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 font-bold py-3 rounded-xl text-sm transition-all">
              View Details
            </button>
          </motion.div>
        )) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-white/30">No gigs posted yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}
