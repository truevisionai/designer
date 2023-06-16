/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AccelerationCondition } from '../models/conditions/tv-acceleration-condition';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { EndOfRoadCondition } from '../models/conditions/tv-end-of-road-condition';
import { OffRoadCondition } from '../models/conditions/tv-off-road-condition';
import { ReachPositionCondition } from '../models/conditions/tv-reach-position-condition';
import { RelativeDistanceCondition, RelativeDistanceType } from '../models/conditions/tv-relative-distance-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { SpeedCondition } from '../models/conditions/tv-speed-condition';
import { TimeHeadwayCondition } from '../models/conditions/tv-time-headway-condition';
import { TraveledDistanceCondition } from '../models/conditions/tv-traveled-distance-condition';
import { WorldPosition } from '../models/positions/tv-world-position';
import { EntityObject } from '../models/tv-entities';
import { ConditionType, Rule, TriggeringRule } from '../models/tv-enums';

export class ConditionFactory {

	public static createCondition ( type: ConditionType, entity?: EntityObject ) {

		switch ( type ) {

			case ConditionType.ByValue_SimulationTime:
				return this.createSimulationTimeCondition();

			case ConditionType.ByEntity_Distance:
				return this.createDistanceCondition( entity );

			case ConditionType.ByEntity_ReachPosition:
				return this.createReachedPositionCondition( entity );

			case ConditionType.ByEntity_TimeHeadway:
				return this.createTimeHeadwayCondition( entity );

			case ConditionType.ByEntity_TraveledDistance:
				return this.createTraveledDistanceCondition( entity );

			case ConditionType.ByEntity_Speed:
				return this.createSpeedCondition( entity );

			case ConditionType.ByEntity_Offroad:
				return this.createOffRoadCondition( entity );

			case ConditionType.ByEntity_EndOfRoad:
				return this.createEndOfRoadCondition( entity );

			case ConditionType.ByEntity_RelativeDistance:
				return this.createRelativeDistanceCondition( entity );

			case ConditionType.ByEntity_Acceleration:
				return this.createAccelerationCondition( entity );

			default:
				throw new Error( `Unsupported condition: ${ type }` );

		}


	}


	private static createSimulationTimeCondition () {

		return new SimulationTimeCondition(
			0,
			Rule.greater_than
		);

	}

	private static createDistanceCondition ( entity?: EntityObject ) {

		const position = new WorldPosition( 0, 0, 0 );

		return new DistanceCondition( position, 10, false, false, Rule.greater_than );

	}

	private static createReachedPositionCondition ( entity?: EntityObject ) {

		const position = new WorldPosition( 0, 0, 0 );

		const condition = new ReachPositionCondition( position, 5 );

		if ( entity ) condition.addEntity( entity.name );

		return condition;
	}

	private static createTimeHeadwayCondition ( entity?: EntityObject ) {

		const condition = new TimeHeadwayCondition(
			null,
			5,
			false,
			false,
			Rule.greater_than
		);

		if ( entity ) condition.addEntity( entity.name );

		return condition;


	}

	private static createTraveledDistanceCondition ( entity?: EntityObject ) {

		const condition = new TraveledDistanceCondition( 100, TriggeringRule.Any );

		if ( entity ) condition.addEntity( entity.name );

		return condition;
	}

	private static createSpeedCondition ( entity?: EntityObject ) {

		const condition = new SpeedCondition( 40, Rule.greater_than );

		if ( entity ) condition.addEntity( entity.name );

		return condition;

	}

	private static createOffRoadCondition ( entity?: EntityObject ) {

		const condition = new OffRoadCondition( 5 );

		if ( entity ) condition.addEntity( entity.name );

		return condition;

	}

	private static createEndOfRoadCondition ( entity?: EntityObject ) {

		const condition = new EndOfRoadCondition( 5 );

		if ( entity ) condition.addEntity( entity.name );

		return condition;

	}

	private static createRelativeDistanceCondition ( entity?: EntityObject ) {

		const condition = new RelativeDistanceCondition(
			entity?.name, 10, RelativeDistanceType.cartesianDistance,
			false, Rule.less_than
		);

		if ( entity ) condition.addEntity( entity.name );

		return condition;

	}

	private static createAccelerationCondition ( entity?: EntityObject ) {

		const condition = new AccelerationCondition( 1.0, Rule.greater_than );

		if ( entity ) condition.addEntity( entity.name );

		return condition;
	}
}
