import mongoose from 'mongoose';

export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['in-progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or less'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must be 1000 characters or less'],
    },
    startAt: { type: Date, required: [true, 'Date & time is required'] },
    endAt: {
      type: Date,
      validate: {
        validator(value) {
          return !value || !this.startAt || value > this.startAt;
        },
        message: 'End time must be after start time',
      },
    },
    priority: { type: String, enum: { values: PRIORITIES, message: 'Invalid priority' } },
    status: { type: String, enum: { values: STATUSES, message: 'Invalid status' }, default: 'in-progress' },
    completedAt: Date,
  },
  { timestamps: true },
);

taskSchema.index({ startAt: 1 });

taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'completed' ? new Date() : undefined;
  }
});

export const Task = mongoose.model('Task', taskSchema);
