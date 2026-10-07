import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Todo, TodoFilter, Priority } from '../models/todo.model';

const STORAGE_KEY = 'todo_app_tasks';

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Completar la configuración inicial del proyecto',
    completed: true,
    priority: 'high',
    category: 'Desarrollo',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: '2',
    title: 'Crear una lista de tareas interactiva y moderna',
    completed: false,
    priority: 'high',
    category: 'Desarrollo',
    createdAt: Date.now() - 3600000,
  },
  {
    id: '3',
    title: 'Organizar la rutina diaria y prioridades',
    completed: false,
    priority: 'medium',
    category: 'Personal',
    createdAt: Date.now() - 1800000,
  },
];

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly todos = signal<Todo[]>([]);
  readonly filter = signal<TodoFilter>('all');
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  readonly categories = computed(() => {
    const list = this.todos();
    const cats = new Set<string>();
    list.forEach((t) => {
      if (t.category?.trim()) cats.add(t.category.trim());
    });
    return Array.from(cats);
  });

  readonly stats = computed(() => {
    const list = this.todos();
    const total = list.length;
    const completed = list.filter((t) => t.completed).length;
    const active = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, percentage };
  });

  readonly filteredTodos = computed(() => {
    const list = this.todos();
    const currentFilter = this.filter();
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    return list.filter((todo) => {
      if (currentFilter === 'active' && todo.completed) return false;
      if (currentFilter === 'completed' && !todo.completed) return false;
      if (cat !== 'all' && todo.category !== cat) return false;
      if (query && !todo.title.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  constructor() {
    this.todos.set(this.loadInitialTodos());

    if (this.isBrowser) {
      effect(() => {
        const items = this.todos();
        const storage = this.getStorage();
        if (storage) {
          try {
            storage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch (error) {
            console.error('Error saving todos to storage', error);
          }
        }
      });
    }
  }

  private getStorage(): Storage | null {
    if (!this.isBrowser) return null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      return null;
    }
    return null;
  }

  private loadInitialTodos(): Todo[] {
    const storage = this.getStorage();
    if (!storage) {
      return INITIAL_TODOS;
    }

    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading todos from storage', error);
    }

    return INITIAL_TODOS;
  }

  addTodo(title: string, priority: Priority = 'medium', category: string = 'General'): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newTodo: Todo = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: trimmedTitle,
      completed: false,
      priority,
      category: category.trim() || 'General',
      createdAt: Date.now(),
    };

    this.todos.update((current) => [newTodo, ...current]);
  }

  toggleTodo(id: string): void {
    this.todos.update((current) =>
      current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'priority' | 'category'>>): void {
    this.todos.update((current) =>
      current.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            title: updates.title !== undefined ? updates.title.trim() : t.title,
            priority: updates.priority ?? t.priority,
            category: updates.category !== undefined ? updates.category.trim() : t.category,
          };
        }
        return t;
      })
    );
  }

  deleteTodo(id: string): void {
    this.todos.update((current) => current.filter((t) => t.id !== id));
  }

  toggleAll(completed?: boolean): void {
    this.todos.update((current) => {
      const targetState = completed ?? current.some((t) => !t.completed);
      return current.map((t) => ({ ...t, completed: targetState }));
    });
  }

  clearCompleted(): void {
    this.todos.update((current) => current.filter((t) => !t.completed));
  }

  setFilter(filter: TodoFilter): void {
    this.filter.set(filter);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
