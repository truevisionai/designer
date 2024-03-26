/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import {
	BoxGeometry, BufferGeometry,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D, PlaneGeometry,
	Vector3
} from 'three';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { SceneService } from '../scene.service';
import { LaneDirectionHelper } from 'app/map/builders/od-lane-direction-builder';
import { OdTextures } from 'app/map/builders/od.textures';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { MapService } from '../map/map.service';
import { TvPosTheta } from "../../map/models/tv-pos-theta";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverService {

	private maneuverMeshes: Mesh[] = [];

	private entryExitMeshes: Object3D[] = [];

	constructor ( private mapService: MapService ) { }

	createConnectingRoad ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide ) {

		const laneWidth = entry.lane.getWidthValue( 0 );

		// const spline = this.createSpline( entry, exit, side );

		// const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

		// // this.models.addRoad( connectingRoad );

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

	// 	this.models.addRoad( connectingRoad );

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

					this.maneuverMeshes.push( maneuverMesh );

					SceneService.addToolObject( maneuverMesh );

				} );

			} );

		} );

	}

	hideAllManeuvers () {

		this.maneuverMeshes.forEach( maneuverMesh => SceneService.removeFromTool( maneuverMesh ) );

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

		this.entryExitMeshes.forEach( mesh => SceneService.removeFromTool( mesh ) );

		this.entryExitMeshes.splice( 0, this.entryExitMeshes.length );

	}

	private createEntryExitBoxMesh ( position: Vector3, hdg = 0, laneWidth = 3.6 ) {

		const texture = OdTextures.arrowCircle();

		const material = new MeshStandardMaterial( {
			map: texture,
			alphaTest: 0.9,
			transparent: true,
			color: COLOR.SKYBLUE,
			depthTest: false,
			depthWrite: false
		} );

		const geometry = new PlaneGeometry( 1, 1 );

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

		this.entryExitMeshes.push( mesh );

		return mesh;
	}

	private createManeuverMesh ( connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const width = connection.connectingRoad.getFirstLaneSection().getWidthUptoCenter( link.connectingLane, 0 );

		let offset = width;

		if ( link.connectingLane.id < 0 ) offset *= -1;

		const positions = connection.connectingRoad.getReferenceLinePoints( 1, offset );

		if ( positions.length < 2 ) return;

		const mesh = this.createMesh( positions );

		const distance = connection.connectingRoad.length / 5;

		const arrows = LaneDirectionHelper.drawSingleLane( link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => mesh.add( arrow ) );

		return mesh;

	}

	private createMesh ( directedPoints: TvPosTheta[], width = 1.0 ) {

		// Early return if not enough positions
		if ( directedPoints.length < 2 ) return;

		const material = new MeshBasicMaterial( {
			color: 0x00ff00,
			opacity: 0.2,
			transparent: true,
			depthTest: false,
			depthWrite: false
		} );

		// Calculate width offset based on lane ID
		let offset = width * 0.5;

		// Create vertices array
		const vertices = [];
		const indices = []; // For faces

		directedPoints.forEach( point => {

			const left = point.clone().addLateralOffset( -offset );
			const right = point.clone().addLateralOffset( offset );

			// Push vertices for both left and right positions
			vertices.push( left.x, left.y, left.z + 0.1 );
			vertices.push( right.x, right.y, right.z + 0.1 );

		} );

		for ( let i = 0; i < vertices.length / 3 - 2; i += 2 ) {
			/// First triangle (reversed winding order)
			indices.push( i, i + 2, i + 1 );
			// Second triangle (reversed winding order)
			indices.push( i + 1, i + 2, i + 3 );
		}

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setIndex( indices );

		return new Mesh( geometry, material );
	}

}
