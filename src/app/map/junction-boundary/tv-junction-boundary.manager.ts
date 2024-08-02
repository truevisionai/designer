import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionBoundaryFactory } from "./tv-junction-boundary.factory";
import { TvContactPoint, TvLaneSide } from "../models/tv-common";
import { TvRoad } from "../models/tv-road.model";
import { LaneUtils } from "../../utils/lane.utils";
import { TvLane } from "../models/tv-lane";
import { MeshBasicMaterial } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryManager {

	constructor () {
	}

	update ( junction: TvJunction ) {

		junction.outerBoundary = TvJunctionBoundaryFactory.createOuterBoundary( junction );
		junction.innerBoundary = TvJunctionBoundaryFactory.createInnerBoundary( junction );

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


}
