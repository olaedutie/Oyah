import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Users, Copy, Share2, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Refer({ userData }: { userData: any }) {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('referred_by', '==', userData.id));
    const unsub = onSnapshot(q, (snap) => {
      setReferrals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [userData.id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userData.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join OYAH',
        text: `Earn money doing simple tasks on OYAH! Use my code: ${userData.referral_code}`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-[#00FFA3]/10 rounded-full flex items-center justify-center mx-auto">
          <Users className="text-[#00FFA3]" size={32} />
        </div>
        <h2 className="text-2xl font-bold">Refer & Earn</h2>
        <p className="text-white/40 text-sm px-8">Invite your friends and earn ₦50 for every friend who completes their first task!</p>
      </div>

      {/* Referral Code Card */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Your Referral Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-black tracking-widest text-[#00FFA3]">{userData.referral_code}</span>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              {copied ? <CheckCircle2 size={18} className="text-[#00FFA3]" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-center p-4 bg-white rounded-2xl w-fit mx-auto">
          <QRCodeSVG value={`${window.location.origin}/auth?ref=${userData.referral_code}`} size={120} />
        </div>

        <button 
          onClick={shareLink}
          className="w-full bg-[#5B2EFF] hover:bg-[#4A24CC] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Share2 size={18} />
          Share Invite Link
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
          <p className="text-[10px] text-white/30 uppercase">Total Referrals</p>
          <p className="text-xl font-bold">{referrals.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
          <p className="text-[10px] text-white/30 uppercase">Bonus Earned</p>
          <p className="text-xl font-bold text-[#00FFA3]">₦{referrals.length * 50}</p>
        </div>
      </div>

      {/* Referral List */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="text-[#5B2EFF]" size={20} />
          Your Network
        </h3>
        <div className="space-y-3">
          {referrals.length > 0 ? referrals.map((ref) => (
            <div key={ref.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5B2EFF]/20 rounded-full flex items-center justify-center font-bold text-[#5B2EFF]">
                  {ref.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold">{ref.name}</p>
                  <p className="text-[10px] text-white/30">Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#00FFA3]/10 text-[#00FFA3] px-2 py-1 rounded-full font-bold">Active</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-white/30 text-sm">No referrals yet. Start sharing!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
