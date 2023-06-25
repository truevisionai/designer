/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { LaneOffsetAction } from '../models/actions/tv-lane-offset-action';
import { LongitudinalDistanceAction } from '../models/actions/tv-longitudinal-distance-action';
import { TeleportAction } from '../models/actions/tv-teleport-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { DynamicConstraints } from '../models/dynamic-constraints';
import { WorldPosition } from '../models/positions/tv-world-position';
import { TvAction } from '../models/tv-action';
import { ActionType, DynamicsDimension, DynamicsShape } from '../models/tv-enums';
import { ScenarioEntity } from '../models/tv-entities';

export class ActionFactory {

	public static createNamedAction ( name: string, type: ActionType, entity?: ScenarioEntity ) {

		const action = this.createActionWithoutName( type, entity ) as TvAction;

		action.setName( name );

		return action;

	}

	public static createActionWithoutName ( type: ActionType, entity?: ScenarioEntity ) {

		let action: any;

		switch ( type ) {

			case ActionType.Private_Position:
				action = this.createPositionAction( entity );
				break;

			case ActionType.Private_Longitudinal_Speed:
				action = this.createSpeedAction( entity );
				break;

			case ActionType.Private_LaneChange:
				action = this.createLaneChangeAction( entity );
				break;

			case ActionType.Private_LaneOffset:
				action = this.createChangeLaneOffsetAction( entity );
				break;

			case ActionType.Private_Longitudinal_Distance:
				action = this.createLongitudinalDistanceAction( entity );
				break;

			case ActionType.Private_Visbility:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Private_Meeting:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Private_Autonomous:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Private_Controller:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Private_Routing:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.UserDefined_Command:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.UserDefined_Script:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_SetEnvironment:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_Entity:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_Parameter:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_Infrastructure:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_Traffic:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			default:
				throw new Error( `Unsupported private action: ${ type }` );

		}

		return action;

	}

	static createChangeLaneOffsetAction ( entity?: ScenarioEntity ) {

		// 3.2 lane width
		const target = entity ?
			new RelativeTarget( entity.name, 3.2 ) :
			new AbsoluteTarget( 3.2 );

		return new LaneOffsetAction( false, 0.01, DynamicsShape.linear, target );

	}

	private static createPositionAction ( entity?: ScenarioEntity ): TvAction {

		const position = entity?.position;

		return new TeleportAction( new WorldPosition(
			position?.x || 0,
			position?.y || 0,
			position?.z || 0
		) );

	}

	private static createSpeedAction ( entity?: ScenarioEntity ) {

		return new SpeedAction(
			new TransitionDynamics( DynamicsShape.step, 0, DynamicsDimension.time ),
			new AbsoluteTarget( entity?.getCurrentSpeed() || 40 )
		);
	}

	private static createLaneChangeAction ( entity?: ScenarioEntity ) {

		const target = entity ? new RelativeTarget( entity.name, 1 ) : new AbsoluteTarget( 1 );

		const dynamics = new TransitionDynamics( DynamicsShape.sinusoidal, 2, DynamicsDimension.time );

		return new LaneChangeAction( dynamics, target );
	}

	static createLongitudinalDistanceAction ( entity: ScenarioEntity ) {

		const dynamics = new DynamicConstraints( 3, 9, 40 );

		return new LongitudinalDistanceAction( entity?.name, 10, 'distance', false, true, dynamics );

	}

}
