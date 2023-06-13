/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { PositionAction } from '../models/actions/tv-position-action';
import { EntityObject } from '../models/tv-entities';
import { ActionType, PositionType } from '../models/tv-enums';
import { AbstractPosition, AbstractPrivateAction } from '../models/tv-interfaces';
import { ActionFactory } from './action-factory';
import { LanePosition } from '../models/positions/tv-lane-position';


@Injectable( {
	providedIn: 'root'
} )
export class ActionService {

	public getPrivateActionTypes () {
		return [
			{
				name: 'Position',
				value: ActionType.Private_Position
			},
			{
				name: 'Longitudinal Speed',
				value: ActionType.Private_Longitudinal_Speed
			},
		];
	}

	public static getAction ( type: ActionType, entity: EntityObject ) {

		return ActionFactory.createAction( type, entity );

	}

	public static executePrivateAction ( obj: EntityObject, privateAction: AbstractPrivateAction ) {

		switch ( privateAction.actionType ) {

			case ActionType.Private_Position:
				this.executePositionAction( obj, privateAction as PositionAction );
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
			case ActionType.Global_Entity:
				throw new Error( 'Unsupported private action' );
				break;
			case ActionType.Global_Parameter:
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
			case ActionType.Private_Lateral:
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

	public static executePositionAction ( obj: EntityObject, privateAction: PositionAction ) {

		const position = privateAction.position;

		switch ( position.type ) {

			case PositionType.World:

				this.executeWorldPositionAction( position, obj );

				break;

			case PositionType.Lane:

				try {

					const lanePosition = position as LanePosition;

					obj.gameObject.position.copy( lanePosition.toVector3() );

				} catch ( error ) {

					throw new Error( 'Error in positioning of actor from lane-position' );

				}

				break;

			default:

				throw new Error( 'Unsupported position type' );

				break;
		}

	}


	private static executeWorldPositionAction ( position: AbstractPosition, obj: EntityObject ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.gameObject.position.copy( vector3 );

			position.vector3 = obj.gameObject.position;

		} catch ( error ) {

			throw new Error( 'Error in positioning of actor from world-position' );

		}
	}
}
