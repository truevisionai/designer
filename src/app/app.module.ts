/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';

import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { AnalyticsService } from './core/analytics/analytics.service';
import { CoreModule } from './core/core.module';
import { errorHandlerFactory } from './exceptions/error-handler.factory';
import { ScenarioModule } from './scenario/scenario.module';

import { TvMapModule } from './map/tv-map.module';

import { SharedModule } from './views/shared/shared.module';
import { ImportFbxDialogComponent } from './views/dialogs/import-fbx-dialog/import-fbx-dialog.component';
import { EditorModule } from './views/editor/editor.module';
import { SessionsModule } from './views/sessions/sessions.module';
import { LoadingModule } from './views/editor/loading/loading.module';
import { SentryService } from './core/analytics/sentry.service';
import { SnackBar } from './services/snack-bar.service';
import { LaneWidthModule } from './modules/lane-width/lane-width.module';

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
		ScenarioModule,

		SessionsModule,
		SatPopoverModule,
		LoadingModule,

		LaneWidthModule,

		TranslateModule.forRoot( {
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [ HttpClient ]
			}
		} ),
	],
	declarations: [ AppComponent, ImportFbxDialogComponent ],
	providers: [
		{ provide: ErrorHandler, useFactory: errorHandlerFactory, deps: [ Injector, AnalyticsService, SentryService, SnackBar ], },
		{ provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [ AppComponent ],
	exports: []
} )
export class AppModule {
}
