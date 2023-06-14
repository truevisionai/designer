/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractPrivateAction } from '../../../models/abstract-private-action';
import { LaneChangeAction } from '../../../models/actions/tv-lane-change-action';

@Component( {
	selector: 'app-lane-change',
	templateUrl: './lane-change.component.html',
	styleUrls: [ './lane-change.component.css' ]
} )
export class LaneChangeComponent implements OnInit {

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
