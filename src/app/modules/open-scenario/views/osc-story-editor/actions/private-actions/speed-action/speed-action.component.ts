/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { SpeedAction } from '../../../../../models/actions/osc-speed-action';
import { AbstractPrivateAction } from '../../../../../models/osc-interfaces';

@Component( {
	selector: 'app-speed-action',
	templateUrl: './speed-action.component.html',
	styleUrls: [ './speed-action.component.css' ]
} )
export class SpeedActionComponent implements OnInit, IComponent, OnDestroy {

	data: SpeedAction;

	@Input() action: AbstractPrivateAction;

	constructor () {
	}

	get speedAction () {
		return this.action as SpeedAction;
	}

	get target () {
		return this.speedAction.target;
	}

	get dynamics () {
		return this.speedAction.dynamics;
	}

	ngOnInit () {

		if ( this.data != null && this.action == null ) {

			this.action = this.data;

		}
	}

	ngOnDestroy (): void {

	}

}
