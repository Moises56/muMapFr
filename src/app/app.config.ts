import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  withJsonpSupport,
} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(),
    withInterceptorsFromDi(),
    withJsonpSupport()),
    importProvidersFrom(HttpClientModule),
  ],
};
