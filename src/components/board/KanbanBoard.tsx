import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

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

export default function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: '1', title: 'Read Chapter 5', description: 'Object-Oriented Design patterns', dueDate: '2026-02-20', xp: 10 },
        { id: '2', title: 'Complete Lab 3', description: 'Implement MVC pattern', dueDate: '2026-02-18', xp: 25 },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: '3', title: 'Study for Midterm', description: 'Review chapters 1-5', dueDate: '2026-02-22', xp: 50 },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: '4', title: 'Assignment 2', description: 'Completed and submitted', xp: 30 },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(col => col.tasks)
      .find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const sourceColumn = columns.find(col => col.tasks.some(t => t.id === activeTaskId));
    if (!sourceColumn) return;

    const task = sourceColumn.tasks.find(t => t.id === activeTaskId);
    if (!task) return;

    const overId = over.id as string;
    const destColumn =
      columns.find(col => col.id === overId) ||
      columns.find(col => col.tasks.some(t => t.id === overId));

    if (!destColumn || sourceColumn.id === destColumn.id) return;

    setColumns(prev => prev.map(col => {
      if (col.id === sourceColumn!.id) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== activeTaskId),
        };
      }
      if (col.id === destColumn!.id) {
        return {
          ...col,
          tasks: [...col.tasks, task!],
        };
      }
      return col;
    }));
  };

  const handleAddTask = () => {
    alert('Add task modal coming soon!');
  };

  const totalTasks = columns.reduce((count, column) => count + column.tasks.length, 0);
  const doneTasks = columns.find(col => col.id === 'done')?.tasks.length ?? 0;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-100/85 via-cyan-100/75 to-emerald-100/75 p-4 shadow-[0_8px_22px_rgba(2,132,199,0.10)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Course Board</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">CS 3500 - Object-Oriented Design</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-800">{totalTasks} Total Tasks</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">{doneTasks} Completed</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">{completionRate}% Completion</span>
          </div>
        </div>

        <Button onClick={handleAddTask} className="inline-flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-2xl border border-sky-100/70 bg-gradient-to-r from-sky-100/45 via-cyan-100/35 to-emerald-100/35 py-3">
          <div className="grid min-h-[30rem] grid-flow-col auto-cols-[minmax(18rem,1fr)] gap-5 overflow-x-auto px-0 pt-1 pb-0">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
