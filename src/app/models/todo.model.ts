export type Priority = 'low' | 'medium' | 'high';
export type TodoFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}
