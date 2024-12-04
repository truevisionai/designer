/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Environment } from '../utils/environment';
import { MixpanelService } from './mixpanel.service';
import { SentryService } from './sentry.service';

@Injectable( {
	providedIn: 'root'
} )
export class AnalyticsService {

	private destroyed$ = new Subject();

	constructor (
		private mixpanel: MixpanelService,
		private auth: AuthService,
		private router: Router,
		private sentry: SentryService // dont remove required for loading sentry
	) {

		if ( Environment.production ) this.mixpanel.init( Environment.mixpanel_id, this.auth.email );

		if ( this.email != null ) this.setEmail( this.email );

		this.auth.currentUser.subscribe( e => this.onUserChanged() );

	}

	get email () {

		return this.auth.email;

	}

	init (): void {

		if ( Environment.production ) this.trackPageChanges();

	}

	onUserChanged (): void {

		if ( this.email != null ) this.setEmail( this.email );

	}

	send ( event: string, options: any ): void {

		if ( !Environment.production ) return;

		this.mixpanel.track( event, options );

	}

	trackError ( error: Error ): void {

		if ( !Environment.production ) return;

		this.mixpanel.track( 'error', {
			name: error.name,
			message: error.message,
			stack: error.stack
		} );

	}

	setEmail ( email: string ): void {

		if ( Environment.production ) this.mixpanel.setEmail( email );

		this.sentry.setEmail( email );

	}

	trackPageView ( url: string ): void {

		if ( !Environment.production ) return;

		this.mixpanel.track( 'pageview', {
			url: url
		} );

	}

	private trackPageChanges (): void {

		this.router.events
			.pipe(
				filter( ( event: RouterEvent ) => event instanceof NavigationEnd ),
				takeUntil( this.destroyed$ ),
			)
			.subscribe( ( event: NavigationEnd ) => {
				this.trackPageView( event.url );
			} );

	}
}
