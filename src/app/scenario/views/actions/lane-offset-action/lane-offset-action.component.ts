/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { LaneOffsetAction } from 'app/scenario/models/actions/tv-lane-offset-action';
import { Target } from '../../../models/actions/target';
import { PrivateAction } from '../../../models/private-action';
import { DynamicsShape } from '../../../models/tv-enums';
import { Commands } from 'app/commands/commands';

@Component( {
	selector: 'app-lane-offset-action',
	templateUrl: './lane-offset-action.component.html',
	styleUrls: [ './lane-offset-action.component.scss' ]
} )
export class LaneOffsetActionComponent {

	@Input() action: PrivateAction;

	shapes = DynamicsShape;

	get laneOffsetAction () {

		return this.action as LaneOffsetAction;

	}

	onShapeChanged ( $event: DynamicsShape ) {

		Commands.SetValue( this.laneOffsetAction, 'dynamicsShape', $event );

	}

	onMaxAccelChanged ( $maxLateralAcc: number ) {

		Commands.SetValue( this.laneOffsetAction, 'maxLateralAcc', $maxLateralAcc );

	}

	onContinousChanged ( $event: boolean ) {

		this.laneOffsetAction.continous = $event;

	}

	onTargetChanged ( $event: Target ) {

		this.laneOffsetAction.target = $event;

	}
}
