/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { ConditionType, TriggeringRule } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { AbstractByEntityCondition } from './osc-condition';

export class ReachPositionCondition extends AbstractByEntityCondition {

	conditionType = ConditionType.ByEntity_ReachPosition;

	constructor ( public position?: AbstractPosition, public tolerance: number = 0 ) {
		super();
	}

	hasPassed (): boolean {

		if ( this.position == null ) throw new Error( 'Position value can not be null' );

		if ( this.passed ) return true;

		const targetPosition = this.position.toVector3();

		for ( const entityName of this.entities ) {

			const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );

			const distanceFromTarget = entity.position.distanceTo( targetPosition );

			const hasReachedTarget = distanceFromTarget <= this.tolerance;

			// exit if any of the distance tolerance is passed
			if ( hasReachedTarget && this.triggeringRule === TriggeringRule.Any ) {

				this.passed = true;

				break;
			}

			// exit if any of the distance distance is not passed
			if ( !hasReachedTarget && this.triggeringRule === TriggeringRule.All ) {

				this.passed = false;

				break;

			}

		}

	}

}
