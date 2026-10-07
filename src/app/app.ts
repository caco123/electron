import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from './services/todo.service';
import { TodoHeaderComponent } from './components/todo-header/todo-header.component';
import { TodoInputComponent } from './components/todo-input/todo-input.component';
import { TodoFiltersComponent } from './components/todo-filters/todo-filters.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TodoHeaderComponent,
    TodoInputComponent,
    TodoFiltersComponent,
    TodoItemComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly title = signal('Todo List');
  readonly todoService = inject(TodoService);

  readonly filteredTodos = this.todoService.filteredTodos;
  readonly stats = this.todoService.stats;
}
