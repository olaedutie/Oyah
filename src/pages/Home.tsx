import { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { TrendingUp, Award, Zap, ArrowRight, Wallet, Users, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home({ userData }: { userData: any }) {
  const [featuredTasks, setFeaturedTasks] = useState<any[]>([]);
  const [trendingGigs, setTrendingGigs] = useState<any[]>([]);

  useEffect(() => {
    const tasksQuery = query(collection(db, 'tasks'), limit(3));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      setFeaturedTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const gigsQuery = query(collection(db, 'gigs'), limit(3));
    const unsubGigs = onSnapshot(gigsQuery, (snap) => {
      setTrendingGigs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTasks();
      unsubGigs();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#5B2EFF] to-[#3D1EAA] p-6 rounded-3xl shadow-xl shadow-[#5B2EFF]/20 relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-sm font-medium">Total Balance</p>
              <h2 className="text-3xl font-black tracking-tight">₦{userData?.wallet_balance?.toLocaleString() || '0'}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Wallet className="text-white" size={24} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/tasks" className="flex-1 bg-[#00FFA3] text-black font-bold py-3 rounded-xl text-center text-sm flex items-center justify-center gap-2 hover:bg-[#00E08F] transition-all">
              <Zap size={16} fill="currentColor" />
              Start Earning
            </Link>
            <Link to="/wallet" className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-center text-sm transition-all backdrop-blur-md">
              Withdraw
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Zap, label: 'Earn', color: 'bg-yellow-500/10 text-yellow-500', path: '/tasks' },
          { icon: TrendingUp, label: 'Tasks', color: 'bg-blue-500/10 text-blue-500', path: '/tasks' },
          { icon: Users, label: 'Refer', color: 'bg-purple-500/10 text-purple-500', path: '/refer' },
          { icon: ShoppingBag, label: 'Sell', color: 'bg-green-500/10 text-green-500', path: '/marketplace' },
        ].map((action, i) => (
          <Link key={i} to={action.path} className="flex flex-col items-center gap-2">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", action.color)}>
              <action.icon size={20} />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Featured Tasks */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award className="text-[#00FFA3]" size={20} />
            Featured Tasks
          </h3>
          <Link to="/tasks" className="text-[#00FFA3] text-xs font-bold flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {featuredTasks.length > 0 ? featuredTasks.map((task) => (
            <Link 
              key={task.id} 
              to="/tasks"
              className="block bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm group-hover:text-[#00FFA3] transition-colors">{task.title}</h4>
                  <p className="text-xs text-white/40 line-clamp-1">{task.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#00FFA3] font-bold text-sm">₦{task.reward_amount}</p>
                  <p className="text-[10px] text-white/30">{task.task_type}</p>
                </div>
              </div>
            </Link>
          )) : (
            <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-white/30 text-sm italic">No tasks available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Gigs */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="text-[#5B2EFF]" size={20} />
            Trending Gigs
          </h3>
          <Link to="/marketplace" className="text-[#5B2EFF] text-xs font-bold flex items-center gap-1">
            Browse <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trendingGigs.map((gig) => (
            <div key={gig.id} className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-2">
              <div className="aspect-video bg-white/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-white/20" size={24} />
              </div>
              <h4 className="font-bold text-xs line-clamp-1">{gig.title}</h4>
              <div className="flex justify-between items-center">
                <span className="text-[#00FFA3] font-bold text-xs">₦{gig.price}</span>
                <span className="text-[10px] text-white/30">⭐ {gig.rating || '5.0'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
