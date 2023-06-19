/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { PrivateAction } from '../../../models/private-action';
import { SpeedAction } from '../../../models/actions/tv-speed-action';
import { Target } from 'app/modules/scenario/models/actions/target';

@Component( {
	selector: 'app-speed-action',
	templateUrl: './speed-action.component.html',
	styleUrls: [ './speed-action.component.css' ]
} )
export class SpeedActionComponent implements OnInit, IComponent {

	data: SpeedAction;

	@Input() action: PrivateAction;

	get speedAction () {
		return this.action as SpeedAction;
	}

	ngOnInit () {

		if ( this.data != null && this.action == null ) {

			this.action = this.data;

		}
	}

	onTargetChanged ( value: Target ) {

		this.speedAction.target = value;

	}

}
