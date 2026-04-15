import { ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, ClipboardList, Users, Wallet, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: any;
  userData: any;
}

export default function Layout({ user, userData }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: ClipboardList, label: 'Tasks' },
    { path: '/refer', icon: Users, label: 'Refer' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Market' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (userData?.role === 'admin') {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#0F0F1A]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5B2EFF] rounded-lg flex items-center justify-center font-bold text-white italic">O</div>
          <h1 className="text-xl font-bold tracking-tight">OYAH</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Balance</p>
            <p className="text-[#00FFA3] font-bold">₦{userData?.wallet_balance?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1A1A2E]/90 backdrop-blur-lg border-t border-white/5 p-2 flex justify-around items-center z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                isActive ? "text-[#00FFA3] scale-110" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]" : ""} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
