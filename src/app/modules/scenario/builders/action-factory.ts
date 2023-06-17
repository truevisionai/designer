/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicConstraints } from '../models/dynamic-constraints';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { LaneOffsetAction } from '../models/actions/tv-lane-offset-action';
import { LongitudinalDistanceAction } from '../models/actions/tv-longitudinal-distance-action';
import { PositionAction } from '../models/actions/tv-position-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { WorldPosition } from '../models/positions/tv-world-position';
import { EntityObject } from '../models/tv-entities';
import { ActionType, DynamicsDimension, DynamicsShape } from '../models/tv-enums';

export class ActionFactory {

	public static createAction ( type: ActionType, entity?: EntityObject ) {

		switch ( type ) {

			case ActionType.Private_Position:
				return this.createPositionAction( entity );

			case ActionType.Private_Longitudinal_Speed:
				return this.createSpeedAction( entity );

			case ActionType.Private_LaneChange:
				return this.createLaneChangeAction( entity );

			case ActionType.Private_LaneOffset:
				return this.createChangeLaneOffsetAction( entity );

			case ActionType.Private_Longitudinal_Distance:
				return this.createLongitudinalDistanceAction( entity );

			default:
				throw new Error( `Unsupported private action: ${ type }` );

		}

	}

	static createChangeLaneOffsetAction ( entity?: EntityObject ) {

		// 3.2 lane width
		const target = entity ?
			new RelativeTarget( entity.name, 3.2 ) :
			new AbsoluteTarget( 3.2 );

		return new LaneOffsetAction( false, 0.01, DynamicsShape.linear, target );

	}

	private static createPositionAction ( entity?: EntityObject ): PositionAction {

		const position = entity.gameObject?.position;

		return new PositionAction( new WorldPosition(
			position?.x,
			position?.y,
			position?.z
		) );

	}

	private static createSpeedAction ( entity?: EntityObject ) {

		return new SpeedAction(
			new TransitionDynamics( DynamicsShape.linear, 5, DynamicsDimension.time ),
			new AbsoluteTarget( entity?.speed )
		);
	}

	private static createLaneChangeAction ( entity?: EntityObject ) {

		const target = entity ? new RelativeTarget( entity.name, 1 ) : new AbsoluteTarget( 1 );

		const dynamics = new TransitionDynamics( DynamicsShape.linear, 5, DynamicsDimension.time );

		return new LaneChangeAction( dynamics, target );
	}

	static createLongitudinalDistanceAction ( entity: EntityObject ) {

		const dynamics = new DynamicConstraints( 3, 9, 40 );

		return new LongitudinalDistanceAction( entity?.name, 10, 'distance', false, true, dynamics );

	}

}
