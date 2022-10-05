/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AnalyticsService } from './core/analytics/analytics.service';
import { AppService } from './core/services/app.service';
import { LayoutService } from './shared/services/layout.service';

import { RoutePartsService } from './shared/services/route-parts.service';
import { ThemeService } from './shared/services/theme.service';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
} )
export class AppComponent implements OnInit, AfterViewInit {

	appTitle = 'Truevision';
	pageTitle = '';
	private destroyed$ = new Subject();

	constructor (
		public title: Title,
		private router: Router,
		private activeRoute: ActivatedRoute,
		private routePartsService: RoutePartsService,
		private themeService: ThemeService,
		private layout: LayoutService,
		private renderer: Renderer2,
		private appService: AppService,
		private analytics: AnalyticsService,
		private translate: TranslateService
	) {
	}

	get production () {
		return environment.production;
	}

	ngOnInit () {

		this.analytics.init();

		this.analytics.send( 'app-opened', {} );

		this.changePageTitle();

		this.trackPageChanges();

		this.translate.setDefaultLang( 'en' );

	}

	ngAfterViewInit () {
		this.layout.applyMatTheme( this.renderer );
	}

	changePageTitle () {
		this.router.events.pipe( filter( event => event instanceof NavigationEnd ) ).subscribe( ( routeChange ) => {
			var routeParts = this.routePartsService.generateRouteParts( this.activeRoute.snapshot );
			if ( !routeParts.length ) {
				return this.title.setTitle( this.appTitle );
			}
			// Extract title from parts;
			this.pageTitle = routeParts
				.reverse()
				.map( ( part ) => part.title )
				.reduce( ( partA, partI ) => {
					return `${ partA } > ${ partI }`;
				} );
			this.pageTitle += ` | ${ this.appTitle }`;
			this.title.setTitle( this.pageTitle );
		} );
	}

	private trackPageChanges () {
		this.router.events
			.pipe(
				filter( ( event: RouterEvent ) => event instanceof NavigationEnd ),
				takeUntil( this.destroyed$ ),
			)
			.subscribe( ( event: NavigationEnd ) => {
				this.analytics.trackPageView( event.url );
			} );
	}
}
