import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Priority } from '../../models/todo.model';

@Component({
  selector: 'app-todo-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shadow-black/40 mb-6">
      <form (submit)="handleSubmit($event)" class="space-y-4">
        <!-- Main Input Line -->
        <div class="relative flex items-center">
          <div class="absolute left-3.5 text-slate-500 pointer-events-none">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="title"
            name="title"
            placeholder="¿Qué necesitas hacer hoy?..."
            class="w-full pl-11 pr-28 py-3.5 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none transition-all"
            required
            autocomplete="off"
          />
          <button
            type="submit"
            [disabled]="!title().trim()"
            class="absolute right-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Agregar</span>
          </button>
        </div>

        <!-- Optional controls: Priority and Category -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <!-- Priority Selector -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-400 font-medium mr-1">Prioridad:</span>
            
            <button
              type="button"
              (click)="priority.set('low')"
              [class]="priority() === 'low'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer">
              Baja
            </button>

            <button
              type="button"
              (click)="priority.set('medium')"
              [class]="priority() === 'medium'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer">
              Media
            </button>

            <button
              type="button"
              (click)="priority.set('high')"
              [class]="priority() === 'high'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer">
              Alta
            </button>
          </div>

          <!-- Category Selector / Presets -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Categoría:</span>
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="category"
                name="category"
                list="category-suggestions"
                placeholder="Ej. Trabajo, Personal"
                class="px-3 py-1 bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none w-36 sm:w-44 transition-colors"
              />
              <datalist id="category-suggestions">
                <option value="Trabajo"></option>
                <option value="Personal"></option>
                <option value="Estudio"></option>
                <option value="Hogar"></option>
                <option value="Desarrollo"></option>
              </datalist>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class TodoInputComponent {
  private readonly todoService = inject(TodoService);

  readonly title = signal('');
  readonly priority = signal<Priority>('medium');
  readonly category = signal('General');

  handleSubmit(event: Event): void {
    event.preventDefault();
    const currentTitle = this.title().trim();
    if (!currentTitle) return;

    this.todoService.addTodo(
      currentTitle,
      this.priority(),
      this.category() || 'General'
    );

    this.title.set('');
  }
}
