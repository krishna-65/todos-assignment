import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import BottomSheet from '../components/BottomSheet';
import TaskForm from '../components/TaskForm';
import TaskDetail from '../components/TaskDetail';
import Toast from '../components/Toast';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  // Bumped after every mutation; data hooks list it as a dependency to refetch
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  // { type: 'form', task?, defaultDate? } | { type: 'view', task }
  const [sheet, setSheet] = useState(null);
  const closeSheet = useCallback(() => setSheet(null), []);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const showToast = useCallback((message, action) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, action });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const toggleStatus = useCallback(
    async (task) => {
      const status = task.status === 'completed' ? 'in-progress' : 'completed';
      try {
        const updated = await api.update(task._id, { status });
        setSheet((s) => (s?.type === 'view' && s.task._id === task._id ? { ...s, task: updated } : s));
        refresh();
      } catch (e) {
        showToast(e.message);
      }
    },
    [refresh, showToast],
  );

  const deleteTask = useCallback(
    async (task) => {
      try {
        await api.remove(task._id);
        setSheet(null);
        refresh();
        showToast('Task deleted', {
          label: 'Undo',
          onClick: async () => {
            const { title, description, startAt, endAt, priority, status } = task;
            await api.create({ title, description, startAt, endAt, priority, status });
            refresh();
          },
        });
      } catch (e) {
        showToast(e.message);
      }
    },
    [refresh, showToast],
  );

  // Errors propagate so the form can show field messages
  const saveTask = useCallback(
    async (data, id) => {
      const saved = id ? await api.update(id, data) : await api.create(data);
      setSheet(null);
      refresh();
      showToast(id ? 'Task updated' : 'Task created');
      return saved;
    },
    [refresh, showToast],
  );

  const value = useMemo(
    () => ({
      version,
      toggleStatus,
      deleteTask,
      saveTask,
      openCreate: (defaultDate) => setSheet({ type: 'form', defaultDate }),
      openEdit: (task) => setSheet({ type: 'form', task }),
      openView: (task) => setSheet({ type: 'view', task }),
    }),
    [version, toggleStatus, deleteTask, saveTask],
  );

  return (
    <TaskContext.Provider value={value}>
      {children}

      <BottomSheet
        open={sheet?.type === 'form'}
        title={sheet?.task ? 'Edit Task' : 'Add New Task'}
        onClose={closeSheet}
      >
        {sheet?.type === 'form' && (
          <TaskForm key={sheet.task?._id ?? 'new'} task={sheet.task} defaultDate={sheet.defaultDate} />
        )}
      </BottomSheet>

      <BottomSheet open={sheet?.type === 'view'} title="Task Details" onClose={closeSheet}>
        {sheet?.type === 'view' && <TaskDetail task={sheet.task} />}
      </BottomSheet>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside <TaskProvider>');
  return ctx;
}
