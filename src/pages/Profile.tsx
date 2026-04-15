import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { User, LogOut, Settings, Bell, Shield, HelpCircle, ChevronRight, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile({ userData }: { userData: any }) {
  const handleLogout = () => signOut(auth);

  const menuItems = [
    { icon: Settings, label: 'Account Settings', color: 'text-blue-400' },
    { icon: Bell, label: 'Notifications', color: 'text-yellow-400' },
    { icon: Shield, label: 'Security & Privacy', color: 'text-green-400' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-[#5B2EFF] to-[#00FFA3] rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl">
            {userData?.name?.[0] || 'U'}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#0F0F1A] p-1.5 rounded-xl border border-white/10">
            <Award className="text-[#00FFA3]" size={20} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{userData?.name}</h2>
          <p className="text-white/40 text-sm">{userData?.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center space-y-1">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Total Earned</p>
          <p className="text-xl font-black text-[#00FFA3]">₦{userData?.total_earnings?.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center space-y-1">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Tasks Done</p>
          <p className="text-xl font-black text-[#5B2EFF]">24</p>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button 
            key={i}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-xl bg-white/5", item.color)}>
                <item.icon size={20} />
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-all" />
          </button>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold transition-all"
      >
        <LogOut size={20} />
        Log Out
      </button>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em]">Version 1.0.0 (Beta)</p>
    </div>
  );
}
