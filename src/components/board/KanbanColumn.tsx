import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  xp: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanColumnProps {
  column: Column;
  onDeleteTask?: (id: string) => void;
}

const columnStyles: Record<string, { header: string; badge: string; empty: string }> = {
  todo: {
    header: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700',
    empty: 'text-sky-400 border-sky-200',
  },
  in_progress: {
    header: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    empty: 'text-slate-400 border-slate-200',
  },
  done: {
    header: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    empty: 'text-emerald-400 border-emerald-200',
  },
};

export default function KanbanColumn({ column, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const styles = columnStyles[column.id] ?? columnStyles['todo'];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border px-3 py-3 transition-colors ${
        isOver ? 'border-sky-300 bg-sky-50/60' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${styles.header}`}>
          {column.title}
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
          {column.tasks.length}
        </span>
      </div>

      <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {column.tasks.length === 0 ? (
            <div className={`flex flex-1 min-h-[8rem] items-center justify-center rounded-lg border border-dashed text-sm ${styles.empty}`}>
              Drop tasks in this column
            </div>
          ) : (
            column.tasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
