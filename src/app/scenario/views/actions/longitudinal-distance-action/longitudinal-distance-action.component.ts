/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { LongitudinalDistanceAction } from 'app/scenario/models/actions/tv-longitudinal-distance-action';
import { TvAction } from 'app/scenario/models/tv-action';

@Component( {
	selector: 'app-longitudinal-distance-action',
	templateUrl: './longitudinal-distance-action.component.html',
	styleUrls: [ './longitudinal-distance-action.component.scss' ]
} )
export class LongitudinalDistanceActionComponent {

	@Input() action: TvAction;

	get longitudinalDistanceAction () {
		return this.action as LongitudinalDistanceAction;
	}

	onValueChanged ( $event: number ): void {
		this.longitudinalDistanceAction.value = $event;
	}

	onTargetChanged ( $event: string ): void {
		this.longitudinalDistanceAction.targetEntity = $event;
	}

	onValueTypeChanged ( $event: any ): void {
		this.longitudinalDistanceAction.valueType = $event;
	}

	onMaxAccelChanged ( $event: any ): void {
		this.longitudinalDistanceAction.dynamicConstraints.maxAcceleration = $event;
	}

	onMaxDecelChanged ( $event: any ): void {
		this.longitudinalDistanceAction.dynamicConstraints.maxDeceleration = $event;
	}

	onMaxSpeedChanged ( $event: any ): void {
		this.longitudinalDistanceAction.dynamicConstraints.maxSpeed = $event;
	}

	onContinousChanged ( $event: any ): void {
		this.longitudinalDistanceAction.continous = $event;
	}

	onFreespaceChanged ( $event: any ): void {
		this.longitudinalDistanceAction.freespace = $event;
	}
}
