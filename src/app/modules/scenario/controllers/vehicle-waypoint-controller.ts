import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { SceneService } from '../../../core/services/scene.service';
import { Time } from '../../../core/time';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AbstractController } from '../models/abstract-controller';
import { ScenarioEntity } from '../models/entities/scenario-entity';

export class VehicleWaypointController extends AbstractController {

	private waypoints: Vector3[] = [];
	private currentWaypoint: number = 0;
	private cube: Mesh<BoxGeometry, any>;

	constructor ( name = 'VehicleWaypointController', private entity: ScenarioEntity ) {
		super( name );
		this.createCube();
	}

	createCube () {
		const geometry = new BoxGeometry( 1, 1, 1 );
		this.cube = new Mesh( geometry, new MeshBasicMaterial( { color: 'red' } ) );
		SceneService.add( this.cube );
	}

	start (): void {

		this.currentWaypoint = 0;
		this.waypoints = [];

		if ( !this.entity.openDriveProperties.isOpenDrive ) return;

		const refPos = new TvPosTheta();

		const currentRoad = this.map.getRoadById( this.entity.roadId );

		for ( let s = this.entity.sCoordinate; s < currentRoad.length; s++ ) {

			const position = TvMapQueries.getLanePosition( this.entity.roadId, this.entity.laneId, s, this.entity.laneOffset, refPos );

			this.waypoints.push( position );

		}

		this.cube.position.copy( this.waypoints[ 0 ] );

	}

	update (): void {

		if ( !this.entity.openDriveProperties.isOpenDrive ) return;

		if ( this.waypoints.length === 0 ) return;

		if ( this.currentWaypoint >= this.waypoints.length ) return;

		const waypoint = this.waypoints[ this.currentWaypoint ];

		const currentPosition = this.cube.position.clone();

		const distance = currentPosition.distanceTo( waypoint );

		if ( distance >= 0.1 ) {

			// Create a direction vector from the current position to the next waypoint
			const direction = waypoint.clone().sub( currentPosition ).normalize();

			// Calculate movement for this frame considering the constant speed and the time elapsed since the last frame
			const movement = direction.multiplyScalar( 10 * Time.deltaTime );

			// Check if the cube will overshoot the waypoint
			if ( currentPosition.clone().add( movement ).distanceTo( waypoint ) < currentPosition.distanceTo( waypoint ) ) {
				// Apply the movement to the current position
				this.cube.position.add( movement );
			} else {
				// If it will overshoot, just set the position to the waypoint
				this.cube.position.copy( waypoint );
				this.currentWaypoint++;
				console.log( 'waypoint reached' );
			}

		} else {

			console.log( 'waypoint reached' );

			this.currentWaypoint++;

		}

	}

}
