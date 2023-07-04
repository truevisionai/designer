/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AccelerationCondition } from '../models/conditions/tv-acceleration-condition';
import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { EndOfRoadCondition } from '../models/conditions/tv-end-of-road-condition';
import { OffRoadCondition } from '../models/conditions/tv-off-road-condition';
import { ReachPositionCondition } from '../models/conditions/tv-reach-position-condition';
import { RelativeDistanceCondition } from '../models/conditions/tv-relative-distance-condition';
import { RelativeSpeedCondition } from '../models/conditions/tv-relative-speed-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { SpeedCondition } from '../models/conditions/tv-speed-condition';
import { TimeHeadwayCondition } from '../models/conditions/tv-time-headway-condition';
import { TraveledDistanceCondition } from '../models/conditions/tv-traveled-distance-condition';
import { WorldPosition } from '../models/positions/tv-world-position';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { ConditionType, RelativeDistanceType, Rule, TriggeringRule } from '../models/tv-enums';

export class ConditionFactory {

	public static createCondition ( type: ConditionType, entity?: ScenarioEntity ) {

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

			case ConditionType.ByEntity_RelativeSpeed:
				return this.createRelativeSpeedCondition( entity );

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

	private static createDistanceCondition ( entity?: ScenarioEntity ) {

		const position = new WorldPosition();

		return new DistanceCondition( position, 10, false, false, Rule.greater_than );

	}

	private static createReachedPositionCondition ( entity?: ScenarioEntity ) {

		const position = new WorldPosition();

		const condition = new ReachPositionCondition( position, 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createTimeHeadwayCondition ( entity?: ScenarioEntity ) {

		const condition = new TimeHeadwayCondition( null, 5, false, false, Rule.greater_than );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;


	}

	private static createTraveledDistanceCondition ( entity?: ScenarioEntity ) {

		const condition = new TraveledDistanceCondition( 100, TriggeringRule.Any );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createSpeedCondition ( entity?: ScenarioEntity ) {

		const condition = new SpeedCondition( 40, Rule.greater_than );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createOffRoadCondition ( entity?: ScenarioEntity ) {

		const condition = new OffRoadCondition( 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createEndOfRoadCondition ( entity?: ScenarioEntity ) {

		const condition = new EndOfRoadCondition( 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createRelativeDistanceCondition ( entity?: ScenarioEntity ) {

		const condition = new RelativeDistanceCondition(
			entity?.name, 10, RelativeDistanceType.cartesianDistance,
			false, Rule.less_than
		);

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createAccelerationCondition ( entity?: ScenarioEntity ) {

		const condition = new AccelerationCondition( 1.0, Rule.greater_than );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createRelativeSpeedCondition ( entity?: ScenarioEntity ) {

		const condition = new RelativeSpeedCondition( entity?.name, 10, Rule.greater_than );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}
}
