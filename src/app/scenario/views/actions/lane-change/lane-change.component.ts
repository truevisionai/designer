/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Target } from 'app/scenario/models/actions/target';
import { LaneChangeAction } from '../../../models/actions/tv-lane-change-action';
import { PrivateAction } from '../../../models/private-action';

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

	ngOnInit (): void {

	}

	onTargetChanged ( $target: Target ): void {

		this.laneChangeAction.setTarget( $target );

	}

}
