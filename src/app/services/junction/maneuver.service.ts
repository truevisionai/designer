import { Injectable } from '@angular/core';
import { TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { RoadSplineService } from '../road/road-spline.service';
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { BoxGeometry, DoubleSide, ExtrudeGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Shape, Vector3 } from 'three';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { SceneService } from '../scene.service';
import { LaneDirectionHelper } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { MapService } from '../map.service';

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverService {

	private static maneuverMeshes: Mesh[] = [];
	private static entryExitMeshes: Object3D[] = [];

	constructor ( private roadSplineService: RoadSplineService, private mapService: MapService ) { }

	createConnectingRoad ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide ) {

		const laneWidth = entry.lane.getWidthValue( 0 );

		// const spline = this.createSpline( entry, exit, side );

		// const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

		// // this.map.addRoad( connectingRoad );

		// connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );

		// connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );

		// // TODO: test this
		// connectingRoad.laneSections.forEach( ( laneSection ) => {

		// 	laneSection.lanes.forEach( ( lane ) => {

		// 		lane.predecessor = entry.lane.id;
		// 		lane.successor = exit.lane.id;

		// 	} );
		// } );

		// connectingRoad.spline = spline;

		// connectingRoad.updateGeometryFromSpline();

		// connectingRoad.spline.hide();

		// return connectingRoad;
	}

	// createConnectingRoad ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide, junction: TvJunction ) {

	// 	const laneWidth = entry.lane.getWidthValue( 0 );

	// 	const spline = this.createSpline( entry, exit, side );

	// 	const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

	// 	this.map.addRoad( connectingRoad );

	// 	connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );

	// 	connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );

	// 	// TODO: test this
	// 	connectingRoad.laneSections.forEach( ( laneSection ) => {

	// 		laneSection.lanes.forEach( ( lane ) => {

	// 			lane.predecessor = entry.lane.id;
	// 			lane.successor = exit.lane.id;

	// 		} );
	// 	} );

	// 	connectingRoad.spline = spline;

	// 	connectingRoad.updateGeometryFromSpline();

	// 	connectingRoad.spline.hide();

	// 	return connectingRoad;
	// }

	showAllManeuvers () {

		this.mapService.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				connection.laneLink.forEach( link => {

					if ( link.connectingLane.type != TvLaneType.driving ) return;

					const maneuverMesh = this.createManeuverMesh( connection, link );

					ManeuverService.maneuverMeshes.push( maneuverMesh );

					SceneService.addToolObject( maneuverMesh );

				} );

			} );

		} );

	}

	hideAllManeuvers () {

		ManeuverService.maneuverMeshes.forEach( maneuverMesh => SceneService.removeFromTool( maneuverMesh ) );

	}

	showAllEntryExitPoints () {

		const roads = this.mapService.map.getRoads();

		const processFirstSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			laneSection
				.getLaneArray()
				.filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving )
				.forEach( lane => {

					const laneWidth = lane.getWidthValue( laneSection.s );

					const posTheta = road.getLaneCenterPosition( lane, laneSection.s );

					if ( lane.isLeft ) posTheta.hdg += Math.PI;

					const mesh1 = this.createEntryExitBoxMesh( posTheta.toVector3(), posTheta.hdg, laneWidth );

					SceneService.addToolObject( mesh1 );

				} );

		}

		const processLastSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			laneSection
				.getLaneArray()
				.filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving )
				.forEach( lane => {

					const laneWidth = lane.getWidthValue( laneSection.endS );

					const posTheta = road.getLaneCenterPosition( lane, laneSection.endS, 0 );

					if ( lane.isLeft ) posTheta.hdg += Math.PI;

					const mesh2 = this.createEntryExitBoxMesh( posTheta.toVector3(), posTheta.hdg, laneWidth );

					SceneService.addToolObject( mesh2 );

				} );

		}

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			if ( !road.predecessor || road.predecessor.elementType != 'road' ) {

				processFirstSection( road, road.getFirstLaneSection() );

			}

			if ( !road.successor || road.successor.elementType != 'road' ) {

				processLastSection( road, road.getLastLaneSection() );

			}
		}

	}

	hideAllEntryExitPoints () {

		ManeuverService.entryExitMeshes.forEach( mesh => SceneService.removeFromTool( mesh ) );

		ManeuverService.entryExitMeshes.splice( 0, ManeuverService.entryExitMeshes.length );

	}

	private createEntryExitBoxMesh ( position: Vector3, hdg = 0, laneWidth = 3.6 ) {

		const texture = OdTextures.arrowCircle();

		const material = new MeshStandardMaterial( {
			map: texture,
			alphaTest: 0.9,
			transparent: true,
			color: COLOR.SKYBLUE,
			side: DoubleSide
		} );

		const geometry = new BoxGeometry( 1, 1, 0.02 );
		// const geometry = new PlaneGeometry( 1, 1, 0.01 );

		const mesh = new Mesh( geometry, material );

		mesh.name = 'entry-exit-point';

		mesh.position.copy( position );

		// Compute the direction vector from the heading
		const direction = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 ).normalize();

		// Apply the rotation to the mesh based on the computed direction
		mesh.quaternion.setFromUnitVectors( new Vector3( 0, 1, 0 ), direction );

		const boxLine = new BoxGeometry( laneWidth, 0.5, 0.01 );
		const meshLine = new Mesh( boxLine, new MeshBasicMaterial( { color: COLOR.GREEN } ) );

		mesh.add( meshLine );

		ManeuverService.entryExitMeshes.push( mesh );

		return mesh;
	}

	private createManeuverMesh ( connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const width = connection.connectingRoad.getFirstLaneSection().getWidthUptoCenter( link.connectingLane, 0 );

		const spline = connection.connectingRoad.spline;

		if ( spline.controlPointPositions.length < 2 ) return;

		let offset = width;

		if ( link.connectingLane.id < 0 ) offset *= -1;

		const path = connection.connectingRoad.spline.getPath( offset );

		// Define extrude settings
		const extrudeSettings = {
			steps: 50,
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 1,
			bevelOffset: 1,
			bevelSegments: 1,
			extrudePath: path
		};

		// Create a rectangular shape to be extruded along the path
		const shape = new Shape();
		shape.moveTo( -0.1, -0.5 );
		shape.lineTo( -0.1, 0.5 );

		// Create geometry and mesh
		const geometry = new ExtrudeGeometry( shape, extrudeSettings );
		const material = new MeshBasicMaterial( { color: COLOR.GREEN, opacity: 0.2, transparent: true } );

		const mesh = new Mesh( geometry, material );

		const distance = connection.connectingRoad.length / 5;
		const arrows = LaneDirectionHelper.drawSingleLane( link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => mesh.add( arrow ) );

		return mesh;


	}
}
