import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, Plus, X } from 'lucide-react';

export interface NewTaskInput {
  title: string;
  description: string;
  dueDate?: string;
  xp: number;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTaskInput) => void | Promise<void>;
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
  const canSubmit = formValues.title.trim().length > 0;

  useEffect(() => {
    if (!isOpen) return;
    setFormValues(initialValues);
    setErrors({});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = formValues.title.trim();
    const trimmedDescription = formValues.description.trim();
    const parsedXp = Number(formValues.xp);
    const nextErrors: FormErrors = {};

    if (!trimmedTitle) nextErrors.title = 'Enter a task title.';
    if (!trimmedDescription) nextErrors.description = 'Add a short description.';
    if (!Number.isFinite(parsedXp) || parsedXp < 0) {
      nextErrors.xp = 'XP must be a number greater than or equal to 0.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSave({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        onClick={event => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-700" />
              <h2 id="create-task-title" className="text-lg font-semibold text-gray-900">
                Add Task
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close add task dialog"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Task Title</label>
              <input
                value={formValues.title}
                onChange={event => updateField('title', event.target.value)}
                placeholder="Example: Review lecture notes"
                autoFocus
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
              <textarea
                value={formValues.description}
                onChange={event => updateField('description', event.target.value)}
                rows={5}
                placeholder="What needs to get done?"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Due Date</label>
                <input
                  type="date"
                  value={formValues.dueDate}
                  onChange={event => updateField('dueDate', event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">XP Value</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formValues.xp}
                  onChange={event => updateField('xp', event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                {errors.xp && <p className="mt-1 text-xs text-red-600">{errors.xp}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
