import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  xp: number;
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  return (
    <div>
      <div>
        {/* Header */}
        <div>
          <h2>Task Details</h2>
          <button
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div>
          <Input
            label="Title"
            defaultValue={task.title}
          />

          <div>
            <label>
              Description
            </label>
            <textarea
              defaultValue={task.description}
              rows={4}
            />
          </div>

          <div>
            <Input
              label="Due Date"
              type="date"
              defaultValue={task.dueDate}
            />

            <Input
              label="XP Value"
              type="number"
              defaultValue={task.xp}
            />
          </div>

          {/* Stats */}
          <div>
            <h3>Task Stats</h3>
            <div>
              <div>
                <p>0</p>
                <p>Time Logged</p>
              </div>
              <div>
                <p>{task.xp}</p>
                <p>XP Reward</p>
              </div>
              <div>
                <p>0</p>
                <p>Pomodoros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}