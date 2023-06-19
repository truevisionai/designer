/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PrivateAction } from '../../../models/private-action';
import { LaneChangeAction } from '../../../models/actions/tv-lane-change-action';
import { AbstractTarget } from 'app/modules/scenario/models/actions/abstract-target';

@Component( {
	selector: 'app-lane-change',
	templateUrl: './lane-change.component.html',
	styleUrls: [ './lane-change.component.css' ]
} )
export class LaneChangeComponent implements OnInit {

	@Input() action: PrivateAction;

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

	onTargetChanged ( $target: AbstractTarget ) {

		this.laneChangeAction.setTarget( $target );

	}

}
