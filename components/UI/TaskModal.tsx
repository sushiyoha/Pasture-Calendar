import React, { useState } from 'react';
import { Task, GridItemData } from '../../types';
import { X, Check, Trash2, Plus, Leaf } from 'lucide-react';

interface TaskModalProps {
  gridData: GridItemData;
  tasks: Task[];
  onClose: () => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ gridData, tasks, onClose, onAddTask, onDeleteTask, onToggleTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle);
    setNewTaskTitle('');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const healthStatus = tasks.length > 4 ? 'Overgrazed (Poor)' : tasks.length > 2 ? 'Stressed (Fair)' : 'Lush (Good)';
  const healthColor = tasks.length > 4 ? 'text-amber-600' : tasks.length > 2 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl z-20 border border-white/60 w-80 max-h-[80vh] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{gridData.label}</h2>
          <p className="text-sm text-slate-500">{gridData.fullDateLabel}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-white/50 p-2 rounded-xl text-center border border-slate-100">
            <span className="block text-xl font-bold text-slate-700">{tasks.length}</span>
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Sheep</span>
        </div>
        <div className="flex-1 bg-white/50 p-2 rounded-xl text-center border border-slate-100">
            <span className={`block text-xl font-bold ${healthColor}`}>{healthStatus.split(' ')[0]}</span>
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Grass</span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto min-h-[200px] mb-4 pr-1 space-y-2 custom-scrollbar">
        {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <Leaf size={40} className="mb-2" />
                <p>No sheep here yet.</p>
                <p className="text-xs">Add a task to spawn one!</p>
            </div>
        ) : (
            tasks.map(task => (
            <div 
                key={task.id} 
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                <button 
                    onClick={() => onToggleTask(task.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-green-400'
                    }`}
                >
                    {task.completed && <Check size={12} className="text-white" />}
                </button>
                <span className={`truncate text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.title}
                </span>
                </div>
                <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                >
                <Trash2 size={14} />
                </button>
            </div>
            ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
            type="text"
            placeholder="Add new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner text-sm"
        />
        <button 
            type="submit"
            className="absolute right-2 top-2 p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md disabled:opacity-50"
            disabled={!newTaskTitle.trim()}
        >
            <Plus size={16} />
        </button>
      </form>
    </div>
  );
};

export default TaskModal;