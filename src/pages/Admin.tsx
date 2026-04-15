import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ShieldCheck, Plus, Trash2, Edit2, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function Admin() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward_amount: '',
    task_type: 'Social',
    task_link: '',
    max_users: '100'
  });

  useEffect(() => {
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), orderBy('created_at', 'desc')), (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCompletions = onSnapshot(query(collection(db, 'completed_tasks'), orderBy('created_at', 'desc')), (snap) => {
      setCompletions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTasks();
      unsubCompletions();
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        reward_amount: parseFloat(newTask.reward_amount),
        max_users: parseInt(newTask.max_users),
        completed_count: 0,
        created_at: new Date().toISOString()
      });
      setShowAddTask(false);
      setNewTask({ title: '', description: '', reward_amount: '', task_type: 'Social', task_link: '', max_users: '100' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Delete this task?")) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-[#5B2EFF]" />
          Admin Panel
        </h2>
        <button 
          onClick={() => setShowAddTask(!showAddTask)}
          className="bg-[#5B2EFF] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {showAddTask && (
        <div className="bg-white/5 border border-[#5B2EFF]/30 p-6 rounded-3xl space-y-4">
          <h3 className="font-bold">Create New Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Reward (₦)"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
                value={newTask.reward_amount}
                onChange={(e) => setNewTask({ ...newTask, reward_amount: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Users"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
                value={newTask.max_users}
                onChange={(e) => setNewTask({ ...newTask, max_users: e.target.value })}
              />
            </div>
            <input
              type="url"
              placeholder="Task Link"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#5B2EFF]"
              value={newTask.task_link}
              onChange={(e) => setNewTask({ ...newTask, task_link: e.target.value })}
            />
            <button type="submit" className="w-full bg-[#5B2EFF] font-bold py-3 rounded-xl">Save Task</button>
          </form>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Manage Tasks</h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
              <div>
                <p className="font-bold text-sm">{task.title}</p>
                <p className="text-[10px] text-white/30">₦{task.reward_amount} • {task.completed_count}/{task.max_users} completed</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 rounded-lg text-blue-400"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteTask(task.id)} className="p-2 bg-white/5 rounded-lg text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Recent Completions</h3>
        <div className="space-y-3">
          {completions.map((comp) => (
            <div key={comp.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
              <div>
                <p className="text-xs font-bold">User: {comp.user_id.substring(0, 8)}...</p>
                <p className="text-[10px] text-white/30">Task: {comp.task_id.substring(0, 8)}...</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-[#00FFA3]/10 text-[#00FFA3] rounded-lg"><CheckCircle2 size={14} /></button>
                <button className="p-2 bg-red-500/10 text-red-500 rounded-lg"><XCircle size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
