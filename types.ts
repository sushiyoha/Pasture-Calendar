export enum TimeUnit {
  Year = 'Year',
  HalfYear = 'HalfYear',
  Quarter = 'Quarter',
  Month = 'Month',
  Week = 'Week',
  Day = 'Day'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface GridItemData {
  id: string; // Unique ID usually based on date string
  label: string; // Display text (e.g. "Jan", "Mon")
  fullDateLabel: string; // "January 2024"
  date: Date;
}

export interface ViewConfig {
  major: TimeUnit;
  minor: TimeUnit;
  baseDate: Date;
}

export type TasksMap = Record<string, Task[]>;