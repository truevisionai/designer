/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Log } from "app/core/utils/log";
import { TvJunctionBoundary } from "app/map/junction-boundary/tv-junction-boundary";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { traverseLanes } from "app/utils/traverseLanes";
import { TvLane } from "../models/tv-lane";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionBoundaryFactory } from "app/map/junction-boundary/tv-junction-boundary.factory";
import { TvJunctionConnection } from "../models/connections/tv-junction-connection";
import { TvJointBoundary } from "./tv-joint-boundary";
import { TvLaneBoundary } from "./tv-lane-boundary";
import { TvContactPoint } from "../models/tv-common";
import { TvRoad } from "../models/tv-road.model";

export class TvJunctionBoundaryProfile {

	private outerBoundary: TvJunctionBoundary;

	constructor ( private readonly junction: TvJunction ) {
		this.outerBoundary = new TvJunctionBoundary();
	}

	getOuterBoundary (): TvJunctionBoundary {
		return this.outerBoundary;
	}

	setOuterBoundary ( boundary: TvJunctionBoundary ): void {
		this.outerBoundary = boundary;
	}

	// update (): void {
	//
	// 	this.outerBoundary.clearSegments();
	//
	// 	const links = this.junction.getRoadLinks();
	//
	// 	const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );
	//
	// 	for ( let i = 0; i < sorted.length; i++ ) {
	//
	// 		const coord = sorted[ i ];
	// 		const nextCoord = sorted[ ( i + 1 ) % sorted.length ];
	//
	// 		// const jointBoundary = TvJunctionBoundaryFactory.createJointSegment( this.junction, coord );
	//
	// 		// NOTE: Sequence of the following code is important
	// 		// this.outerBoundary.addSegment( jointBoundary );
	//
	// 		// for ( const segment of this.getLaneBoundaries( this.junction, coord, jointBoundary ) ) {
	// 		// 	this.outerBoundary.addSegment( segment );
	// 		// }
	//
	// 		// this.findAndAddCornerRoad( this.junction, coord, this.outerBoundary );
	//
	// 		// const connection = this.pickConnectingConnection( this.junction, coord, nextCoord )
	//
	// 		// if ( connection ) {
	//
	// 			// get the lane link which is connected to the lowest lane
	// 			const outerMostLane = getOutermostLaneBoundary( coord.road, coord.contact );
	// 			// const link = connection.getLaneLinks().find( link => link.isLinkedToLane( outerMostLane ) );
	//
	// 			// if ( !link ) {
	// 				// Log.warn( 'No lane link found for corner road' );
	// 			// } else {
	// 				traverseLanes( coord.road, outerMostLane.id, ( lane: TvLane ) => {
	// 					this.outerBoundary.addSegment( TvJunctionBoundaryFactory.createLaneBoundary( coord.road, lane ) );
	// 				} );
	// 			// }
	//
	// 		// }
	//
	// 	}
	// }

	update (): void {

		this.outerBoundary.clearSegments();

		const links = this.junction.getRoadLinks();

		const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

		for ( let i = 0; i < sorted.length; i++ ) {

			const coord = sorted[ i ];
			const nextCoord = sorted[ ( i + 1 ) % sorted.length ];

			const jointBoundary = TvJunctionBoundaryFactory.createJointSegment( this.junction, coord );
			this.outerBoundary.addSegment( jointBoundary );

			this.addLaneBoundaries( coord, nextCoord );

		}
	}

	private getLaneBoundaries ( junction: TvJunction, incoming: TvRoadCoord, jointBoundary: TvJointBoundary ): TvLaneBoundary[] {

		const boundaryRoad = jointBoundary.road;
		const endLane = jointBoundary.getJointLaneEnd();
		let connections = junction.getConnectionsByRoad( boundaryRoad )
			.filter( connection => connection.laneLinks.find( link => link.isLinkedToLane( endLane ) ) )
			.filter( connection => connection.isCornerConnection );

		if ( connections.length === 0 ) {
			connections = junction.getConnectionsByRoad( boundaryRoad )
				.filter( connection => connection.laneLinks.find( link => link.isLinkedToLane( endLane ) ) )
		}

		if ( connections.length === 0 ) {
			console.error( `No connections found for road ${ boundaryRoad.id } at junction ${ junction.id }` );
			return [];
		}

		const connection = connections[ 0 ];
		const link = connection.getLaneLinks().find( link => link.isLinkedToLane( endLane ) );

		if ( !link ) {
			console.error( `No lane found for connection ${ connection.id } at junction ${ junction.id }` );
			return [];
		}

		const segments = [];

		traverseLanes( connection.connectingRoad, link.to, ( lane: TvLane ) => {

			const laneBoundarySegment = TvJunctionBoundaryFactory.createLaneBoundary( connection.connectingRoad, lane )

			segments.push( laneBoundarySegment );

		} );

		return segments;
	}

	private findAndAddCornerRoad ( junction: TvJunction, incoming: TvRoadCoord, boundary: TvJunctionBoundary ): void {

		const adjacent = junction.getAdjacentRoadCoord( incoming.road );

		const connection = junction.findCornerConnection( incoming.road, adjacent.road );

		if ( !connection ) {
			Log.warn( 'No corner road found for junction connection' );
			return;
		}

		// get the lane link which is connected to the lowest lane
		const link = connection.getOuterLaneLink();

		if ( !link ) {
			Log.warn( 'No lane link found for corner road' );
			return;
		}

		traverseLanes( connection.connectingRoad, link.to, ( lane: TvLane ) => {

			boundary.addSegment( TvJunctionBoundaryFactory.createLaneBoundary( connection.connectingRoad, lane ) );

		} );

	}

	private getConnectionWithOutermostLane ( connections: TvJunctionConnection[] ): TvJunctionConnection {

		return this.findConnectionByLaneId( connections, true );

	}

	private getOuterMostCarriagewayConnection ( connections: TvJunctionConnection[] ): TvJunctionConnection {

		return this.findConnectionByLaneId( connections, false );

	}

	private findConnectionByLaneId ( connections: TvJunctionConnection[], allLanes: boolean ): TvJunctionConnection {

		let outerConnection: TvJunctionConnection | null = null;
		let maxDistanceFromZero: number = -Infinity;

		for ( const connection of connections ) {

			const laneIds = connection.getLaneLinks()
				.filter( link => allLanes || link.incomingLane.isCarriageWay() )
				.map( link => link.incomingLane.id );

			const farthestLaneId = laneIds.reduce( ( acc, id ) => Math.abs( id ) > Math.abs( acc ) ? id : acc, 0 );

			if ( Math.abs( farthestLaneId ) > maxDistanceFromZero ) {
				outerConnection = connection;
				maxDistanceFromZero = Math.abs( farthestLaneId );
			}

		}

		return outerConnection!;
	}

	public pickConnectingConnection ( from: TvRoadCoord, to: TvRoadCoord ): TvJunctionConnection | null {

		// 1) filter connections linked to from.road at from.cp lane ends
		// 2) among candidates that also reach to.road/to.cp (directly or via connectingRoad),
		//    pick the one whose turning angle matches CCW traversal best (positive smallest turn)
		// 3) tie-breaker: prefer "corner" connections for short gaps, else major through connection

		// const connections = this.junction.getConnectionsBetween( from.road, to.road );
		// const connections = this.junction.getConnections().filter( conn => {
		// 	return conn.incomingRoad.equals( from.road ) && conn.isLinkedToRoad( to.road )
		// } );

		const connections = this.junction.getConnections().filter( conn => {
			return conn.isLinkedToRoad( from.road ) && conn.isLinkedToRoad( to.road )
		} );

		if ( connections.length === 0 ) {
			throw new Error( `No connection found between ${ from.road.id } and ${ to.road.id }` );
		}

		if ( connections.length > 1 ) {
			throw new Error( `Multiple connections found between ${ from.road.id } and ${ to.road.id }` );
		}

		const connection = connections.length == 1 ? connections[ 0 ] : null;

		if ( !connection ) {
			// Log.warn( `No connections found between ${ from.road.id } and ${ to.road.id }` );
			// return null;
		}

		return connection;

	}

	public addLaneBoundaries ( from: TvRoadCoord, to: TvRoadCoord ): void {

		const link = this.getOuterLaneLink( from, to );

		if ( !link ) {
			return;
		}

		const connectingRoad = link.connectingRoad;
		const connectingLane = link.connectingLane

		traverseLanes( connectingRoad, connectingLane.id, ( lane: TvLane ) => {
			this.outerBoundary.addSegment( TvJunctionBoundaryFactory.createLaneBoundary( connectingRoad, lane ) );
		} );

	}

	public getOuterLaneLink ( from: TvRoadCoord, to: TvRoadCoord ) {

		// filter by from.road and from.contact
		// sort in descending order of lane id
		const lanelinks = this.junction.getLaneLinks()
			.filter( link => link.matchesFromAndTo( from.road, to.road ) )
			.sort( ( a, b ) => {
				return Math.abs( b.incomingLane.id ) - Math.abs( a.incomingLane.id );
			} )

		if ( lanelinks.length == 0 ) {
			console.error( `No lane links found for road ${ from.road.id } to road ${ to.road.id } at junction ${ this.junction.id }` );
			return;
		}

		return lanelinks[ lanelinks.length - 1 ];

	}

}

export function getOutermostLaneBoundary ( road: TvRoad, contact: TvContactPoint, onlyDrivingLanes = false ): TvLane {

	const laneSection = road.getLaneSectionAt( contact );

	if ( contact === TvContactPoint.END ) {

		const lanes = laneSection.getRightLanes()
			.filter( lane => onlyDrivingLanes ? lane.isDrivingLane : lane.isCarriageWay() );

		return lanes[ lanes.length - 1 ];

	} else {

		const lanes = laneSection.getLeftLanes()
			.filter( lane => onlyDrivingLanes ? lane.isDrivingLane : lane.isCarriageWay() );

		return lanes[ 0 ];
	}

}

