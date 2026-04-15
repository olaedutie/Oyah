import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, Mail, Lock, User, Phone, ArrowRight, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    referralCode: ''
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user record
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await setDoc(userRef, {
          name: user.displayName || 'User',
          email: user.email,
          phone: '',
          referral_code: referralCode,
          referred_by: '',
          wallet_balance: 0,
          total_earnings: 0,
          created_at: new Date().toISOString(),
          role: 'user'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = result.user;
        
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Handle referral if code provided
        let referredBy = '';
        if (formData.referralCode) {
          const q = query(collection(db, 'users'), where('referral_code', '==', formData.referralCode.toUpperCase()));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            referredBy = querySnap.docs[0].id;
          }
        }

        await setDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          referral_code: referralCode,
          referred_by: referredBy,
          wallet_balance: 0,
          total_earnings: 0,
          created_at: new Date().toISOString(),
          role: 'user'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#5B2EFF] rounded-2xl flex items-center justify-center font-black text-3xl italic mx-auto shadow-[0_0_20px_rgba(91,46,255,0.4)]">O</div>
          <h1 className="text-3xl font-bold tracking-tight">OYAH</h1>
          <p className="text-white/50 text-sm">The Side Hustle Super App</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          {!isLogin && (
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input
                type="text"
                placeholder="Referral Code (Optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#5B2EFF] transition-colors"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              />
            </div>
          )}

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5B2EFF] hover:bg-[#4A24CC] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#5B2EFF]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F0F1A] px-2 text-white/30">Or continue with</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>

        <p className="text-center text-sm text-white/50">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00FFA3] font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
