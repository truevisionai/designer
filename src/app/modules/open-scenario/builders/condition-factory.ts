/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DistanceCondition } from '../models/conditions/tv-distance-condition';
import { ReachPositionCondition } from '../models/conditions/tv-reach-position-condition';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { WorldPosition } from '../models/positions/tv-world-position';
import { EntityObject } from '../models/tv-entities';
import { ConditionType, Rule } from '../models/tv-enums';

export class ConditionFactory {

	public static createCondition ( type: ConditionType, entity?: EntityObject ) {

		switch ( type ) {

			case ConditionType.ByValue_SimulationTime:
				return this.createSimulationTimeCondition();

			case ConditionType.ByEntity_Distance:
				return this.createDistanceCondition( entity );

			case ConditionType.ByEntity_ReachPosition:
				return this.createReachedPositionCondition( entity );

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
}
