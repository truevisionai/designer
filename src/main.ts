/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SentryService } from 'app/core/analytics/sentry.service';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

SentryService.init();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
