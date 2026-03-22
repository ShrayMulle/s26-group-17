import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Star, Trash2, Pencil, X, Check } from 'lucide-react';
import { api } from '../../lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  xp: number;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

export default function TaskCard({ task, isDragging = false, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editXp, setEditXp] = useState(task.xp);
  const [editDue, setEditDue] = useState(task.dueDate ?? '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.45 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await api.deleteCard(task.id);
      onDelete?.(task.id);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditXp(task.xp);
    setEditDue(task.dueDate ?? '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await api.updateCard(task.id, {
        title: editTitle,
        description: editDesc,
        xp_value: editXp,
        due_date: editDue ? new Date(editDue).toISOString() : null,
      });
      onUpdate?.(task.id, { title: editTitle, description: editDesc, xp: editXp, dueDate: editDue || undefined });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update card:', err);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-sky-300 bg-white p-4 shadow-lg">
        <div className="mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="mb-2 w-full rounded border border-sky-200 px-2 py-1 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-400"
          placeholder="Task title"
        />
        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          className="mb-2 w-full resize-none rounded border border-sky-200 px-2 py-1 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-400"
          rows={2}
          placeholder="Description"
        />
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">Due Date</label>
            <input
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
              className="w-full rounded border border-sky-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-slate-500 mb-1 block">XP Value</label>
            <input
              type="number"
              value={editXp}
              onChange={e => setEditXp(Number(e.target.value))}
              className="w-full rounded border border-sky-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              min={1}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onPointerDown={e => e.stopPropagation()} onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-1.5 text-xs font-medium text-white hover:bg-sky-600">
            <Check className="h-3.5 w-3.5" /> Save
          </button>
          <button onPointerDown={e => e.stopPropagation()} onClick={handleCancel}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative cursor-grab rounded-lg border border-sky-100/80 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(2,132,199,0.15)] ${
        isDragging ? 'rotate-2 border-sky-200 shadow-[0_14px_30px_rgba(2,132,199,0.20)]' : ''
      }`}
    >
      {/* Action buttons */}
      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleEdit}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-sky-100 hover:text-sky-600"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
      <h4 className="mb-2 text-sm font-semibold leading-snug text-slate-900 sm:text-base">{task.title}</h4>
      <p className="mb-4 text-sm text-slate-600">{task.description}</p>

      <div className="flex items-center justify-between border-t border-sky-100/80 pt-3 text-xs font-medium sm:text-sm">
        {task.dueDate && (
          <div className={`inline-flex min-w-[5rem] items-center justify-center gap-1.5 rounded-full py-1 whitespace-nowrap ${
            isOverdue(task.dueDate) ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-800'
          }`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
        <div className="inline-flex min-w-[5rem] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 py-1 whitespace-nowrap text-amber-800">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="font-medium">{task.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
