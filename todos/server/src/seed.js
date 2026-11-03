import { Task } from './models/Task.js';

function at(dayOffset, hours, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const samples = [
  { title: 'Finishing Wireframe', description: 'Complete the mobile wireframes for the onboarding flow', day: 0, h: 9, priority: 'high' },
  { title: 'Meeting with team', description: 'Weekly sync about sprint goals', day: 0, h: 11, priority: 'medium' },
  { title: 'Buy a cat food', day: 0, h: 17, priority: 'low', done: true },
  { title: 'Finishing daily commission', day: 0, h: 19, done: true },
  { title: 'Doing Homework', description: 'Math chapter 4 exercises', day: 1, h: 16, priority: 'medium' },
  { title: 'Review pull requests', day: 2, h: 10, priority: 'high' },
  { title: 'Gym session', day: -1, h: 7, done: true },
  { title: 'Call the bank', day: -2, h: 12, priority: 'medium', done: true },
  { title: 'Plan weekend trip', description: 'Book hotel and check train timings', day: 4, h: 20, priority: 'low' },
  { title: 'Submit expense report', day: -7, h: 15, priority: 'high', done: true },
  { title: 'Read design book', day: -6, h: 21 },
  { title: 'Dentist appointment', day: 8, h: 10, priority: 'medium' },
];

export async function seedIfEmpty() {
  if (await Task.estimatedDocumentCount()) return;
  await Task.create(
    samples.map((s) => ({
      title: s.title,
      description: s.description,
      startAt: at(s.day, s.h),
      endAt: at(s.day, s.h + 1),
      priority: s.priority,
      status: s.done ? 'completed' : 'in-progress',
    })),
  );
  console.log(`Seeded ${samples.length} demo tasks`);
}
