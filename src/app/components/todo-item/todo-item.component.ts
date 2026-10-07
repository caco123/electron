import { Component, ElementRef, ViewChild, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Priority, Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      [class]="todo().completed ? 'bg-slate-900/40 border-slate-800/60 opacity-75' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
      class="group relative flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
      
      <!-- Checkbox & Main Info -->
      <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <!-- Custom Checkbox -->
        <button
          type="button"
          (click)="toggle()"
          [attr.aria-label]="todo().completed ? 'Marcar como pendiente' : 'Marcar como completada'"
          [class]="todo().completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-slate-950/80 border-slate-700 text-transparent hover:border-indigo-400'"
          class="mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <!-- Todo Details / Edit Form -->
        <div class="flex-1 min-w-0">
          @if (isEditing()) {
            <form (submit)="saveEdit()" class="space-y-2 py-1">
              <input
                #editInput
                type="text"
                [(ngModel)]="editTitle"
                name="editTitle"
                (keydown.escape)="cancelEdit()"
                class="w-full px-3 py-1.5 bg-slate-950 border border-indigo-500 rounded-lg text-sm text-slate-100 outline-none ring-2 ring-indigo-500/20"
              />
              <div class="flex items-center gap-2">
                <select
                  [(ngModel)]="editPriority"
                  name="editPriority"
                  class="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 outline-none">
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>

                <button
                  type="submit"
                  class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer">
                  Guardar
                </button>
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer">
                  Cancelar
                </button>
              </div>
            </form>
          } @else {
            <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <span
                (dblclick)="startEdit()"
                [class]="todo().completed ? 'line-through text-slate-500' : 'text-slate-100'"
                class="text-sm sm:text-base font-normal tracking-wide break-words cursor-pointer select-none">
                {{ todo().title }}
              </span>

              <!-- Badges -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Priority Badge -->
                <span
                  [class]="getPriorityClass(todo().priority)"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border">
                  {{ getPriorityLabel(todo().priority) }}
                </span>

                <!-- Category Badge -->
                @if (todo().category) {
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                    {{ todo().category }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      @if (!isEditing()) {
        <div class="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <!-- Edit button -->
          <button
            type="button"
            (click)="startEdit()"
            title="Editar tarea"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <!-- Delete button -->
          <button
            type="button"
            (click)="deleteItem()"
            title="Eliminar tarea"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class TodoItemComponent {
  private readonly todoService = inject(TodoService);

  readonly todo = input.required<Todo>();

  @ViewChild('editInput') editInputElement?: ElementRef<HTMLInputElement>;

  readonly isEditing = signal(false);
  editTitle = '';
  editPriority: Priority = 'medium';

  toggle(): void {
    this.todoService.toggleTodo(this.todo().id);
  }

  deleteItem(): void {
    this.todoService.deleteTodo(this.todo().id);
  }

  startEdit(): void {
    this.editTitle = this.todo().title;
    this.editPriority = this.todo().priority;
    this.isEditing.set(true);
    setTimeout(() => {
      this.editInputElement?.nativeElement?.focus();
    }, 50);
  }

  saveEdit(): void {
    if (this.editTitle.trim()) {
      this.todoService.updateTodo(this.todo().id, {
        title: this.editTitle.trim(),
        priority: this.editPriority,
      });
    }
    this.isEditing.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  }

  getPriorityClass(priority: Priority): string {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  }
}
