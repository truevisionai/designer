/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { LaneChangeAction } from '../../../models/actions/tv-lane-change-action';
import { AbstractPrivateAction } from '../../../models/tv-interfaces';

@Component( {
	selector: 'app-lane-change-action',
	templateUrl: './lane-change-action.component.html',
	styleUrls: [ './lane-change-action.component.css' ]
} )
export class LaneChangeActionComponent implements OnInit {

	@Input() action: AbstractPrivateAction;

	constructor () {
	}

	get laneChangeAction () {
		return this.action as LaneChangeAction;
	}

	get target () {
		return this.laneChangeAction.target;
	}

	get dynamics () {
		return this.laneChangeAction.dynamics;
	}

	ngOnInit () {

	}

}
