import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import AddTaskModal, { type NewTaskInput } from './AddTaskModal';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api';

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

interface KanbanBoardProps {
  onXpChange?: (totalXp: number, stats?: { todo: number; in_progress: number; done: number; totalTasks: number }) => void;
}

const BOARD_NAME = 'CS 3500 - Object-Oriented Design';

export default function KanbanBoard({ onXpChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in_progress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ]);

  const calcStats = (cols: Column[]) => ({
    todo: cols.find(c => c.id === 'todo')?.tasks.length ?? 0,
    in_progress: cols.find(c => c.id === 'in_progress')?.tasks.length ?? 0,
    done: cols.find(c => c.id === 'done')?.tasks.length ?? 0,
    totalTasks: cols.reduce((n, c) => n + c.tasks.length, 0),
  });
  const calcXp = (cols: Column[]) =>
    cols.find(c => c.id === 'done')?.tasks.reduce((sum, t) => sum + t.xp, 0) ?? 0;

  useEffect(() => {
    async function init() {
      try {
        let boards = await api.getBoards();
        let board = boards.find((b: any) => b.name === BOARD_NAME);
        if (!board) {
          board = await api.createBoard({ name: BOARD_NAME, course_name: BOARD_NAME });
        }
        setBoardId(board.id);
        const cards = await api.getCards(board.id);
        const newCols: Column[] = [
          { id: 'todo', title: 'To Do', tasks: [] },
          { id: 'in_progress', title: 'In Progress', tasks: [] },
          { id: 'done', title: 'Done', tasks: [] },
        ];
        cards.forEach((c: any) => {
          const col = newCols.find(col => col.id === c.column);
          if (col) {
            col.tasks.push({
              id: c.id,
              title: c.title,
              description: c.description || '',
              dueDate: c.due_date?.split('T')[0],
              xp: c.xp_value,
            });
          }
        });
        newCols.forEach(col => col.tasks.sort((a: any, b: any) => a.position - b.position));
        setColumns(newCols);
        onXpChange?.(calcXp(newCols), calcStats(newCols));
      } catch (err) {
        console.error('Failed to load board:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);


  // Real-time sync via WebSocket
  const isSelfAction = React.useRef(false);
  useEffect(() => {
    if (!boardId) return;
    let ws: WebSocket;
    let reconnectTimer: any;
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = (event) => {
        if (isSelfAction.current) return;
        const data = JSON.parse(event.data);
        if (data.board_id === boardId) {
          api.getCards(boardId).then((cards: any[]) => {
            const newCols: Column[] = [
              { id: 'todo', title: 'To Do', tasks: [] },
              { id: 'in_progress', title: 'In Progress', tasks: [] },
              { id: 'done', title: 'Done', tasks: [] },
            ];
            cards.forEach((c: any) => {
              const col = newCols.find(col => col.id === c.column);
              if (col) col.tasks.push({
                id: c.id, title: c.title,
                description: c.description || '',
                dueDate: c.due_date?.split('T')[0],
                xp: c.xp_value,
              });
            });
            setColumns(newCols);
            onXpChange?.(calcXp(newCols), calcStats(newCols));
          });
        }
      };
      ws.onclose = () => { reconnectTimer = setTimeout(connect, 3000); };
    };
    connect();
    return () => { ws?.close(); clearTimeout(reconnectTimer); };
  }, [boardId]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns.flatMap(col => col.tasks).find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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

    const newCols = columns.map(col => {
      if (col.id === sourceColumn.id) return { ...col, tasks: col.tasks.filter(t => t.id !== activeTaskId) };
      if (col.id === destColumn.id) return { ...col, tasks: [...col.tasks, task] };
      return col;
    });

    setColumns(newCols);
    onXpChange?.(calcXp(newCols), calcStats(newCols));

    isSelfAction.current = true;
    setTimeout(() => { isSelfAction.current = false; }, 2000);
    try {
      await api.moveCard(activeTaskId, { column: destColumn.id, position: destColumn.tasks.length });
    } catch (err) {
      console.error('Failed to move card:', err);
    }
  };

  const handleCreateTask = async (taskData: NewTaskInput) => {
    if (!boardId) return;
    isSelfAction.current = true;
    setTimeout(() => { isSelfAction.current = false; }, 2000);
    try {
      const card = await api.createCard({
        board_id: boardId,
        title: taskData.title,
        description: taskData.description,
        column: 'todo',
        position: 0,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        xp_value: taskData.xp,
      });

      const newTask: Task = {
        id: card.id,
        title: card.title,
        description: card.description || '',
        dueDate: card.due_date?.split('T')[0],
        xp: card.xp_value,
      };

      setColumns(prev => prev.map(col =>
        col.id === 'todo' ? { ...col, tasks: [newTask, ...col.tasks] } : col
      ));
      setIsCreateTaskOpen(false);
    } catch (err) {
      console.error('Failed to create card:', err);
    }
  };

  const handleDeleteTask = (id: string) => {
    const newCols = columns.map(col => ({ ...col, tasks: col.tasks.filter(t => t.id !== id) }));
    setColumns(newCols);
    onXpChange?.(calcXp(newCols), calcStats(newCols));
  };

  const totalTasks = columns.reduce((count, col) => count + col.tasks.length, 0);
  const doneTasks = columns.find(col => col.id === 'done')?.tasks.length ?? 0;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  if (loading) return <div className="flex items-center justify-center p-12 text-slate-500">Loading board...</div>;

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-100/85 via-cyan-100/75 to-emerald-100/75 p-4 shadow-[0_8px_22px_rgba(2,132,199,0.10)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Course Board</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{BOARD_NAME}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
              <span className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 pl-6 pr-6 py-1 text-sky-800">{totalTasks} Total Tasks</span>
              <span className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 pl-6 pr-6 py-1 text-emerald-800">{doneTasks} Completed</span>
              <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 pl-6 pr-6 py-1 text-amber-800">{completionRate}% Completion</span>
            </div>
          </div>
          <Button onClick={() => setIsCreateTaskOpen(true)} className="inline-flex min-w-[8rem] items-center justify-center gap-2 px-0 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="overflow-hidden rounded-xl border border-sky-100/70 bg-gradient-to-r from-sky-100/45 via-cyan-100/35 to-emerald-100/35 py-3">
            <div className="grid min-h-[30rem] grid-flow-col auto-cols-[minmax(18rem,1fr)] gap-5 overflow-x-auto px-0 pt-1 pb-0">
              {columns.map(column => (
                <KanbanColumn key={column.id} column={column} onDeleteTask={handleDeleteTask} />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSave={handleCreateTask}
      />
    </>
  );
}
