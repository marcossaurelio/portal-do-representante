import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PoHttpRequestModule } from '@po-ui/ng-components';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

registerLocaleData(ptBr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([PoHttpRequestModule, /*BrowserAnimationsModule*/]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' }
  ],
  
};