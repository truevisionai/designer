/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionType, CoordinateSystem, RelativeDistanceType, RoutingAlgorithm, Rule, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * The current relative distance of a triggering entity/entities to
 * a reference entity is compared to a given value. The logical
 * operator used for comparison is defined in the rule attribute.
 */
export class RelativeDistanceCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_RelativeDistance;
	public label: string = 'RelativeDistanceCondition';

	/**
	 *
	 * @param targetEntity Reference entity.
	 * @param distance The distance value. Unit: m; Range: [0..inf]
	 * @param distanceType Alternative ways in which to calculate the distance
	 * @param freespace True: distance is measured between closest bounding box points.
	 * 					False: reference point distance is used.
	 * @param rule The operator (less, greater, equal).
	 * @param coordinateSystem
	 * @param routingAlgorithm
	 */
	constructor (
		public targetEntity: string,
		public distance: number = 0,
		public distanceType: RelativeDistanceType = RelativeDistanceType.longitudinal,
		public freespace: boolean = false,
		public rule: Rule = Rule.greater_than,
		public coordinateSystem = CoordinateSystem.entity,
		public routingAlgorithm = RoutingAlgorithm.undefined
	) {
		super();
	}

	hasPassed (): boolean {

		const passed = this.triggeringEntities.map( entityName => {

			const distance = this.calculateRelativeDistance( entityName );

			return ConditionUtils.hasRulePassed( this.rule, distance, this.distance );

		} );

		if ( this.triggeringRule === TriggeringRule.Any ) {

			return passed.some( p => p );

		} else if ( this.triggeringRule === TriggeringRule.All ) {

			return passed.every( p => p );

		} else {

			return false;

		}

	}

	private calculateRelativeDistance ( entityName: string ): number {

		const entity = this.getEntity( entityName );
		const targetEntity = this.getEntity( this.targetEntity );

		if ( this.distanceType === RelativeDistanceType.longitudinal ) {// The difference between the x-coordinates of the entity and target entity.
			return entity.getCurrentPosition().x - targetEntity.getCurrentPosition().x;
		} else if ( this.distanceType === RelativeDistanceType.lateral ) {// The difference between the y-coordinates of the entity and target entity.
			return entity.getCurrentPosition().y - targetEntity.getCurrentPosition().y;
		} else if ( this.distanceType === RelativeDistanceType.cartesianDistance ) {// Euclidean distance between the positions of the entity and the target entity.
			return entity.getCurrentPosition().distanceTo( targetEntity.getCurrentPosition() );
		} else if ( this.distanceType === RelativeDistanceType.euclidianDistance ) {
		}


	}
}
