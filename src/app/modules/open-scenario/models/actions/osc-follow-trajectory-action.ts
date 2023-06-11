import { OscActionType, OscLateralPurpose, OscStoryElementType } from '../osc-enums';
import { OscCatalogReference } from '../osc-catalogs';
import { OscTrajectory } from '../osc-trajectory';
import { OscEntityObject } from '../osc-entities';
import { AbstractRoutingAction, LongitudinalPurpose } from './osc-routing-action';
import { Maths } from '../../../../utils/maths';
import { Vector3 } from 'three';
import { Time } from '../../../../core/time';

export class OscFollowTrajectoryAction extends AbstractRoutingAction {

    readonly actionName: string = 'FollowTrajectory';
    readonly actionType: OscActionType = OscActionType.Private_Routing;

    execute ( entity: OscEntityObject ) {

        if ( !this.hasStarted ) {

            this.start( entity );

        } else {

            this.update( entity );

        }

    }

    reset () {

        this.index = 0;

    }

    // optional
    public catalogReference: OscCatalogReference;
    public longitudinalPurpose: LongitudinalPurpose;
    public lateralPurpose: OscLateralPurpose;
    private distanceThreshold = 2;
    private index = 0;
    private rotationSpeed = 1;

    constructor ( public trajectory: OscTrajectory ) {
        super();
    }

    private start ( entity: OscEntityObject ) {

        this.hasStarted = true;

        entity.automove = false;

    }

    private update ( entity: OscEntityObject ) {

        switch ( this.lateralPurpose ) {

            case OscLateralPurpose.position:
                this.steering( entity );
                break;

            case OscLateralPurpose.steering:
                this.steering( entity );
                break;

            default:
                this.steering( entity );
            // console.error( 'unknown lateral purpose' );
        }

    }

    private steering ( entity: OscEntityObject ) {

        // console.log( this );

        if ( this.index >= this.trajectory.vertices.length ) {

            this.isCompleted = true;

            this.completed.emit( {
                type: OscStoryElementType.action,
                name: this.actionName
            } );

            return;
        }

        const vertex = this.trajectory.vertices[ this.index ];

        // console.log( vertex );

        const target = vertex.position.getPosition();

        const targetDir = target.clone().sub( entity.position );

        const maxChange = entity.speed * Maths.Speed2MPH * Time.deltaTime;

        const newPosition: Vector3 = Maths.moveTowards( entity.position, target, maxChange );

        // console.log( entity.position, target, maxChange, newPosition );

        // console.log( newPosition );

        entity.setPosition( newPosition );

        const step = this.rotationSpeed * Time.deltaTime;

        // const newDir

        // entity.setRotation()

        const distanceFromTarget = entity.position.distanceTo( target );

        if ( distanceFromTarget <= this.distanceThreshold ) this.index++;

    }
}
