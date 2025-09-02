// src/app/app.config.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// --- IMPORTS QUE FALTAM ---
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor'; // Importe seu interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    // Seus providers existentes (mantenha eles)
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // --- PROVIDERS ESSENCIAIS PARA O LOGIN (ADICIONE ESTES) ---

    // 1. Registra o HttpClient para que ele possa ser injetado nos serviços
    provideHttpClient(withInterceptorsFromDi()),

    // 2. Registra o seu Interceptor para adicionar o token nas requisições
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
