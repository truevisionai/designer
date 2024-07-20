/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvRoadCoord } from '../models/TvRoadCoord';
import {
	TvBoundarySegmentType,
	TvJointBoundary,
	TvJunctionBoundary,
	TvJunctionSegmentBoundary,
	TvLaneBoundary
} from './tv-junction-boundary';
import { TvRoad } from '../models/tv-road.model';
import {
	FrontSide,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	Points, RepeatWrapping,
	Shape,
	ShapeGeometry, Texture,
	Vector2,
	Vector3
} from 'three';
import { TvContactPoint, TvLaneSide } from '../models/tv-common';
import { GeometryUtils } from 'app/services/surface/geometry-utils';
import { LaneUtils } from "../../utils/lane.utils";
import { TvLane } from "../models/tv-lane";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { OdTextures } from "../../deprecated/od.textures";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryBuilder {

	constructor () {
	}

	build ( boundary: TvJunctionBoundary ): Mesh {

		const points = this.convertBoundaryToPositions( boundary );

		const shape = new Shape( points.map( p => new Vector2( p.x, p.y ) ) );

		const geometry = new ShapeGeometry( shape );

		const mesh = new Mesh( geometry, this.junctionMaterial );

		return mesh;

	}

	private get junctionMaterial () {

		const map = this.getJunctionTexture();

		return new MeshStandardMaterial( { map: map, side: FrontSide } );
	}

	private getJunctionTexture (): Texture {

		// Clone the texture and set wrapping to repeat
		const map = OdTextures.asphalt().clone();

		map.wrapS = map.wrapT = RepeatWrapping;

		return map;

	}

	convertBoundaryToPositions ( boundary: TvJunctionBoundary ): Vector3[] {

		// if ( !junction.boundary ) junction.boundary = this.createJunctionBoundary( junction );

		// junction.boundary.segments.forEach( segment => console.debug( segment.toString() ) );

		const positions: Vector3[] = [];

		boundary.segments.forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( pos => positions.push( pos ) );

		} );

		return GeometryUtils.sortByAngle( positions );
	}

	convertBoundaryToPoints ( boundary: TvJunctionBoundary ): AbstractControlPoint[] {

		// if ( !junction.boundary ) junction.boundary = this.createJunctionBoundary( junction );

		// junction.boundary.segments.forEach( segment => console.debug( segment.toString() ) );

		const points: AbstractControlPoint[] = [];

		boundary.segments.forEach( segment => {

			this.createBoundaryPositions( segment ).forEach( position => {

				const point = new SimpleControlPoint( segment, position );

				point.position.copy( position );

				point.userData.segment = segment;

				points.push( point );

			} );

		} );

		return GeometryUtils.sortPointByAngle( points );
	}

	convertBoundaryToShape ( boundary: TvJunctionBoundary ) {

		// NOTE: THIS NOT WORKING

		// if ( !junction.boundary ) junction.boundary = this.createJunctionBoundary( junction );

		// junction.boundary.segments.forEach( segment => console.debug( segment.toString() ) );

		const shape = new Shape();

		boundary.segments.forEach( segment => {

			const positions = this.createBoundaryPositions( segment );

			if ( segment.type == TvBoundarySegmentType.JOINT ) {

				positions.forEach( pos => shape.moveTo( pos.x, pos.y ) );

			} else if ( segment.type == TvBoundarySegmentType.LANE ) {

				positions.forEach( pos => shape.lineTo( pos.x, pos.y ) );

			} else {

				console.error( 'Unknown segment type', segment );
			}

		} );

		return shape;
	}

	private createBoundaryPositions ( boundary: TvJunctionSegmentBoundary ): Vector3[] {

		if ( boundary.type == TvBoundarySegmentType.JOINT ) {
			return this.convertJointToPositions( boundary as TvJointBoundary );
		}

		if ( boundary.type == TvBoundarySegmentType.LANE ) {
			return this.convertLaneToPositions( boundary as TvLaneBoundary );
		}

		console.error( 'Unknown boundary type', boundary );

		return [];
	}

	private convertJointToPositions ( joint: TvJointBoundary ): Vector3[] {

		const posTheta = joint.road.getPosThetaByContact( joint.contactPoint );

		const start = joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3();
		const end = joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

		// return only 2 points for joint boundary
		return [ start, end ];

	}

	private convertLaneToPositions ( lane: TvLaneBoundary ): Vector3[] {

		const positions: Vector3[] = [];

		const start = this.findPosition( lane.road, lane.sStart );

		const end = this.findPosition( lane.road, lane.sEnd );

		for ( let s = start.s; s <= end.s; s++ ) {

			const posTheta = lane.road.getPosThetaAt( s );

			const position = lane.road.getLaneEndPosition( lane.boundaryLane, posTheta.s ).toVector3();

			positions.push( position );

		}

		return positions;


	}

	private findPosition ( road: TvRoad, value: number | TvContactPoint ) {

		if ( typeof value == 'number' ) {

			return road.getPosThetaAt( value );

		} else if ( value == TvContactPoint.START ) {

			return road.getPosThetaAt( 0 );

		} else if ( value == TvContactPoint.END ) {

			return road.getPosThetaAt( road.length );

		}

	}
}

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryManager {

	constructor () {
	}

	update ( junction: TvJunction ) {

		junction.boundary = this.createJunctionBoundary( junction );

		// this.getOutermostCornerConnections( junction );

	}

	private getOutermostCornerConnections ( junction: TvJunction ) {

		let incomingContact: TvContactPoint;

		const findOuterMostLane = ( road: TvRoad ) => {

			// find right most lane
			if ( road.successor?.element.id == junction.id ) {

				incomingContact = TvContactPoint.END;

				return LaneUtils.findOuterMostDrivingLane( road.getLastLaneSection(), TvLaneSide.RIGHT );

			}

			// find left most lane
			if ( road.predecessor?.element.id == junction.id ) {

				incomingContact = TvContactPoint.START;

				return LaneUtils.findOuterMostDrivingLane( road.getLastLaneSection(), TvLaneSide.LEFT );

			}

		}

		const findOuterConnection = ( incomingRoad: TvRoad, incomingLane: TvLane ) => {

			const cornerConnections = junction.getConnections()
				.filter( conn => conn.isCornerConnection )
				.filter( conn => conn.incomingRoadId === incomingRoad.id );

			for ( const cornerConnection of cornerConnections ) {
				for ( const link of cornerConnection.laneLink ) {
					if ( link.incomingLane.id == incomingLane.id ) {
						return cornerConnection;
					}
				}
			}
		}

		const incomingRoads = junction.getIncomingRoads();

		for ( let i = 0; i < incomingRoads.length; i++ ) {

			const incomingRoad = incomingRoads[ i ];

			const outerLane = findOuterMostLane( incomingRoad );

			if ( !outerLane ) continue;

			const cornerConnection = findOuterConnection( incomingRoad, outerLane );

			console.log( incomingRoad.toString(), outerLane, cornerConnection?.toString() );

			outerLane.gameObject.material = ( outerLane.gameObject.material as MeshBasicMaterial ).clone();
			( outerLane.gameObject.material as MeshBasicMaterial ).color.set( 0xff0000 );
			( outerLane.gameObject.material as MeshBasicMaterial ).needsUpdate = true;

			if ( cornerConnection ) {

				const laneSection = cornerConnection.connectingRoad.getLaneSectionAtContact( cornerConnection.contactPoint );

				const outerMostLink = cornerConnection.laneLink.find( link => link.incomingLane.id == outerLane.id );

				if ( outerMostLink ) {
					outerMostLink.connectingLane.gameObject.material = ( outerMostLink.connectingLane.gameObject.material as MeshBasicMaterial ).clone();
					( outerMostLink.connectingLane.gameObject.material as MeshBasicMaterial ).color.set( 0xff0000 );
					( outerMostLink.connectingLane.gameObject.material as MeshBasicMaterial ).needsUpdate = true
				}

			} else {

				console.error( 'No corner connection found for incoming road', incomingRoad.toString() )

			}

		}


	}

	private createJunctionBoundary ( junction: TvJunction ): TvJunctionBoundary {

		const boundary = new TvJunctionBoundary();

		const coords = GeometryUtils.sortCoordsByAngle( junction.getRoadCoords() );

		coords.forEach( coord => {

			// NOTE: Sequence of the following code is important

			const lowestLane = LaneUtils.findLowestLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == lowestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );

				}

			} );

			const segment = this.createJointSegment( coord );

			boundary.segments.push( segment );

			const highestLane = LaneUtils.findHigestLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == highestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );
				}

			} );

		} );

		return boundary;
	}

	private createJointSegment ( roadCoord: TvRoadCoord ) {

		const boundary = new TvJointBoundary();

		boundary.road = roadCoord.road;

		boundary.contactPoint = roadCoord.contact;

		boundary.jointLaneStart = roadCoord.laneSection.getLeftMostLane();

		boundary.jointLaneEnd = roadCoord.laneSection.getRightMostLane();

		return boundary;

	}

	private createLaneSegment ( connectingRoad: TvRoad, connectionLane: TvLane ) {

		const boundary = new TvLaneBoundary();

		boundary.road = connectingRoad;

		boundary.boundaryLane = connectionLane;

		boundary.sStart = 0;

		boundary.sEnd = connectingRoad.length;

		return boundary;

	}
}
