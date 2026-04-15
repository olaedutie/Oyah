import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ClipboardList, CheckCircle2, Clock, ExternalLink, Loader2, AlertCircle, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Tasks({ userData }: { userData: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubCompleted = onSnapshot(
      collection(db, 'completed_tasks'),
      (snap) => {
        const ids = new Set(snap.docs.filter(d => d.data().user_id === userData.id).map(d => d.data().task_id));
        setCompletedTaskIds(ids);
      }
    );

    return () => {
      unsubTasks();
      unsubCompleted();
    };
  }, [userData.id]);

  const handleCompleteTask = async (task: any) => {
    if (processingId) return;
    setProcessingId(task.id);
    try {
      // In a real app, we'd verify the task completion here.
      // For this demo, we'll simulate it.
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userData.id);
        const taskRef = doc(db, 'tasks', task.id);
        
        const userSnap = await transaction.get(userRef);
        const taskSnap = await transaction.get(taskRef);

        if (!userSnap.exists() || !taskSnap.exists()) throw "Document not found";
        
        const taskData = taskSnap.data();
        if (taskData.completed_count >= taskData.max_users) throw "Task full";

        // Create completion record
        const completionRef = doc(collection(db, 'completed_tasks'));
        transaction.set(completionRef, {
          user_id: userData.id,
          task_id: task.id,
          status: 'approved', // Auto-approve for demo
          reward_paid: true,
          created_at: new Date().toISOString()
        });

        // Update user wallet
        transaction.update(userRef, {
          wallet_balance: increment(task.reward_amount),
          total_earnings: increment(task.reward_amount)
        });

        // Update task count
        transaction.update(taskRef, {
          completed_count: increment(1)
        });

        // Log transaction
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          user_id: userData.id,
          type: 'task',
          amount: task.reward_amount,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      });

      // Handle referral bonus if first task
      if (userData.referred_by && completedTaskIds.size === 0) {
        // Simple referral bonus logic
        const bonusAmount = 50; // ₦50 bonus
        await runTransaction(db, async (transaction) => {
          const referrerRef = doc(db, 'users', userData.referred_by);
          transaction.update(referrerRef, {
            wallet_balance: increment(bonusAmount),
            total_earnings: increment(bonusAmount)
          });
          
          const transRef = doc(collection(db, 'transactions'));
          transaction.set(transRef, {
            user_id: userData.referred_by,
            type: 'referral',
            amount: bonusAmount,
            status: 'completed',
            created_at: new Date().toISOString()
          });
        });
      }

    } catch (err) {
      console.error("Task completion failed:", err);
      alert("Failed to complete task. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#00FFA3]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Available Tasks</h2>
        <p className="text-white/40 text-sm">Complete tasks and earn instant rewards</p>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map((task) => {
          const isCompleted = completedTaskIds.has(task.id);
          const isFull = task.completed_count >= task.max_users;
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "bg-white/5 border p-4 rounded-2xl space-y-4 transition-all",
                isCompleted ? "border-[#00FFA3]/20 bg-[#00FFA3]/5" : "border-white/5"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{task.title}</h3>
                    {isCompleted && <CheckCircle2 size={14} className="text-[#00FFA3]" />}
                  </div>
                  <p className="text-xs text-white/50">{task.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#00FFA3] font-bold">₦{task.reward_amount}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">{task.task_type}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>5 mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={10} />
                    <span>{task.completed_count}/{task.max_users}</span>
                  </div>
                </div>
                
                {isCompleted ? (
                  <button disabled className="bg-white/10 text-white/40 px-4 py-2 rounded-lg text-xs font-bold">
                    Completed
                  </button>
                ) : isFull ? (
                  <button disabled className="bg-red-500/10 text-red-500/40 px-4 py-2 rounded-lg text-xs font-bold">
                    Full
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <a 
                      href={task.task_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleCompleteTask(task)}
                      disabled={!!processingId}
                      className="bg-[#5B2EFF] hover:bg-[#4A24CC] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                    >
                      {processingId === task.id ? <Loader2 size={14} className="animate-spin" /> : 'Done'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="text-white/20" size={32} />
            </div>
            <p className="text-white/40">No tasks available right now. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
