/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { DynamicsShape } from 'app/modules/scenario/models/tv-enums';
import { LaneChangeDynamics, SpeedDynamics } from '../../models/actions/tv-private-action';

@Component( {
	selector: 'app-dynamics-editor',
	templateUrl: './dynamics-editor.component.html',
	styleUrls: [ './dynamics-editor.component.css' ]
} )
export class DynamicsEditorComponent {

	// TODO: fix or add support for speed dynamics
	@Input() dynamics: LaneChangeDynamics;

	onShapeChanged ( $event: string ) {

		this.dynamics.shape = DynamicsShape[ $event ];

	}

	onTimeChanged ( $event ) {

		this.dynamics.time = $event;

	}

	onDistanceChanged ( $event ) {

		this.dynamics.distance = $event;

	}

	onRateChanged ( $event ) {

		this.dynamics.rate = $event;

	}

}
