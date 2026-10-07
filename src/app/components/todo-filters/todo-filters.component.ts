import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoFilter } from '../../models/todo.model';

@Component({
  selector: 'app-todo-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 mb-6">
      <!-- Search & Category Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search bar -->
        <div class="relative flex-1">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar tareas..."
            class="w-full pl-9 pr-8 py-2 bg-slate-900/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>

        <!-- Category Dropdown filter -->
        @if (categories().length > 0) {
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-400 whitespace-nowrap">Categoría:</label>
            <select
              [ngModel]="selectedCategory()"
              (ngModelChange)="onCategoryChange($event)"
              class="bg-slate-900/60 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer transition-colors">
              <option value="all">Todas las categorías</option>
              @for (cat of categories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Status Tabs & Action buttons -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <!-- Status Pills -->
        <div class="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            type="button"
            (click)="setFilter('all')"
            [class]="currentFilter() === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            <span>Todas</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class]="currentFilter() === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'">
              {{ stats().total }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('active')"
            [class]="currentFilter() === 'active'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            <span>Pendientes</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class]="currentFilter() === 'active' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'">
              {{ stats().active }}
            </span>
          </button>

          <button
            type="button"
            (click)="setFilter('completed')"
            [class]="currentFilter() === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5">
            <span>Completadas</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px]"
              [class]="currentFilter() === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'">
              {{ stats().completed }}
            </span>
          </button>
        </div>

        <!-- Bulk Action Buttons -->
        <div class="flex items-center gap-2">
          @if (stats().total > 0) {
            <button
              type="button"
              (click)="toggleAll()"
              class="text-xs px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ stats().active === 0 ? 'Desmarcar todas' : 'Marcar todas' }}</span>
            </button>
          }

          @if (stats().completed > 0) {
            <button
              type="button"
              (click)="clearCompleted()"
              class="text-xs px-2.5 py-1.5 rounded-lg text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Limpiar completadas ({{ stats().completed }})</span>
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class TodoFiltersComponent {
  private readonly todoService = inject(TodoService);

  readonly currentFilter = this.todoService.filter;
  readonly searchQuery = this.todoService.searchQuery;
  readonly selectedCategory = this.todoService.selectedCategory;
  readonly categories = this.todoService.categories;
  readonly stats = this.todoService.stats;

  setFilter(filter: TodoFilter): void {
    this.todoService.setFilter(filter);
  }

  onSearchChange(val: string): void {
    this.todoService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.todoService.setSearchQuery('');
  }

  onCategoryChange(cat: string): void {
    this.todoService.setSelectedCategory(cat);
  }

  toggleAll(): void {
    this.todoService.toggleAll();
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
}
