/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionType, Rule } from '../tv-enums';
import { AbstractPosition } from '../tv-interfaces';
import { AbstractByEntityCondition } from './abstract-by-entity-condition';

/**
 *
 * @param position
 * @param value
 * @param freespace It determines whether the entities bounding box
 * shall be taken into consideration (freeSpace = true), or shall
 * not be taken into consideration (freeSpace = false).
 * @param alongRoute
 * @param rule
 */
export class DistanceCondition extends AbstractByEntityCondition {

	public readonly conditionType = ConditionType.ByEntity_Distance;

	constructor (
		public position?: AbstractPosition,
		public value?: number,
		public freespace?: boolean,
		public alongRoute?: boolean,
		public rule?: Rule
	) {
		super();
	}

	hasPassed (): boolean {

		// TODO: check and confirm this
		// if ( this.passed ) return true;

		const distanceValues = this.triggeringEntities.map(
			entityName => this.calculateDistance( entityName, this.position, this.freespace )
		);

		return this.isTriggerRulePassing( distanceValues, this.rule, this.value );
	}


	// hasPassed (): boolean {
	//
	// 	if ( this.passed ) {
	//
	// 		return true;
	//
	// 	} else {
	//
	// 		const otherPosition = this.position.toVector3();
	//
	// 		for ( const entityName of this.entities ) {
	//
	// 			const entity = TvScenarioInstance.openScenario.findEntityOrFail( entityName );
	//
	// 			const distance = entity.position.distanceTo( otherPosition );
	//
	// 			// console.log( 'distance-to-entity', distance );
	//
	// 			const passed = ConditionService.hasRulePassed( this.rule, distance, this.value );
	//
	// 			// exit if any of the entity distance is passed
	// 			if ( passed && this.triggeringRule === TriggeringRule.Any ) {
	//
	// 				this.passed = true;
	//
	// 				break;
	// 			}
	//
	// 			// exit if any of the entity distance is not passed
	// 			if ( !passed && this.triggeringRule === TriggeringRule.All ) {
	//
	// 				this.passed = false;
	//
	// 				break;
	//
	// 			}
	//
	// 		}
	//
	// 		return this.passed;
	//
	// 	}
	//
	// }

}
