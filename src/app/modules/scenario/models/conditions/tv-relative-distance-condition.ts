/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionType, Rule, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

export enum RelativeDistanceType {
	longitudinal,
	lateral,
	cartesianDistance,
}

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
	 * @param rule The operator (less, greater, equal). See {@link Rule}
	 */
	constructor (
		public targetEntity: string,
		public distance: number = 0,
		public distanceType: RelativeDistanceType = RelativeDistanceType.cartesianDistance,
		public freespace: boolean = false,
		public rule: Rule = Rule.greater_than
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

		switch ( this.distanceType ) {

			case RelativeDistanceType.longitudinal:
				throw new Error( 'Not implemented' );
				break;

			case RelativeDistanceType.lateral:
				throw new Error( 'Not implemented' );
				break;

			case RelativeDistanceType.cartesianDistance:
				return entity.getCurrentPosition().distanceTo( targetEntity.getCurrentPosition() );
				break;

		}

	}
}
