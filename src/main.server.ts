import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/components/app/app.component';
import { config } from './app/app.config.server';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
