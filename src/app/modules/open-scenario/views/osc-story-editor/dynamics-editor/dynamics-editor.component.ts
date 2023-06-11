import { Component, OnInit, Input } from '@angular/core';
import { OscLaneChangeDynamics, OscSpeedDynamics } from '../../../models/actions/osc-private-action';
import { OscDynamicsShape } from 'app/modules/open-scenario/models/osc-enums';

@Component( {
	selector: 'app-dynamics-editor',
	templateUrl: './dynamics-editor.component.html',
	styleUrls: [ './dynamics-editor.component.css' ]
} )
export class DynamicsEditorComponent {

	@Input() dynamics: OscLaneChangeDynamics | OscSpeedDynamics;

	onShapeChanged ( $event: string ) {

		this.dynamics.shape = OscDynamicsShape[ $event ];

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
