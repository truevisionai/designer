/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../core/time';
import { ScenarioEntity } from '../entities/scenario-entity';
import { PrivateAction } from '../private-action';
import { ActionType, DynamicsShape } from '../tv-enums';
import { Target } from './target';
import { AbsoluteTarget } from './tv-absolute-target';
import { RelativeTarget } from './tv-relative-target';

/**
 * This action describes a continuously kept lane offset of an entity and
 * its initial transition to the new lane offset. The lane offset may be
 * given in absolute or relative terms. The dynamics are specified by
 * providing the maxLateralAcc used to keep the lane offset. Lane offset
 * keeping starts immediately at start of the action and ends after the
 * given duration. Different shapes can be used for the initial transition.
 * Step defines an immediate transition, i.e. a jump from the current lane
 * offset to the target lane offset. Usage of time and distance does not
 * make any sense in combination with step; linear will result in a linear
 * movement between the start and target lane offset; cubic and sinusoidal
 * will result in smooth transitions (basically s-shaped) between start and
 * end state. A smooth transition is only given with cubic and sinusoidal shape.
 */
export class LaneOffsetAction extends PrivateAction {

	public label = 'LaneOffsetAction';
	public actionType: ActionType = ActionType.Private_LaneOffset;

	private startTime: number;
	private targetOffset: number;

	/**
	 *
	 * @param continous If false, the action ends when the target lane is reached.
	 * 					If true it does not end but has to be stopped.
	 * @param maxLateralAcc Maximum lateral acceleration used to initially reach
	 * 						and afterwards keep the lane offset. Unit: m/s2; Range: [0..inf[.
	 * @param dynamicsShape	Geometrical shape of the LaneOffsetAction's dynamics.
	 * @param target Parameters indicating if the lane offset is defined relative
	 * 				 to another entity or absolute to the current lane's center line.
	 */
	constructor (
		public continous: boolean,
		public maxLateralAcc: number,
		public dynamicsShape: DynamicsShape,
		public target: Target
	) {

		super();

	}

	reset (): void {

		super.reset();

		this.startTime = undefined;
		this.targetOffset = undefined;

	}

	execute ( entity: ScenarioEntity ): void {

		if ( !this.startTime ) this.startTime = Time.time;

		if ( !this.targetOffset ) {

			if ( this.target instanceof RelativeTarget ) {

				this.targetOffset = this.target.value + this.target.entityRef.entity.getCurrentLaneOffset();

			} else if ( this.target instanceof AbsoluteTarget ) {

				this.targetOffset = this.target.value;

			}
		}

		let newLaneOffset;

		// This function should return the elapsed time since the start of the action
		const elapsedTime = ( Time.time - this.startTime ) * 0.001;

		function calculateLaneOffset ( entity: any, targetOffset: any, elapsedTime: any, maxLateralAcc: any ): any {
			let currentOffset = entity.getCurrentLaneOffset();
			let L = targetOffset - currentOffset;
			let dynamicsTime = Math.sqrt( L * Math.PI ** 2 / maxLateralAcc );
			let fraction = elapsedTime / dynamicsTime;
			let newLaneOffset = currentOffset + L * Math.sin( Math.PI * fraction );
			return newLaneOffset;
		}

		switch ( this.dynamicsShape ) {
			case DynamicsShape.step:
				newLaneOffset = this.targetOffset;
				break;
			case DynamicsShape.linear:
				newLaneOffset = entity.getCurrentLaneOffset() + this.maxLateralAcc;
				break;
			case DynamicsShape.sinusoidal:
				// For sinusoidal dynamics, we need to calculate the value of a sinusoidal function at the point `elapsedTime`
				newLaneOffset = calculateLaneOffset( entity, this.targetOffset, elapsedTime, this.maxLateralAcc );
				break;
			case DynamicsShape.cubic:
				// For cubic dynamics, we need to calculate the value of a cubic function at the point `elapsedTime`
				// newLaneOffset = entity.getCurrentLaneOffset() + this.maxLateralAcc * Math.pow( elapsedTime, 3 );
				var L = this.targetOffset;
				var T = Math.sqrt( ( 2 * this.targetOffset ) / this.maxLateralAcc );
				var t = elapsedTime;
				if ( t > T ) {
					t = T;
				}
				newLaneOffset = entity.getCurrentLaneOffset() + 2 * ( L / Math.pow( T, 3 ) ) * Math.pow( t, 3 ) - 3 * ( L / Math.pow( T, 2 ) ) * Math.pow( t, 2 ) + L;
				break;
		}

		entity.setLaneOffset( newLaneOffset );

		// if its a continous action, we don't want to end it
		if ( this.continous ) return;

		if ( newLaneOffset >= this.targetOffset ) {

			this.actionCompleted();

		}
	}

}
