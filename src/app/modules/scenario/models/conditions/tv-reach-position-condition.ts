/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from '../position';
import { ConditionType, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * Checks if a triggering entity/entities has reached a
 * given position, within some user specified tolerance.
 */
export class ReachPositionCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_ReachPosition;
	public name: string = 'ReachPositionCondition';

	constructor ( public position: Position, public tolerance: number = 0 ) {

		super();

	}

	hasPassed (): boolean {

		const isPositionReached: boolean[] = this.triggeringEntities.map( entityName => {

			const entityPosition = this.getEntityPosition( entityName );

			const distance = entityPosition.distanceTo( this.position.toVector3() );

			return distance <= this.tolerance;

		} );

		switch ( this.triggeringRule ) {

			case TriggeringRule.Any:
				return isPositionReached.some( passed => passed === true );

			case TriggeringRule.All:
				return isPositionReached.every( passed => passed === true );

			default:
				return false;
		}
	}


	// hasPassed (): boolean {
	//
	// 	if ( this.position == null ) throw new Error( 'Position value can not be null' );
	//
	// 	if ( this.passed ) return true;
	//
	// 	const targetPosition = this.position.toVector3();
	//
	// 	for ( const entityName of this.entities ) {
	//
	// 		const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );
	//
	// 		const distanceFromTarget = entity.position.distanceTo( targetPosition );
	//
	// 		const hasReachedTarget = distanceFromTarget <= this.tolerance;
	//
	// 		// exit if any of the distance tolerance is passed
	// 		if ( hasReachedTarget && this.triggeringRule === TriggeringRule.Any ) {
	//
	// 			this.passed = true;
	//
	// 			break;
	// 		}
	//
	// 		// exit if any of the distance distance is not passed
	// 		if ( !hasReachedTarget && this.triggeringRule === TriggeringRule.All ) {
	//
	// 			this.passed = false;
	//
	// 			break;
	//
	// 		}
	//
	// 	}
	//
	// }

}
