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
      <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-4 shadow-lg">
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="mb-2 w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          placeholder="Task title"
        />
        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          className="mb-2 w-full resize-none rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={2}
          placeholder="Description"
        />
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Due Date</label>
            <input
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">XP Value</label>
            <input
              type="number"
              value={editXp}
              onChange={e => setEditXp(Number(e.target.value))}
              className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
              min={1}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onPointerDown={e => e.stopPropagation()} onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-900 dark:bg-gray-600 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
            <Check className="h-3.5 w-3.5" /> Save
          </button>
          <button onPointerDown={e => e.stopPropagation()} onClick={handleCancel}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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
      className={`group relative cursor-grab rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? 'rotate-2 shadow-lg' : ''
      }`}
    >
      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
        <button onPointerDown={(e) => e.stopPropagation()} onClick={handleEdit}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={handleDelete}
          className="rounded-md p-1 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <h4 className="mb-1 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 pr-12">{task.title}</h4>
      {task.description && <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{task.description}</p>}

      <div className="flex items-center gap-2 text-xs">
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
            isOverdue(task.dueDate)
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-amber-700 dark:text-amber-400">
          <Star className="h-3 w-3 fill-current" />
          {task.xp} XP
        </span>
      </div>
    </div>
  );
}
