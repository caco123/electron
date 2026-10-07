import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Productividad Diaria
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Mi Lista de Tareas
          </h1>
          <p class="text-slate-400 text-sm mt-1 capitalize">
            {{ formattedDate }}
          </p>
        </div>

        <!-- Quick Summary Cards -->
        <div class="flex items-center gap-2.5">
          <div class="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[72px]">
            <span class="block text-xl font-bold text-slate-100">{{ stats().total }}</span>
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total</span>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[72px]">
            <span class="block text-xl font-bold text-amber-400">{{ stats().active }}</span>
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pend.</span>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[72px]">
            <span class="block text-xl font-bold text-emerald-400">{{ stats().completed }}</span>
            <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Hechas</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar Section -->
      @if (stats().total > 0) {
        <div class="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div class="flex items-center justify-between text-xs font-medium mb-2">
            <span class="text-slate-300 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Progreso general
            </span>
            <span class="text-indigo-300 font-semibold">{{ stats().percentage }}% completado</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 ease-out"
              [style.width.%]="stats().percentage">
            </div>
          </div>
        </div>
      }
    </header>
  `,
})
export class TodoHeaderComponent {
  private readonly todoService = inject(TodoService);
  readonly stats = this.todoService.stats;

  readonly formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
