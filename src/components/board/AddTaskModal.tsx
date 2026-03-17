import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ClipboardList, Sparkles, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export interface NewTaskInput {
  title: string;
  description: string;
  dueDate?: string;
  xp: number;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTaskInput) => void;
}

interface FormValues {
  title: string;
  description: string;
  dueDate: string;
  xp: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  xp?: string;
}

const initialValues: FormValues = {
  title: '',
  description: '',
  dueDate: '',
  xp: '10',
};

export default function AddTaskModal({ isOpen, onClose, onSave }: AddTaskModalProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(initialValues);
    setErrors({});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updateField = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'title' || field === 'description' || field === 'xp') {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = formValues.title.trim();
    const trimmedDescription = formValues.description.trim();
    const parsedXp = Number(formValues.xp);
    const nextErrors: FormErrors = {};

    if (!trimmedTitle) {
      nextErrors.title = 'Enter a task title.';
    }

    if (!trimmedDescription) {
      nextErrors.description = 'Add a short description so the task card has context.';
    }

    if (!Number.isFinite(parsedXp) || parsedXp < 0) {
      nextErrors.xp = 'XP must be a number greater than or equal to 0.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: trimmedTitle,
      description: trimmedDescription,
      dueDate: formValues.dueDate || undefined,
      xp: parsedXp,
    });
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/98 via-cyan-50/96 to-emerald-50/94 shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
        onClick={event => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="border-b border-sky-200/70 bg-gradient-to-r from-sky-100/90 via-cyan-100/80 to-emerald-100/80 px-6 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/85 pl-6 pr-6 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                  <ClipboardList className="h-3.5 w-3.5" />
                  New Task
                </div>
                <div>
                  <h2 id="create-task-title" className="text-2xl font-semibold tracking-tight text-slate-900">
                    Add a task to the board
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-slate-600">
                    Fill in the task details below. Saved tasks are added to the To Do column automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-sky-200/80 bg-sky-50/85 text-slate-500 transition-colors hover:border-sky-300 hover:text-slate-700"
                aria-label="Close add task dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
              <div className="space-y-5">
                <Input
                  label="Task Title"
                  value={formValues.title}
                  onChange={event => updateField('title', event.target.value)}
                  error={errors.title}
                  placeholder="Example: Review lecture notes"
                  autoFocus
                  className="border-sky-200/80 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:ring-sky-300"
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={formValues.description}
                    onChange={event => updateField('description', event.target.value)}
                    rows={6}
                    placeholder="What needs to get done, or what should the card remind you about?"
                    className={`w-full rounded-md border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-sky-300 ${
                      errors.description
                        ? 'border-rose-400 bg-rose-50/80'
                        : 'border-sky-200/80 bg-white/80'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}
                </div>
              </div>

              <div className="space-y-5 rounded-lg border border-sky-200/70 bg-gradient-to-b from-sky-100/80 to-cyan-50/85 p-5 shadow-inner shadow-white/30">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">Task Details</p>
                  <p className="mt-1 text-sm text-slate-600">Set when the task should be completed and how much XP it is worth.</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Due Date"
                    type="date"
                    value={formValues.dueDate}
                    onChange={event => updateField('dueDate', event.target.value)}
                    className="border-sky-200/80 bg-white/80 text-slate-900 focus:ring-sky-300"
                  />

                  <Input
                    label="XP Value"
                    type="number"
                    min="0"
                    step="5"
                    value={formValues.xp}
                    onChange={event => updateField('xp', event.target.value)}
                    error={errors.xp}
                    className="border-sky-200/80 bg-white/80 text-slate-900 focus:ring-sky-300"
                  />
                </div>

                <div className="rounded-md border border-emerald-200/70 bg-gradient-to-r from-emerald-100/90 to-teal-100/85 p-4 text-sm text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="h-4 w-4" />
                    To Do Placement
                  </div>
                  <p className="mt-2 text-emerald-900/80">
                    New cards start in To Do so they can be prioritized before moving into active work.
                  </p>
                </div>

                <div className="rounded-md border border-sky-200/80 bg-sky-50/85 p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CalendarDays className="h-4 w-4 text-sky-700" />
                    Suggested Defaults
                  </div>
                  <p className="mt-2 text-slate-600">
                    Leave the date blank if the task does not have a deadline yet. XP defaults to 10 and can be adjusted later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-sky-200/70 bg-gradient-to-r from-sky-50/90 to-cyan-50/85 px-6 py-5 sm:px-8">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Save Task
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}