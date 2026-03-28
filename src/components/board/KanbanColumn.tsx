import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
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
  onUpdateTask?: (id: string, updates: any) => void;
  onAddTask?: (columnId: string) => void;
}

export default function KanbanColumn({ column, onDeleteTask, onUpdateTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className="h-full rounded-xl bg-gray-200/75 p-4 shadow-sm dark:bg-gray-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-100">
          {column.title}
        </h3>
        <span className="rounded-full bg-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {column.tasks.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAddTask?.(column.id)}
        className="mb-3 inline-flex items-center gap-1 rounded-md border border-gray-400 bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Task
      </button>

      <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.tasks.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-400 bg-gray-100/60 px-3 py-4 text-center text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-300">
              Drop tasks in this column
            </div>
          ) : (
            column.tasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
