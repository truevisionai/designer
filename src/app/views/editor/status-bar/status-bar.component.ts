/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { Time } from 'app/core/time';
import { Environment } from 'app/core/utils/environment';
import { StatusBarService } from 'app/services/status-bar.service';

@Component( {
	selector: 'app-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: [ './status-bar.component.css' ]
} )
export class StatusBarComponent implements OnInit {

	highlightStatus = false;

	oscEnabled = Environment.oscEnabled;

	constructor (
		public statusService: StatusBarService
	) {
	}

	get timePassed () {
		return Time.seconds;
	}

	ngOnInit (): void {

		StatusBarService.messageChanged.subscribe( ( message: string ) => {

			this.onMessageChanged( message );

		} );

	}

	onMessageChanged ( message: string ) {

		this.highlightStatus = true;

		setTimeout( () => {

			this.highlightStatus = false;

		}, 1000 );  // remove the highlight

	}


}
