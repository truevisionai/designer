import { OscEntityObject } from '../models/osc-entities';
import { AbstractPrivateAction } from '../models/osc-interfaces';
import { OscActionType, OscPositionType } from '../models/osc-enums';
import { OscPositionAction } from '../models/actions/osc-position-action';
import { OscWorldPosition } from '../models/positions/osc-world-position';
import { OscLanePosition } from '../models/positions/osc-lane-position';
import { Vector3 } from 'three';

export class OscActionBuilder {

    public static executePrivateAction ( obj: OscEntityObject, privateAction: AbstractPrivateAction ) {

        switch ( privateAction.actionType ) {

            case OscActionType.Private_Position:
                this.executePositionAction( obj, privateAction as OscPositionAction );
                break;

            case OscActionType.Private_Longitudinal_Speed:
                privateAction.execute( obj );
                break;

            case OscActionType.Private_Longitudinal_Distance:
                privateAction.execute( obj );
                break;


            default:
                throw new Error( 'Unsupported private action' );
        }

    }

    public static executePositionAction ( obj: OscEntityObject, privateAction: OscPositionAction ) {

        const position = privateAction.position;

        switch ( position.type ) {

            case OscPositionType.World:

                const worldPosition = position as OscWorldPosition;

                try {

                    const xyz = worldPosition.position ? worldPosition.position : new Vector3( 0, 0, 0 );

                    obj.gameObject.position.copy( xyz );

                    worldPosition.vector3 = obj.gameObject.position;

                } catch ( error ) {

                    throw new Error( 'Error in positioning of actor from world-position' );

                }

                break;

            case OscPositionType.Lane:

                try {

                    const lanePosition = position as OscLanePosition;

                    obj.gameObject.position.copy( lanePosition.getPosition() );

                } catch ( error ) {

                    throw new Error( 'Error in positioning of actor from lane-position' );

                }

                break;

            default:

                throw new Error( 'Unsupported position type' );

                break;
        }

    }


}