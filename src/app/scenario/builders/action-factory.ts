/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TransitionDynamics } from '../models/actions/transition-dynamics';
import { AbsoluteTarget } from '../models/actions/tv-absolute-target';
import { LaneChangeAction } from '../models/actions/tv-lane-change-action';
import { LaneOffsetAction } from '../models/actions/tv-lane-offset-action';
import { LongitudinalDistanceAction } from '../models/actions/tv-longitudinal-distance-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';
import { SpeedAction } from '../models/actions/tv-speed-action';
import { TeleportAction } from '../models/actions/tv-teleport-action';
import { DynamicConstraints } from '../models/dynamic-constraints';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { EntityRef } from '../models/entity-ref';
import { WorldPosition } from '../models/positions/tv-world-position';
import { TvAction } from '../models/tv-action';
import { ActionType, DomainAbsoluteRelative, DynamicsDimension, DynamicsShape } from '../models/tv-enums';
import { Orientation } from '../models/tv-orientation';
import { FollowTrajectoryAction } from '../models/actions/tv-follow-trajectory-action';
import { EnumTrajectoryDomain, PolylineShape, Trajectory, Vertex } from '../models/tv-trajectory';
import { TimeReference, Timing } from '../models/actions/tv-routing-action';
import { Maths } from 'app/utils/maths';

export class ActionFactory {

	static reset () {

		// IDService.reset();

	}

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

			case ActionType.Private_Routing_FollowTrajectory:
				action = this.createRouteFollowTrajectoryAction( entity );
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

			case ActionType.Global_AddEntity:
				throw new Error( `Unsupported private action: ${ type }` );
				break;

			case ActionType.Global_ParameterSet:
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

	static createRouteFollowTrajectoryAction ( entity: ScenarioEntity ): any {

		const shape = new PolylineShape();

		const startPosition = new WorldPosition( entity.getPosition() );

		const vertex = new Vertex( 0, startPosition );

		shape.addVertex( vertex );

		const random = Maths.randomNumberBetween( 1, 10 );

		const trajectory = new Trajectory( 'Trajectory' + random, false, EnumTrajectoryDomain.Distance, shape );

		const action = new FollowTrajectoryAction( trajectory );

		action.timeReference = new TimeReference( new Timing( DomainAbsoluteRelative.absolute, 1, 0 ) );

		return action
	}

	static createChangeLaneOffsetAction ( entity?: ScenarioEntity ) {

		// 3.2 lane width
		const target = entity ?
			new RelativeTarget( new EntityRef( entity.name ), 3.2 ) :
			new AbsoluteTarget( 3.2 );

		return new LaneOffsetAction( false, 0.01, DynamicsShape.linear, target );

	}

	public static createPositionAction ( entity?: ScenarioEntity, vector3?: Vector3, orientation?: Orientation ) {

		const position = vector3 || entity?.position || new Vector3();

		return new TeleportAction( new WorldPosition( position, orientation ) );

	}

	static createLongitudinalDistanceAction ( entity: ScenarioEntity ) {

		const dynamics = new DynamicConstraints( 3, 9, 40 );

		return new LongitudinalDistanceAction( entity?.name, 10, 'distance', false, true, dynamics );

	}

	private static createSpeedAction ( entity?: ScenarioEntity ) {

		return new SpeedAction(
			new TransitionDynamics( DynamicsShape.step, 0, DynamicsDimension.time ),
			new AbsoluteTarget( entity?.getCurrentSpeed() || 30 )
		);
	}

	private static createLaneChangeAction ( entity?: ScenarioEntity ) {

		const target = entity ? new RelativeTarget( new EntityRef( entity.name ), 1 ) : new AbsoluteTarget( 1 );

		const dynamics = new TransitionDynamics( DynamicsShape.sinusoidal, 2, DynamicsDimension.time );

		return new LaneChangeAction( dynamics, target );
	}

}
