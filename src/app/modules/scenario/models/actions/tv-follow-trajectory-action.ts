/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Time } from '../../../../core/time';
import { Maths } from '../../../../utils/maths';
import { CatalogReference } from '../tv-catalogs';
import { ScenarioEntity } from '../tv-entities';
import { ActionType, LateralPurpose } from '../tv-enums';
import { Trajectory } from '../tv-trajectory';
import { AbstractRoutingAction, LongitudinalPurpose } from './tv-routing-action';

export class FollowTrajectoryAction extends AbstractRoutingAction {

	readonly label: string = 'FollowTrajectory';
	readonly actionType: ActionType = ActionType.Private_Routing;
	// optional
	public catalogReference: CatalogReference;
	public longitudinalPurpose: LongitudinalPurpose;
	public lateralPurpose: LateralPurpose;
	private distanceThreshold = 2;
	private index = 0;
	private rotationSpeed = 1;

	constructor ( public trajectory: Trajectory ) {
		super();
	}

	execute ( entity: ScenarioEntity ) {

		if ( !this.hasStarted ) {

			this.start( entity );

		} else {

			this.update( entity );

		}

	}

	reset () {

		this.index = 0;

	}

	private start ( entity: ScenarioEntity ) {

		this.hasStarted = true;

		entity.setAutonomous( false );

	}

	private update ( entity: ScenarioEntity ) {

		switch ( this.lateralPurpose ) {

			case LateralPurpose.position:
				this.steering( entity );
				break;

			case LateralPurpose.steering:
				this.steering( entity );
				break;

			default:
				this.steering( entity );
			// console.error( 'unknown lateral purpose' );
		}

	}

	private steering ( entity: ScenarioEntity ) {

		// console.log( this );

		if ( this.index >= this.trajectory.vertices.length ) {

			this.isCompleted = true;

			this.actionCompleted();

			return;
		}

		const vertex = this.trajectory.vertices[ this.index ];

		// console.log( vertex );

		const target = vertex.position.toVector3();

		const targetDir = target.clone().sub( entity.position );

		const maxChange = entity.getCurrentSpeed() * Maths.Speed2MPH * Time.deltaTime;

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
