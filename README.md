# Electron

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Electron Desktop Application

La aplicación está completamente configurada para ejecutarse como aplicación de escritorio nativa usando **Electron**:

### Modo Desarrollo (Recarga en vivo)
Para iniciar el servidor de desarrollo de Angular y la ventana de Electron simultáneamente:
```bash
npm run electron:dev
```
> Si ya tienes el servidor de desarrollo corriendo en otra terminal (`npm start`), puedes simplemente abrir Electron con:
> ```bash
> npm run electron:serve
> ```

### Compilar y Ejecutar en Producción
Para compilar los paquetes estáticos de Angular con rutas relativas e iniciar Electron en modo producción:
```bash
npm run electron:start
```

O por pasos separados:
```bash
# 1. Compilar para Electron
npm run build:electron

# 2. Abrir la app compilada en Electron
npm run electron
```

### Arquitectura de Electron
- **Proceso Principal (`electron/main.js`)**: Gestiona la ventana de la aplicación, el ciclo de vida y la comunicación IPC segura.
- **Preload Script (`electron/preload.js`)**: Expone la API segura (`window.electronAPI`) al contexto del navegador.
- **Servicio Angular (`src/app/services/electron.service.ts`)**: Provee un servicio tipado para detectar el entorno de Electron y ejecutar acciones nativas.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
