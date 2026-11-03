import { Router } from 'express';
import { Task, STATUSES } from '../models/Task.js';
import { HttpError } from '../errors.js';

const router = Router();
const EDITABLE = ['title', 'description', 'startAt', 'endAt', 'priority', 'status'];

// Copy only editable fields; '' and null mean "clear this field"
function pickEditable(body = {}) {
  const out = {};
  for (const field of EDITABLE) {
    if (field in body) out[field] = body[field] === '' || body[field] === null ? undefined : body[field];
  }
  return out;
}

function parseDate(value, name) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new HttpError(400, `Invalid "${name}" date`);
  return date;
}

function resolveTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/tasks?from&to&q&status
router.get('/', async (req, res) => {
  const { from, to, q, status } = req.query;
  const filter = {};

  if (from || to) {
    filter.startAt = {};
    if (from) filter.startAt.$gte = parseDate(from, 'from');
    if (to) filter.startAt.$lt = parseDate(to, 'to');
  }
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
    filter.status = status;
  }
  if (typeof q === 'string' && q.trim()) {
    const re = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: re }, { description: re }];
  }

  const tasks = await Task.find(filter).sort({ startAt: 1 }).limit(500);
  res.json(tasks);
});

// GET /api/tasks/weeks?tz=Asia/Kolkata — open/completed counts per Monday-start week
router.get('/weeks', async (req, res) => {
  const timezone = resolveTimezone(req.query.tz || 'UTC');
  const weeks = await Task.aggregate([
    {
      $group: {
        _id: { $dateTrunc: { date: '$startAt', unit: 'week', startOfWeek: 'monday', timezone } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        weekStart: '$_id',
        total: 1,
        completed: 1,
        open: { $subtract: ['$total', '$completed'] },
      },
    },
  ]);
  res.json(weeks);
});

router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.json(task);
});

router.post('/', async (req, res) => {
  const task = await Task.create(pickEditable(req.body));
  res.status(201).json(task);
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  task.set(pickEditable(req.body));
  await task.save();
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(204).end();
});

export default router;
