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
import { TvContactPoint, TvLaneSide } from "../models/tv-common";
import { TvRoad } from "../models/tv-road.model";
import { LaneUtils } from "app/utils/lane.utils";
import { TvJunctionLaneLink } from "../models/junctions/tv-junction-lane-link";

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

	addLaneBoundaries ( from: TvRoadCoord, to: TvRoadCoord ): void {

		const selection = this.pickOuterLaneSelection( from, to );

		if ( !selection ) {
			Log.warn( "TvJunctionBoundaryProfile", `Unable to find outer lane selection between road ${ from.road.id } and ${ to.road.id }` );
			return;
		}

		const { laneLink } = selection;
		const connectingRoad = laneLink.connectingLane.getRoad();

		traverseLanes( connectingRoad, laneLink.connectingLane.id, ( lane: TvLane ) => {
			this.outerBoundary.addSegment( TvJunctionBoundaryFactory.createLaneBoundary( connectingRoad, lane ) );
		} );
	}

	getOuterLaneLink ( from: TvRoadCoord, to: TvRoadCoord ): TvJunctionLaneLink | undefined {

		return this.pickOuterLaneSelection( from, to )?.laneLink;

	}

	private pickOuterLaneSelection ( from: TvRoadCoord, to: TvRoadCoord ): { connection: TvJunctionConnection, laneLink: TvJunctionLaneLink } | undefined {

		const connections = this.junction.getConnectionsBetween( from.road, to.road );

		if ( connections.length === 0 ) {
			return undefined;
		}

		const side = LaneUtils.findIncomingSide( from.contact );

		let bestSelection: { connection: TvJunctionConnection, laneLink: TvJunctionLaneLink } | undefined;

		for ( const connection of connections ) {

			const laneLink = this.selectOuterLaneLink( connection, from, side );

			if ( !laneLink ) continue;

			if ( !bestSelection ) {
				bestSelection = { connection, laneLink };
				continue;
			}

			if ( this.isMoreOuter( laneLink, bestSelection.laneLink, side ) ) {
				bestSelection = { connection, laneLink };
			}

		}

		if ( bestSelection ) {
			return bestSelection;
		}

		const fallbackConnection = connections[ 0 ];
		const fallbackLink = fallbackConnection.getOuterLaneLink();

		if ( fallbackLink ) {
			return { connection: fallbackConnection, laneLink: fallbackLink };
		}

		return undefined;
	}

	private selectOuterLaneLink ( connection: TvJunctionConnection, from: TvRoadCoord, side: TvLaneSide ): TvJunctionLaneLink | undefined {

		const laneLinksForRoad = connection.getLaneLinks()
			.filter( link => link.incomingLane.getRoad().equals( from.road ) );

		if ( laneLinksForRoad.length === 0 ) {
			return undefined;
		}

		const carriageWayLinks = laneLinksForRoad.filter( link => link.incomingLane.isCarriageWay() );
		const candidates = carriageWayLinks.length > 0 ? carriageWayLinks : laneLinksForRoad;

		return candidates.reduce( ( outer, link ) => {
			if ( !outer ) return link;
			return this.isMoreOuter( link, outer, side ) ? link : outer;
		}, undefined as TvJunctionLaneLink | undefined );
	}

	private isMoreOuter ( candidate: TvJunctionLaneLink, current: TvJunctionLaneLink, side: TvLaneSide ): boolean {

		const candidateId = candidate.incomingLane.id;
		const currentId = current.incomingLane.id;

		if ( side === TvLaneSide.RIGHT ) {
			return candidateId < currentId;
		} else if ( side === TvLaneSide.LEFT ) {
			return candidateId > currentId;
		}

		return Math.abs( candidateId ) > Math.abs( currentId );
	}

}

export function getOutermostLaneBoundary ( road: TvRoad, contact: TvContactPoint ): TvLane | undefined {

	const laneSection = road.getLaneProfile().getLaneSectionAtContact( contact );

	if ( !laneSection ) {
		Log.warn( "TvJunctionBoundaryProfile", `Missing lane section for road ${ road.id } at ${ contact }` );
		return road.getLaneProfile().getFirstLaneSection()?.getCenterLane();
	}

	const side = LaneUtils.findIncomingSide( contact );
	const candidateLanes = laneSection.getLanesBySide( side );

	if ( candidateLanes.length === 0 ) {
		Log.warn( "TvJunctionBoundaryProfile", `No lanes on side ${ side } for road ${ road.id }` );
		return laneSection.getCenterLane();
	}

	const carriageWay = candidateLanes.filter( lane => lane.isCarriageWay() );
	const lanesToConsider = carriageWay.length > 0 ? carriageWay : candidateLanes;

	return lanesToConsider.reduce( ( selected, lane ) => {
		if ( !selected ) return lane;
		if ( side === TvLaneSide.RIGHT ) {
			return lane.id < selected.id ? lane : selected;
		}
		if ( side === TvLaneSide.LEFT ) {
			return lane.id > selected.id ? lane : selected;
		}
		return Math.abs( lane.id ) > Math.abs( selected.id ) ? lane : selected;
	}, undefined as TvLane | undefined );

}
