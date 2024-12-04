/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Time } from '../../../core/time';
import { Maths } from '../../../utils/maths';
import { ScenarioEntity } from '../entities/scenario-entity';
import { ActionType, TrajectoryFollowingMode } from '../tv-enums';
import { PolylineShape, Trajectory } from '../tv-trajectory';
import { AbstractRoutingAction, TimeReference } from './tv-routing-action';
import { TvConsole } from 'app/core/utils/console';


export class FollowTrajectoryAction extends AbstractRoutingAction {

	readonly label: string = 'FollowTrajectory';
	readonly actionType: ActionType = ActionType.Private_Routing_FollowTrajectory;

	/**
	 * Defines if time information provided within the trajectory should be
	 * considered. If so, it may be used as either absolute or relative
	 * time along the trajectory in order to define longitudinal velocity of
	 * the actor. Moreover, a time offset or time scaling may be applied.
	 */
	public timeReference: TimeReference;
	/**
	 * An offset into the trajectory. This has the effect of logically
	 * truncating the trajectory, so the resulting new trajectory starts at
	 * that distance offset. Where a timing TimeReference fields is provided,
	 * the time that would be taken to reach this point is deducted from all
	 * calculated waypoint time values.
	 * Unit: [m]. Range: [0..arclength of the trajectory].
	 */
	public initialDistanceOffset = 0;
	/**
	 * The mode how to follow the given trajectory.
	 *
	 * Defines the (lateral) trajectory following behavior of the actor:
	 * Mode 'position' forces the actor to strictly adhere to the trajectory.
	 * In contrast, mode 'follow' hands over control to the actor. In this mode,
	 * the actor tries to follow the trajectory as best as he can. This may be
	 * restricted by dynamics constraints and/or control loop implementation.
	 * In mode 'follow' the resulting path of the entity is not guaranteed to
	 * be identical for every simulation environment.
	 */
	// public trajectoryFollowingMode: TrajectoryFollowingMode = TrajectoryFollowingMode.position;
	public trajectoryFollowingMode: TrajectoryFollowingMode = TrajectoryFollowingMode.position;
	private distanceThreshold = 2;
	private index = 0;
	private rotationSpeed = 1;

	constructor ( public trajectory: Trajectory ) {
		super();
	}

	execute ( entity: ScenarioEntity ): void {

		if ( !this.hasStarted ) {

			this.start( entity );

		} else {

			this.update( entity );

		}

	}

	reset (): void {

		this.index = 0;

	}

	private start ( entity: ScenarioEntity ): void {

		this.hasStarted = true;

		entity.setAutonomous( false );

	}

	private update ( entity: ScenarioEntity ): void {

		switch ( this.trajectoryFollowingMode ) {

			case TrajectoryFollowingMode.position:
				this.steering( entity );
				break;

			case TrajectoryFollowingMode.steering:
				this.steering( entity );
				break;

			default:
				this.steering( entity );
			// console.error( 'unknown lateral purpose' );
		}

	}

	private steering ( entity: ScenarioEntity ): void {

		// Debug.log( this );

		if ( !( this.trajectory.shape instanceof PolylineShape ) ) {
			TvConsole.error( 'unsupported shape' );
			return;
		}

		const shape = this.trajectory.shape;

		if ( shape instanceof PolylineShape && this.index >= shape.vertices.length ) {

			this.isCompleted = true;

			this.actionCompleted();

			return;
		}

		const vertex = shape.vertices[ this.index ];

		const target = vertex.position.getVectorPosition();

		const targetDir = target.clone().sub( entity.position );

		const maxChange = entity.getCurrentSpeed() * Maths.Speed2MPH * Time.deltaTime;

		const newPosition: Vector3 = Maths.moveTowards( entity.position, target, maxChange );

		// Debug.log( entity.position, target, maxChange, newPosition );

		// Debug.log( newPosition );

		entity.setPosition( newPosition );

		const step = this.rotationSpeed * Time.deltaTime;

		// const newDir

		// entity.setRotation()

		const distanceFromTarget = entity.position.distanceTo( target );

		if ( distanceFromTarget <= this.distanceThreshold ) this.index++;

	}
}
