/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { OscPositionAction } from '../models/actions/osc-position-action';
import { OscEntityObject } from '../models/osc-entities';
import { OscActionType, OscPositionType } from '../models/osc-enums';
import { AbstractPosition, AbstractPrivateAction } from '../models/osc-interfaces';
import { OscLanePosition } from '../models/positions/osc-lane-position';

export class ActionService {

	public static executePrivateAction ( obj: OscEntityObject, privateAction: AbstractPrivateAction ) {

		switch ( privateAction.actionType ) {

			case OscActionType.Private_Position:
				this.executePositionAction( obj, privateAction as OscPositionAction );
				break;
			case OscActionType.Private_Routing:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.UserDefined_Command:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.UserDefined_Script:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Global_SetEnvironment:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Global_Entity:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Global_Parameter:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Global_Infrastructure:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Global_Traffic:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Private_Longitudinal_Speed:
				privateAction.execute( obj );
				break;
			case OscActionType.Private_Longitudinal_Distance:
				privateAction.execute( obj );
				break;
			case OscActionType.Private_Lateral:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Private_Visbility:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Private_Meeting:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Private_Autonomous:
				throw new Error( 'Unsupported private action' );
				break;
			case OscActionType.Private_Controller:
				throw new Error( 'Unsupported private action' );
				break;
			default:
				throw new Error( 'Unsupported private action' );
		}

	}

	public static executePositionAction ( obj: OscEntityObject, privateAction: OscPositionAction ) {

		const position = privateAction.position;

		switch ( position.type ) {

			case OscPositionType.World:

				this.executeWorldPositionAction( position, obj );

				break;

			case OscPositionType.Lane:

				try {

					const lanePosition = position as OscLanePosition;

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


	private static executeWorldPositionAction ( position: AbstractPosition, obj: OscEntityObject ) {

		try {

			const vector3 = position ? position.toVector3() : new Vector3( 0, 0, 0 );

			obj.gameObject.position.copy( vector3 );

			position.vector3 = obj.gameObject.position;

		} catch ( error ) {

			throw new Error( 'Error in positioning of actor from world-position' );

		}
	}
}
