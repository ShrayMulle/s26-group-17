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
      <div>
        <div />
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          placeholder="Task title"
        />
        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          rows={2}
          placeholder="Description"
        />
        <div>
          <div>
            <label>Due Date</label>
            <input
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
            />
          </div>
          <div>
            <label>XP Value</label>
            <input
              type="number"
              value={editXp}
              onChange={e => setEditXp(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
        <div>
          <button onPointerDown={e => e.stopPropagation()} onClick={handleSave}>
            <Check /> Save
          </button>
          <button onPointerDown={e => e.stopPropagation()} onClick={handleCancel}>
            <X /> Cancel
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
    >
      {/* Action buttons */}
      <div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleEdit}
        >
          <Pencil />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
        >
          <Trash2 />
        </button>
      </div>

      <div />
      <h4>{task.title}</h4>
      <p>{task.description}</p>

      <div>
        {task.dueDate && (
          <div>
            <Calendar />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
        <div>
          <Star />
          <span>{task.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
