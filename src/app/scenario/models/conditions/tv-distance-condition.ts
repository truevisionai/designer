/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Debug } from 'app/core/utils/debug';
import { Position } from '../position';
import { ConditionType, CoordinateSystem, RelativeDistanceType, RoutingAlgorithm, Rule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * The current distance between an entity and a reference entity is
 * compared to a given distance (less, greater, equal). Several
 * additional parameters like free space etc. can be defined.
 */
export class DistanceCondition extends EntityCondition {

	public readonly conditionType = ConditionType.ByEntity_Distance;
	public label: string = 'DistanceCondition';

	private debug = false;

	/**
	 *
	 * @param position
	 * @param value
	 * @param freespace It determines whether the entities bounding box
	 * shall be taken into consideration (freeSpace = true), or shall
	 * not be taken into consideration (freeSpace = false).
	 * @param alongRoute
	 * @param rule
	 * @param coordinateSystem
	 * @param relativeDistanceType
	 * @param routingAlgorithm
	 * */
	constructor (
		public position?: Position,
		public value?: number,
		public freespace?: boolean,
		public alongRoute?: boolean,
		public rule?: Rule,
		public coordinateSystem = CoordinateSystem.entity,
		public relativeDistanceType = RelativeDistanceType.cartesianDistance,
		public routingAlgorithm = RoutingAlgorithm.undefined
	) {
		super();
	}

	hasPassed (): boolean {

		// TODO: check and confirm this
		// if ( this.passed ) return true;

		const distanceValues = this.triggeringEntities.map(
			entityName => this.calculateDistance( entityName, this.position, this.freespace )
		);

		// if ( this.debug ) Debug.log( 'distanceValues', distanceValues, this.rule, this.value );

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
	// 			// Debug.log( 'distance-to-entity', distance );
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
