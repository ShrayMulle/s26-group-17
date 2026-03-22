import React, { useState, useEffect } from 'react';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import AddTaskModal, { type NewTaskInput } from './AddTaskModal';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import { Plus, BookOpen, ChevronDown, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import confetti from 'canvas-confetti';

interface Task {
  id: string; title: string; description: string; dueDate?: string; xp: number;
}
interface Column {
  id: string; title: string; tasks: Task[];
}
interface Board {
  id: string; name: string; course_name?: string;
}
interface KanbanBoardProps {
  onXpChange?: (totalXp: number, stats?: { todo: number; in_progress: number; done: number; totalTasks: number }) => void;
}

export default function KanbanBoard({ onXpChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
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

  const loadCards = async (boardId: string) => {
    const cards = await api.getCards(boardId);
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
    newCols.forEach(col => col.tasks.sort((a: any, b: any) => a.position - b.position));
    setColumns(newCols);
    onXpChange?.(calcXp(newCols), calcStats(newCols));
  };

  useEffect(() => {
    async function init() {
      try {
        const fetchedBoards = await api.getBoards();
        if (fetchedBoards.length === 0) {
          const board = await api.createBoard({ name: 'CS 3500 - Object-Oriented Design', course_name: 'CS 3500' });
          setBoards([board]);
          setActiveBoardId(board.id);
          await loadCards(board.id);
        } else {
          setBoards(fetchedBoards);
          setActiveBoardId(fetchedBoards[0].id);
          await loadCards(fetchedBoards[0].id);
        }
      } catch (err) {
        console.error('Failed to load boards:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!activeBoardId) return;
    loadCards(activeBoardId);
  }, [activeBoardId]);

  // Real-time sync
  const isSelfAction = React.useRef(false);
  useEffect(() => {
    if (!activeBoardId) return;
    let ws: WebSocket;
    let reconnectTimer: any;
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = (event) => {
        if (isSelfAction.current) return;
        const data = JSON.parse(event.data);
        if (data.board_id === activeBoardId) loadCards(activeBoardId);
      };
      ws.onclose = () => { reconnectTimer = setTimeout(connect, 3000); };
    };
    connect();
    return () => { ws?.close(); clearTimeout(reconnectTimer); };
  }, [activeBoardId]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    try {
      const board = await api.createBoard({ name: newBoardName.trim(), course_name: newBoardName.trim() });
      setBoards(prev => [...prev, board]);
      setActiveBoardId(board.id);
      setNewBoardName('');
      setShowNewBoardInput(false);
      setShowBoardMenu(false);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (boards.length === 1) return;
    try {
      await api.deleteBoard(boardId);
      const remaining = boards.filter(b => b.id !== boardId);
      setBoards(remaining);
      if (activeBoardId === boardId) setActiveBoardId(remaining[0].id);
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
    const destColumn = columns.find(col => col.id === overId) || columns.find(col => col.tasks.some(t => t.id === overId));
    if (!destColumn || sourceColumn.id === destColumn.id) return;
    const newCols = columns.map(col => {
      if (col.id === sourceColumn.id) return { ...col, tasks: col.tasks.filter(t => t.id !== activeTaskId) };
      if (col.id === destColumn.id) return { ...col, tasks: [...col.tasks, task] };
      return col;
    });
    setColumns(newCols);
    onXpChange?.(calcXp(newCols), calcStats(newCols));
    if (destColumn.id === 'done') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b'],
      });
    }
    isSelfAction.current = true;
    setTimeout(() => { isSelfAction.current = false; }, 2000);
    try {
      await api.moveCard(activeTaskId, { column: destColumn.id, position: destColumn.tasks.length });
    } catch (err) { console.error('Failed to move card:', err); }
  };

  const handleCreateTask = async (taskData: NewTaskInput) => {
    if (!activeBoardId) return;
    isSelfAction.current = true;
    setTimeout(() => { isSelfAction.current = false; }, 2000);
    try {
      const card = await api.createCard({
        board_id: activeBoardId, title: taskData.title, description: taskData.description,
        column: 'todo', position: 0,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        xp_value: taskData.xp,
      });
      const newTask: Task = {
        id: card.id, title: card.title, description: card.description || '',
        dueDate: card.due_date?.split('T')[0], xp: card.xp_value,
      };
      setColumns(prev => prev.map(col => col.id === 'todo' ? { ...col, tasks: [newTask, ...col.tasks] } : col));
      setIsCreateTaskOpen(false);
    } catch (err) { console.error('Failed to create card:', err); }
  };

  const handleUpdateTask = (id: string, updates: any) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    })));
  };

  const handleDeleteTask = (id: string) => {
    const newCols = columns.map(col => ({ ...col, tasks: col.tasks.filter(t => t.id !== id) }));
    setColumns(newCols);
    onXpChange?.(calcXp(newCols), calcStats(newCols));
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const totalTasks = columns.reduce((count, col) => count + col.tasks.length, 0);
  const doneTasks = columns.find(col => col.id === 'done')?.tasks.length ?? 0;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  if (loading) return <div className="flex items-center justify-center p-12 text-slate-500">Loading boards...</div>;

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-100/85 via-cyan-100/75 to-emerald-100/75 p-4 shadow-[0_8px_22px_rgba(2,132,199,0.10)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Course Board</p>

            {/* Board selector */}
            <div className="relative mt-1">
              <button
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                className="flex items-center gap-2 text-xl font-semibold text-slate-900 hover:text-sky-700"
              >
                <BookOpen className="h-5 w-5 text-sky-500" />
                {activeBoard?.name ?? 'Select Board'}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {showBoardMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-sky-200 bg-white shadow-lg">
                  {boards.map(board => (
                    <div key={board.id} className="flex items-center justify-between px-4 py-2 hover:bg-sky-50">
                      <button
                        onClick={() => { setActiveBoardId(board.id); setShowBoardMenu(false); }}
                        className={`flex-1 text-left text-sm ${board.id === activeBoardId ? 'font-semibold text-sky-700' : 'text-slate-700'}`}
                      >
                        {board.name}
                      </button>
                      {boards.length > 1 && (
                        <button onClick={() => handleDeleteBoard(board.id)} className="text-slate-300 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-sky-100 px-4 py-2">
                    {showNewBoardInput ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={newBoardName}
                          onChange={e => setNewBoardName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                          placeholder="Course name..."
                          className="flex-1 rounded border border-sky-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                        />
                        <button onClick={handleCreateBoard} className="rounded bg-sky-500 px-2 py-1 text-xs text-white hover:bg-sky-600">Add</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewBoardInput(true)}
                        className="flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800"
                      >
                        <Plus className="h-4 w-4" />
                        New Course Board
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
              <span className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-800">{totalTasks} Total Tasks</span>
              <span className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">{doneTasks} Completed</span>
              <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">{completionRate}% Completion</span>
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
                <KanbanColumn key={column.id} column={column} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AddTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} onSave={handleCreateTask} />
    </>
  );
}
