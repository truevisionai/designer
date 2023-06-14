/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from 'app/utils/maths';
import { Time } from '../../../../core/time';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

/**
 * Logical expression in condition becomes true if the
 * triggering entity/entities stands still for a
 * given amount of time.
 */
export class StandStillCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_StandStill;

	private standstillDurations = [];

	/**
	 *
	 * @param duration Duration time of still standing to let the logical expression
	 * 				   become true. Unit: seconds. Range [0..inf[.
	 */
	constructor ( public duration: number ) {
		super();
	}

	hasPassed (): boolean {

		// Check if the condition has already passed
		if ( this.passed ) return true;

		const entityStandstillStatuses = this.triggeringEntities.map( ( entityName ) => {

			// Get the current speed of the entity from some external source
			const entitySpeed = this.getEntitySpeed( entityName );

			// Check if the entity speed is close enough to zero
			const isStandingStill = Maths.approxEquals( entitySpeed, 0, 0.001 );

			if ( !( entityName in this.standstillDurations ) || !isStandingStill ) {
				// If the entity is not standing still, reset the standstill duration
				this.standstillDurations[ entityName ] = 0;
			}

			if ( !isStandingStill ) {
				return false;
			}

			// If the entity is standing still, increment the standstill duration
			this.standstillDurations[ entityName ] += Time.fixedDeltaTime;

			// Check if the entity has been standing still for long enough
			return this.standstillDurations[ entityName ] >= ( this.duration * 1000 );
		} );

		// Check if condition is satisfied based on the triggering rule
		switch ( this.triggeringRule ) {

			case TriggeringRule.Any:
				this.passed = entityStandstillStatuses.some( ( status ) => status );
				break;

			case TriggeringRule.All:
				this.passed = entityStandstillStatuses.every( ( status ) => status );
				break;

			default:
				this.passed = false;

		}

		// Reset the standstill durations if the condition has passed
		if ( this.passed ) this.standstillDurations = [];

		return this.passed;
	}

}
