/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'app/core/maths';
import { AccelerationCondition } from '../models/conditions/tv-acceleration-condition';
import { Condition } from '../models/conditions/tv-condition';
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
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { WorldPosition } from '../models/positions/tv-world-position';
import { ConditionType, RelativeDistanceType, Rule, TriggeringRule } from '../models/tv-enums';

export class ConditionFactory {
	static reset (): void {
		// throw new Error( 'Method not implemented.' );
	}

	public static createCondition ( type: ConditionType, entity?: ScenarioEntity ): Condition {

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


	private static createSimulationTimeCondition (): SimulationTimeCondition {

		return new SimulationTimeCondition(
			0,
			Rule.GreaterThan
		);

	}

	private static createDistanceCondition ( entity?: ScenarioEntity ): DistanceCondition {

		const position = new WorldPosition( entity?.position.clone() || new Vector3() );

		return new DistanceCondition( position, 10, false, false, Rule.GreaterThan );

	}

	private static createReachedPositionCondition ( entity?: ScenarioEntity ): ReachPositionCondition {

		const position = new WorldPosition( entity?.position.clone() || new Vector3() );

		const condition = new ReachPositionCondition( position, 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createTimeHeadwayCondition ( entity?: ScenarioEntity ): TimeHeadwayCondition {

		const condition = new TimeHeadwayCondition( null, 5, false, false, Rule.GreaterThan );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;


	}

	private static createTraveledDistanceCondition ( entity?: ScenarioEntity ): TraveledDistanceCondition {

		const condition = new TraveledDistanceCondition( 100, TriggeringRule.Any );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createSpeedCondition ( entity?: ScenarioEntity ): SpeedCondition {

		const condition = new SpeedCondition( 40, Rule.GreaterThan );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createOffRoadCondition ( entity?: ScenarioEntity ): OffRoadCondition {

		const condition = new OffRoadCondition( 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createEndOfRoadCondition ( entity?: ScenarioEntity ): EndOfRoadCondition {

		const condition = new EndOfRoadCondition( 5 );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createRelativeDistanceCondition ( entity?: ScenarioEntity ): RelativeDistanceCondition {

		const condition = new RelativeDistanceCondition(
			entity?.name, 10, RelativeDistanceType.cartesianDistance,
			false, Rule.LessThan
		);

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;

	}

	private static createAccelerationCondition ( entity?: ScenarioEntity ): AccelerationCondition {

		const condition = new AccelerationCondition( 1.0, Rule.GreaterThan );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}

	private static createRelativeSpeedCondition ( entity?: ScenarioEntity ): RelativeSpeedCondition {

		const condition = new RelativeSpeedCondition( entity?.name, 10, Rule.GreaterThan );

		if ( entity ) condition.addTriggeringEntity( entity.name );

		return condition;
	}
}
