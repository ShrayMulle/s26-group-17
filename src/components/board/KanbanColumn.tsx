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
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map(task => task.id);
  const columnTheme = {
    todo: {
      container: 'border-sky-200/80 bg-sky-100/70',
      header: 'border-sky-200/70 bg-gradient-to-r from-sky-200/85 to-cyan-200/75',
      title: 'text-sky-800',
      count: 'border border-sky-200 bg-sky-50 text-sky-700',
      empty: 'border-sky-300/80 bg-sky-50/80 text-sky-600',
    },
    'in-progress': {
      container: 'border-amber-200/80 bg-amber-100/70',
      header: 'border-amber-200/70 bg-gradient-to-r from-amber-200/85 to-orange-200/75',
      title: 'text-amber-800',
      count: 'border border-amber-200 bg-amber-50 text-amber-700',
      empty: 'border-amber-300/80 bg-amber-50/80 text-amber-600',
    },
    done: {
      container: 'border-emerald-200/80 bg-emerald-100/70',
      header: 'border-emerald-200/70 bg-gradient-to-r from-emerald-200/85 to-teal-200/75',
      title: 'text-emerald-800',
      count: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      empty: 'border-emerald-300/80 bg-emerald-50/80 text-emerald-600',
    },
  } as const;

  const theme = columnTheme[column.id as keyof typeof columnTheme] || {
    container: 'border-slate-200/80 bg-slate-100/65',
    header: 'border-slate-200/70 bg-slate-200/70',
    title: 'text-slate-700',
    count: 'border border-slate-200/80 bg-slate-50 text-slate-600',
    empty: 'border-slate-300/80 bg-slate-50/75 text-slate-500',
  };

  return (
    <div className={`flex h-full min-h-[30rem] min-w-[18rem] flex-col rounded-lg border shadow-sm ${theme.container}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${theme.header}`}>
        <h3 className={`text-sm font-semibold uppercase tracking-[0.12em] ${theme.title}`}>{column.title}</h3>
        <span className={`inline-flex min-w-[3rem] items-center justify-center rounded-full pl-4 pr-4 py-1 text-xs font-semibold ${theme.count}`}>
          {column.tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 p-4">
          {column.tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {column.tasks.length === 0 && (
            <div className={`mt-1 flex flex-1 items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm ${theme.empty}`}>
              Drop tasks in this column
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}