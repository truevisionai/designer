/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';

import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NgxElectronModule } from 'ngx-electron';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { CoreModule } from './core/core.module';
import { ThreeJsModule } from './modules/three-js/three-js.module';

import { TvMapModule } from './modules/tv-map/tv-map.module';
import { ErrorHandlerService } from './shared/services/error-handler.service';

import { SharedModule } from './shared/shared.module';
import { EditorModule } from './views/editor/editor.module';
import { SessionsModule } from './views/sessions/sessions.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory ( httpClient: HttpClient ) {
	return new TranslateHttpLoader( httpClient, './assets/i18n/', '.json' );
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true
};

@NgModule( {
	imports: [
		AppRoutingModule,
		MatTreeModule,
		BrowserModule,
		NoopAnimationsModule,
		SharedModule,
		HttpClientModule,
		PerfectScrollbarModule,
		FormsModule,

		CoreModule,
		EditorModule,
		TvMapModule,
		ThreeJsModule,
		NgxElectronModule,

		SessionsModule,
		SatPopoverModule,

		TranslateModule.forRoot( {
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [ HttpClient ]
			}
		} ),
	],
	declarations: [ AppComponent ],
	providers: [
		{ provide: ErrorHandler, useClass: ErrorHandlerService },
		{ provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [ AppComponent ],
	exports: []
} )
export class AppModule {
}
