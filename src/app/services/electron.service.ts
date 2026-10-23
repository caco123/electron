import { Injectable, signal } from '@angular/core';

export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getRole: () => Promise<string>;
  getName: () => Promise<string>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  readonly isElectron = signal<boolean>(false);
  readonly appVersion = signal<string>('');
  readonly platform = signal<string>('');
  readonly role = signal<'admin' | 'user' | ''>('');
  readonly appName = signal<string>('');

  constructor() {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      this.isElectron.set(true);
      this.platform.set(window.electronAPI.platform || '');
      window.electronAPI
        .getVersion()
        .then((ver) => this.appVersion.set(ver))
        .catch(() => {});
      window.electronAPI
        .getRole()
        .then((r) => this.role.set((r as 'admin' | 'user') || 'user'))
        .catch(() => {});
      window.electronAPI
        .getName()
        .then((name) => this.appName.set(name))
        .catch(() => {});
    }
  }

  minimize(): void {
    if (this.isElectron() && window.electronAPI) {
      window.electronAPI.minimize();
    }
  }

  maximize(): void {
    if (this.isElectron() && window.electronAPI) {
      window.electronAPI.maximize();
    }
  }

  close(): void {
    if (this.isElectron() && window.electronAPI) {
      window.electronAPI.close();
    }
  }
}
