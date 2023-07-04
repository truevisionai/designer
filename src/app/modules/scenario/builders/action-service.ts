/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { TeleportAction } from '../models/actions/tv-teleport-action';
import { Position } from '../models/position';
import { PrivateAction } from '../models/private-action';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { ActionType, PositionType } from '../models/tv-enums';


@Injectable( {
	providedIn: 'root'
} )
export class ActionService {

	public static executePrivateAction ( obj: ScenarioEntity, privateAction: PrivateAction ) {

		switch ( privateAction.actionType ) {

			case ActionType.Private_Position:
				this.executePositionAction( obj, privateAction as TeleportAction );
				break;
			case ActionType.Private_Routing:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.UserDefined_Command:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.UserDefined_Script:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_SetEnvironment:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_AddEntity:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_ParameterSet:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_Infrastructure:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_Traffic:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Private_Longitudinal_Speed:
				privateAction.execute( obj );
				break;
			case ActionType.Private_Longitudinal_Distance:
				privateAction.execute( obj );
				break;
			case ActionType.Private_LaneChange:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Private_Visbility:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Private_Meeting:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Private_Autonomous:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Private_Controller:
				throw new Error( 'Unsupported private action' );
				break;
			default:
				throw new Error( 'Unsupported private action' );
		}

	}

	public static executePositionAction ( obj: ScenarioEntity, privateAction: TeleportAction ) {

		const position = privateAction.position;

		switch ( position.type ) {

			case PositionType.World:
				this.executeWorldPositionAction( position, obj );
				break;

			case PositionType.RelativeWorld:
				this.executeRelativeWorldPositionAction( position, obj );
				break;

			case PositionType.RelativeObject:
				this.executeRelativeObjectPositionAction( position, obj );
				break;

			case PositionType.Lane:
				this.executeLanePositionAction( position, obj );
				break;

			case PositionType.RelativeLane:
				this.executeLanePositionAction( position, obj );
				break;

			case PositionType.Road:
				this.executeRoadPositionAction( position, obj );
				break;

			default:
				throw new Error( 'Unsupported position type' );
				break;
		}

	}


	private static executeWorldPositionAction ( position: Position, obj: ScenarioEntity ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.position.copy( vector3 );

			position.vector3 = obj.position;

		} catch ( error ) {

			TvConsole.error( 'Error in positioning of actor from world-position' );

		}
	}

	private static executeLanePositionAction ( position: Position, obj: ScenarioEntity ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.position.copy( vector3 );

			position.vector3 = obj.position;


		} catch ( e ) {

			TvConsole.error( 'Error in positioning of actor from road-position' );

		}

	}

	private static executeRoadPositionAction ( position: Position, obj: ScenarioEntity ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.position.copy( vector3 );

			position.vector3 = obj.position;


		} catch ( e ) {

			TvConsole.error( 'Error in positioning of actor from road-position' );

		}

	}

	private static executeRelativeWorldPositionAction ( position: Position, obj: ScenarioEntity ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.position.copy( vector3 );

			position.vector3 = obj.position;


		} catch ( e ) {

			TvConsole.error( 'Error in positioning of actor from road-position' );

		}

	}

	private static executeRelativeObjectPositionAction ( position: Position, obj: ScenarioEntity ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.position.copy( vector3 );

			position.vector3 = obj.position;


		} catch ( e ) {

			TvConsole.error( 'Error in positioning of actor from road-position' );

		}

	}
}
