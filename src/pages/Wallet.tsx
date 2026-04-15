import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WalletPage({ userData }: { userData: any }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', userData.id),
      orderBy('created_at', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [userData.id]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 500) {
      alert("Minimum withdrawal is ₦500");
      return;
    }
    if (amount > userData.wallet_balance) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal transaction
      await addDoc(collection(db, 'transactions'), {
        user_id: userData.id,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      // Deduct from wallet
      await updateDoc(doc(db, 'users', userData.id), {
        wallet_balance: increment(-amount)
      });

      setSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Withdrawal failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Display */}
      <div className="text-center space-y-4 py-6">
        <div className="w-20 h-20 bg-[#5B2EFF]/10 rounded-full flex items-center justify-center mx-auto border border-[#5B2EFF]/20">
          <Wallet className="text-[#5B2EFF]" size={40} />
        </div>
        <div>
          <p className="text-white/40 text-sm font-medium">Available for Withdrawal</p>
          <h2 className="text-4xl font-black tracking-tight">₦{userData.wallet_balance?.toLocaleString()}</h2>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-lg">Withdraw Funds</h3>
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest">Amount (Min ₦500)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-white/40">₦</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-[#00FFA3] transition-colors font-bold text-xl"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !withdrawAmount}
            className="w-full bg-[#00FFA3] hover:bg-[#00E08F] text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : 'Request Withdrawal'}
          </button>
          {success && <p className="text-[#00FFA3] text-center text-xs font-bold animate-bounce">Withdrawal request submitted!</p>}
        </form>
      </div>

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History className="text-white/40" size={20} />
            History
          </h3>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map((tx) => (
            <div key={tx.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  tx.type === 'withdrawal' ? "bg-red-500/10 text-red-500" : "bg-[#00FFA3]/10 text-[#00FFA3]"
                )}>
                  {tx.type === 'withdrawal' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize">{tx.type} Reward</p>
                  <p className="text-[10px] text-white/30">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  tx.type === 'withdrawal' ? "text-red-400" : "text-[#00FFA3]"
                )}>
                  {tx.type === 'withdrawal' ? '-' : '+'}₦{tx.amount}
                </p>
                <span className={cn(
                  "text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full",
                  tx.status === 'completed' ? "bg-[#00FFA3]/10 text-[#00FFA3]" : "bg-yellow-500/10 text-yellow-500"
                )}>
                  {tx.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-white/30 text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
