import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Refer from './pages/Refer';
import Wallet from './pages/Wallet';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to user data changes
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ id: docSnap.id, ...docSnap.data() });
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
        return () => unsubUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00FFA3] animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<Layout user={user} userData={userData} />}>
            <Route path="/" element={<Home userData={userData} />} />
            <Route path="/tasks" element={<Tasks userData={userData} />} />
            <Route path="/refer" element={<Refer userData={userData} />} />
            <Route path="/wallet" element={<Wallet userData={userData} />} />
            <Route path="/marketplace" element={<Marketplace userData={userData} />} />
            <Route path="/profile" element={<Profile userData={userData} />} />
            {userData?.role === 'admin' && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}
