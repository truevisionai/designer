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

export class TvJunctionBoundaryProfile {

	constructor (
		private junction: TvJunction,
		private outerBoundary?: TvJunctionBoundary,
	) {
		this.outerBoundary = outerBoundary || new TvJunctionBoundary();
	}

	getOuterBoundary (): TvJunctionBoundary {
		return this.outerBoundary;
	}

	setOuterBoundary ( boundary: TvJunctionBoundary ): void {
		this.outerBoundary = boundary;
	}

	update (): void {

		this.outerBoundary.clearSegments();

		const links = this.junction.getRoadLinks();

		const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

		sorted.forEach( coord => {

			const jointBoundary = TvJunctionBoundaryFactory.createJointSegment( this.junction, coord );

			// NOTE: Sequence of the following code is important
			this.outerBoundary.addSegment( jointBoundary );

			// this.getLaneBoundaries( this.junction, coord, jointBoundary ).forEach( segment => {
			// 	this.outerBoundary.addSegment( segment );
			// } );

			this.findAndAddCornerRoad( this.junction, coord, this.outerBoundary );

		} );
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

}
