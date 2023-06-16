/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { PositionAction } from '../models/actions/tv-position-action';
import { DynamicsDimension, LaneChangeDynamics, SpeedDynamics } from '../models/actions/tv-private-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { EntityObject } from '../models/tv-entities';
import { ActionType, DynamicsShape } from '../models/tv-enums';
import { WorldPosition } from '../models/positions/tv-world-position';

export class ActionFactory {

	public static createAction ( type: ActionType, entity?: EntityObject ) {

		switch ( type ) {

			case ActionType.Private_Position:
				return this.createPositionAction( entity );

			case ActionType.Private_Longitudinal_Speed:
				return this.createSpeedAction( entity );

			case ActionType.Private_LaneChange:
				return this.createLaneChangeAction( entity );

			default:
				throw new Error( `Unsupported private action: ${ type }` );

		}

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
			new SpeedDynamics( DynamicsShape.linear, 5, DynamicsDimension.time ),
			new AbsoluteTarget( entity?.speed )
		);
	}

	private static createLaneChangeAction ( entity?: EntityObject ) {

		const target = entity ? new RelativeTarget( entity.name, 1 ) : new AbsoluteTarget( 1 );

		const dynamics = new LaneChangeDynamics( 5, 0, DynamicsShape.sinusoidal, 0 );

		return new LaneChangeAction( dynamics, target );
	}
}
