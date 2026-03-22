import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Star, Trash2 } from 'lucide-react';
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
}

export default function TaskCard({ task, isDragging = false, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.45 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      {/* Delete button - shows on hover */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleDelete}
        className="absolute right-2 top-2 hidden rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-600 group-hover:flex"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
      <h4 className="mb-2 text-sm font-semibold leading-snug text-slate-900 sm:text-base">{task.title}</h4>
      <p className="mb-4 text-sm text-slate-600">{task.description}</p>

      <div className="flex items-center justify-between border-t border-sky-100/80 pt-3 text-xs font-medium sm:text-sm">
        {task.dueDate && (
          <div className={`inline-flex min-w-[5rem] items-center justify-center gap-1.5 rounded-full py-1 whitespace-nowrap ${
            isOverdue(task.dueDate)
              ? 'bg-rose-100 text-rose-700'
              : 'bg-cyan-100 text-cyan-800'
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
