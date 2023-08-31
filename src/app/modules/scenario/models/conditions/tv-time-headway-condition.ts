/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from '../../../../core/utils/console';
import { ConditionUtils } from '../../builders/condition-utils';
import { ConditionType, CoordinateSystem, RelativeDistanceType, RoutingAlgorithm, Rule, TriggeringRule } from '../tv-enums';
import { EntityCondition } from './entity-condition';

/**
 * Condition based on the headway time between a triggering entity/entities
 * and a reference entity. The logical operator used for comparison
 * is defined by the rule attribute.
 */
export class TimeHeadwayCondition extends EntityCondition {

	conditionType = ConditionType.ByEntity_TimeHeadway;
	public label: string = 'TimeHeadwayCondition';

	/**
	 * @param entityRef reference entity to which the time headway is computed
	 * @param value The time headway value. Unit: s; Range: [0..inf[.
	 * @param freespace True: time headway is measured using the distance between closest bounding box points.
	 * 					False: reference point distance is used.
	 * @param alongRoute True: routing is taken into account, e.g. turns will increase distance.
	 * 					False: straight line distance is used.
	 * @param rule The operator (less, greater, equal).
	 * @param coordinateSystem
	 * @param relativeDistanceType
	 * @param routingAlgorithm
	 */
	constructor (
		public entityRef: string,
		public value: number,
		public freespace: boolean,
		public alongRoute: boolean,
		public rule: Rule,
		public coordinateSystem: CoordinateSystem = null,
		public relativeDistanceType: RelativeDistanceType = RelativeDistanceType.cartesianDistance,
		public routingAlgorithm: RoutingAlgorithm = RoutingAlgorithm.undefined
	) {
		super();
	}

	hasPassed (): boolean {

		const isTimeHeadwaySatisfied = this.triggeringEntities.map( entityName => {

			const timeHeadway = this.computeTimeHeadway( entityName );

			// Check the time headway against the desired value based on the rule
			return ConditionUtils.hasRulePassed( this.rule, timeHeadway, this.value );

		} );

		// Check if condition is satisfied based on the triggering rule
		switch ( this.triggeringRule ) {

			case TriggeringRule.Any:
				// If any entity satisfies the condition, return true
				return this.passed = isTimeHeadwaySatisfied.some( condition => condition );

			case TriggeringRule.All:
				// If all entities satisfy the condition, return true
				return this.passed = isTimeHeadwaySatisfied.every( condition => condition );

			default:
				return false;
		}

	}

	setTargetEntity ( $targetEntity: string ) {

		this.entityRef = $targetEntity;

	}

	setRule ( rule: Rule ) {

		this.rule = rule;

	}

	private computeTimeHeadway ( entityName: string ): number {

		const entitySpeed = this.getEntitySpeed( entityName );
		const entityPosition = this.getEntityPosition( entityName );

		const targetEntitySpeed = this.getEntitySpeed( this.entityRef );
		const targetEntityPosition = this.getEntityPosition( this.entityRef );

		let distance: number;

		if ( !this.freespace ) {

			// Calculate the distance between the two entities
			distance = targetEntityPosition.distanceTo( entityPosition );

		} else {

			// TODO: Temporary implementation needs to be changed
			distance = targetEntityPosition.distanceTo( entityPosition );

			TvConsole.warn( 'Freespace For TimeHeadwayCondition Not Implemented' );

		}

		// Calculate the current time headway
		let headwayTime: number;

		if ( entitySpeed <= targetEntitySpeed ) {
			// If the entity is slower than or has the same speed as the target,
			// return a predefined constant indicating an invalid condition, such as Infinity.
			headwayTime = Infinity;
		} else {
			// Only calculate the time headway if the entity is faster than the target.
			headwayTime = distance / ( entitySpeed - targetEntitySpeed );
		}

		return headwayTime;
	}
}
