import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import AddTaskModal, { type NewTaskInput } from './AddTaskModal.tsx';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { ChevronDown, Trash2, Search, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import CourseSearch from './CourseSearch';
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
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string>('todo');
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!showBoardMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!boardMenuRef.current) return;
      if (!boardMenuRef.current.contains(event.target as Node)) {
        setShowBoardMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBoardMenu]);

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
      let retries = 0;
      ws.onclose = () => {
        if (retries < 5) {
          retries++;
          reconnectTimer = setTimeout(connect, 5000 * retries);
        }
      };
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
    const targetColumn = createTaskColumnId || 'todo';
    isSelfAction.current = true;
    setTimeout(() => { isSelfAction.current = false; }, 2000);
    try {
      const card = await api.createCard({
        board_id: activeBoardId, title: taskData.title, description: taskData.description,
        column: targetColumn, position: 0,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        xp_value: taskData.xp,
      });
      const newTask: Task = {
        id: card.id, title: card.title, description: card.description || '',
        dueDate: card.due_date?.split('T')[0], xp: card.xp_value,
      };
      setColumns(prev => prev.map(col => col.id === targetColumn ? { ...col, tasks: [newTask, ...col.tasks] } : col));
      setIsCreateTaskOpen(false);
    } catch (err) { console.error('Failed to create card:', err); }
  };

  const handleAddTaskForColumn = (columnId: string) => {
    setCreateTaskColumnId(columnId);
    setIsCreateTaskOpen(true);
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
  if (loading) return <div>Loading boards...</div>;

  return (
    <>
      <div className="space-y-4 bg-gray-100 p-4 dark:bg-gray-900">
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-2xl font-medium text-gray-800 dark:text-gray-100">
              <span>{activeBoard?.name ?? 'No Course Selected'}</span>
            </div>

            <div className="relative" ref={boardMenuRef}>
              <button
                type="button"
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Select Course
                <ChevronDown className="h-4 w-4" />
              </button>

              {showBoardMenu && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white p-2 shadow-md dark:border-gray-700 dark:bg-gray-900 ${showNewBoardInput ? 'w-72' : 'w-max min-w-fit'}`}
                >
                  {boards.map(board => (
                    <div key={board.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => { setActiveBoardId(board.id); setShowBoardMenu(false); }}
                        className={`whitespace-nowrap pr-2 text-left text-sm ${board.id === activeBoardId ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {board.name}
                      </button>
                      {boards.length > 1 && (
                        <button type="button" onClick={() => handleDeleteBoard(board.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                    {showNewBoardInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={newBoardName}
                          onChange={e => setNewBoardName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                          placeholder="Course name..."
                          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-gray-500"
                        />
                        <button
                          type="button"
                          onClick={handleCreateBoard}
                          className="rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <>
                      <button
                        type="button"
                        onClick={() => { setShowCourseSearch(true); setShowBoardMenu(false); }}
                        className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      >
                        <Search className="h-4 w-4" />
                        Search NEU Courses
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewBoardInput(true)}
                        className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                        New Board
                      </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <div
              className="grid grid-flow-col auto-cols-[minmax(18rem,1fr)] items-stretch gap-4"
              style={{ minHeight: 'calc(100vh - 16rem)' }}
            >
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                  onAddTask={handleAddTaskForColumn}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showCourseSearch && (
        <CourseSearch
          onSelectCourse={async (name) => {
            const board = await api.createBoard({ name, course_name: name });
            setBoards(prev => [...prev, board]);
            setActiveBoardId(board.id);
            setShowCourseSearch(false);
          }}
          onClose={() => setShowCourseSearch(false)}
        />
      )}
      <AddTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} onSave={handleCreateTask} />
    </>
  );
}
