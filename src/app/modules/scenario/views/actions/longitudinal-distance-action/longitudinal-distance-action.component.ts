import { Component, Input } from '@angular/core';
import { AbstractAction } from 'app/modules/scenario/models/abstract-action';
import { LongitudinalDistanceAction } from 'app/modules/scenario/models/actions/tv-longitudinal-distance-action';

@Component( {
	selector: 'app-longitudinal-distance-action',
	templateUrl: './longitudinal-distance-action.component.html',
	styleUrls: [ './longitudinal-distance-action.component.scss' ]
} )
export class LongitudinalDistanceActionComponent {

	@Input() action: AbstractAction;

	get longitudinalDistanceAction () {
		return this.action as LongitudinalDistanceAction;
	}

	onValueChanged ( $event: number ) {
		this.longitudinalDistanceAction.value = $event;
	}

	onTargetChanged ( $event: string ) {
		this.longitudinalDistanceAction.targetEntity = $event;
	}

	onValueTypeChanged ( $event ) {
		this.longitudinalDistanceAction.valueType = $event;
	}

	onMaxAccelChanged ( $event: any ) {
		this.longitudinalDistanceAction.dynamicConstraints.maxAcceleration = $event;
	}

	onMaxDecelChanged ( $event: any ) {
		this.longitudinalDistanceAction.dynamicConstraints.maxDeceleration = $event;
	}

	onMaxSpeedChanged ( $event: any ) {
		this.longitudinalDistanceAction.dynamicConstraints.maxSpeed = $event;
	}
}
