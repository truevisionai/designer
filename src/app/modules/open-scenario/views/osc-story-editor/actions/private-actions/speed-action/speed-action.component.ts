/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { OscSpeedAction } from '../../../../../models/actions/osc-speed-action';

@Component( {
	selector: 'app-speed-action',
	templateUrl: './speed-action.component.html',
	styleUrls: [ './speed-action.component.css' ]
} )
export class SpeedActionComponent implements OnInit, IComponent, OnDestroy {

	data: OscSpeedAction;

	@Input() action: OscSpeedAction;

	constructor () {
	}

	ngOnInit () {

		if ( this.data != null && this.action == null ) {

			this.action = this.data;

		}
	}

	ngOnDestroy (): void {

	}

}
