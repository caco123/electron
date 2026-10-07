import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignore storage errors in headless tests
    }
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new todo', () => {
    const initialCount = service.todos().length;
    service.addTodo('Nueva tarea de prueba', 'high', 'Pruebas');

    const todos = service.todos();
    expect(todos.length).toBe(initialCount + 1);
    expect(todos[0].title).toBe('Nueva tarea de prueba');
    expect(todos[0].priority).toBe('high');
    expect(todos[0].category).toBe('Pruebas');
    expect(todos[0].completed).toBe(false);
  });

  it('should toggle a todo completion state', () => {
    service.addTodo('Tarea a completar');
    const newId = service.todos()[0].id;

    expect(service.todos()[0].completed).toBe(false);
    service.toggleTodo(newId);
    expect(service.todos()[0].completed).toBe(true);
    service.toggleTodo(newId);
    expect(service.todos()[0].completed).toBe(false);
  });

  it('should delete a todo', () => {
    service.addTodo('Tarea para eliminar');
    const newId = service.todos()[0].id;
    const countBefore = service.todos().length;

    service.deleteTodo(newId);
    expect(service.todos().length).toBe(countBefore - 1);
    expect(service.todos().some((t) => t.id === newId)).toBe(false);
  });

  it('should filter active and completed todos correctly', () => {
    service.todos.set([
      { id: '1', title: 'Task 1', completed: false, priority: 'low', category: 'General', createdAt: 1 },
      { id: '2', title: 'Task 2', completed: true, priority: 'medium', category: 'General', createdAt: 2 },
    ]);

    service.setFilter('active');
    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].id).toBe('1');

    service.setFilter('completed');
    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].id).toBe('2');

    service.setFilter('all');
    expect(service.filteredTodos().length).toBe(2);
  });

  it('should calculate stats accurately', () => {
    service.todos.set([
      { id: '1', title: 'T1', completed: true, priority: 'low', category: 'General', createdAt: 1 },
      { id: '2', title: 'T2', completed: false, priority: 'low', category: 'General', createdAt: 2 },
    ]);

    const stats = service.stats();
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.active).toBe(1);
    expect(stats.percentage).toBe(50);
  });
});
