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

  // Task id -> request in flight ('toggle' | 'delete'). The ref mirrors it so double clicks are ignored synchronously.
  const [pending, setPending] = useState({});
  const pendingRef = useRef({});
  const markPending = useCallback((id, action) => {
    if (action) pendingRef.current[id] = action;
    else delete pendingRef.current[id];
    setPending({ ...pendingRef.current });
  }, []);

  // Server copies newer than what the lists last fetched, so a toggle shows before the refetch lands
  const [latest, setLatest] = useState({});
  const resolve = useCallback(
    (task) => {
      const newer = latest[task._id];
      return newer && newer.updatedAt > task.updatedAt ? newer : task;
    },
    [latest],
  );

  const toggleStatus = useCallback(
    async (task) => {
      if (pendingRef.current[task._id]) return;
      const status = task.status === 'completed' ? 'in-progress' : 'completed';
      markPending(task._id, 'toggle');
      try {
        const updated = await api.update(task._id, { status });
        setLatest((l) => ({ ...l, [updated._id]: updated }));
        setSheet((s) => (s?.type === 'view' && s.task._id === task._id ? { ...s, task: updated } : s));
        refresh();
      } catch (e) {
        showToast(e.message);
      } finally {
        markPending(task._id, null);
      }
    },
    [refresh, showToast, markPending],
  );

  const deleteTask = useCallback(
    async (task) => {
      if (pendingRef.current[task._id]) return;
      markPending(task._id, 'delete');
      try {
        await api.remove(task._id);
        // The id stays marked so the row stays disabled until the refetch removes it
        setSheet(null);
        refresh();
        showToast('Task deleted', {
          label: 'Undo',
          onClick: async () => {
            showToast('Restoring task…');
            try {
              const { title, description, startAt, endAt, priority, status } = task;
              await api.create({ title, description, startAt, endAt, priority, status });
              refresh();
              showToast('Task restored');
            } catch (e) {
              showToast(e.message);
            }
          },
        });
      } catch (e) {
        markPending(task._id, null);
        showToast(e.message);
      }
    },
    [refresh, showToast, markPending],
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
      pending,
      resolve,
      toggleStatus,
      deleteTask,
      saveTask,
      openCreate: (defaultDate) => setSheet({ type: 'form', defaultDate }),
      openEdit: (task) => setSheet({ type: 'form', task }),
      openView: (task) => setSheet({ type: 'view', task }),
    }),
    [version, pending, resolve, toggleStatus, deleteTask, saveTask],
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
