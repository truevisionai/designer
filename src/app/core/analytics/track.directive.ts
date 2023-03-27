/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Directive( {
	selector: '[appTrack]'
} )
export class TrackDirective {

	@Input( 'appTrack' ) eventName: string;

	@Input() event: string;
	@Input() action: string;

	constructor ( private analytics: AnalyticsService ) {
	}

	@HostListener( 'click' ) onMouseEnter () {

		const event = this.eventName || this.event;

		if ( this.action != null ) {

			const options = {
				action: this.action
			};

			this.analytics.send( event, options );

		} else {

			this.analytics.send( event, null );

		}
	}

}
