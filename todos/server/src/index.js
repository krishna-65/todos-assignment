import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { errorHandler } from './errors.js';
import { seedIfEmpty } from './seed.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/tasks', tasksRouter);
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// Serve the built client in production
if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
  app.use(express.static(dist));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const { inMemory } = await connectDB();
if (inMemory) await seedIfEmpty();
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (${inMemory ? 'in-memory MongoDB' : 'MongoDB'})`);
});
