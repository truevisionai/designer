/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { StatusBarService } from 'app/services/status-bar.service';

@Component( {
	selector: 'app-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: [ './status-bar.component.css' ]
} )
export class StatusBarComponent {

	constructor ( public statusService: StatusBarService ) { }

}
