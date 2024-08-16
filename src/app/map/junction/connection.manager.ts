/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvRoad } from "../models/tv-road.model";
import { RoadManager } from "../../managers/road/road-manager";
import { SplineFactory } from "../../services/spline/spline.factory";
import { SplineBuilder } from "../../services/spline/spline.builder";
import { JunctionRoadService } from "../../services/junction/junction-road.service";
import { TvRoadLink, TvRoadLinkType } from "../models/tv-road-link";
import { Log } from "../../core/utils/log";
import { ConnectionFactory } from "../../factories/connection.factory";
import { RoadService } from "../../services/road/road.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunctionConnection } from "../models/junctions/tv-junction-connection";
import { TvContactPoint } from "../models/tv-common";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionManager {

	private debug = true;

	constructor (
		private roadService: RoadService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private junctionRoadService: JunctionRoadService,
		private connectionFactory: ConnectionFactory,
	) {
	}

	// const junctionLinks: TvRoadLink[] = [];

	// const junctionSplines = new Set<AbstractSpline>();

	// // TODO: we can also find all the splines which are found in junction boundary
	// this.junctionRoadService.getIncomingSplines( junction ).forEach( s => junctionSplines.add( s ) );

	// otherSplines.forEach( spline => junctionSplines.add( spline ) );

	// junctionSplines.forEach( spline => {

	// 	this.updateSplineInternalLinks( spline, false );

	// 	this.findLinksForJunction( spline, junction, junctionLinks );

	// } );

	// this.connectionManager.removeAllConnections( junction );

	// this.createConnections( junction, this.sortLinks( junctionLinks ) );

	generateConnections ( junction: TvJunction, links: TvRoadLink[] = [] ) {

		Log.info( 'Generating connections for junction', junction.toString );

		const roadLinks = this.junctionRoadService.getRoadLinks( junction );

		links.forEach( link => roadLinks.push( link ) );

		const sortedLinks: TvRoadLink[] = this.roadService.sortLinks( roadLinks );

		const centroid = this.roadService.findCentroid( sortedLinks );

		// Removing current connections
		this.removeAllConnections( junction );

		for ( let i = 0; i < sortedLinks.length; i++ ) {

			const linkA = sortedLinks[ i ];

			let rightConnectionCreated = false;

			for ( let j = i + 1; j < sortedLinks.length; j++ ) {

				const linkB = sortedLinks[ j ];

				// roads should be different
				if ( linkA.element === linkB.element ) continue;

				if ( linkA.element instanceof TvJunction || linkB.element instanceof TvJunction ) continue;

				// check if this is the first and last connection
				const isFirstAndLast = i == 0 && j == sortedLinks.length - 1;

				this.connectionFactory.addConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );
				this.connectionFactory.addConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				rightConnectionCreated = true;

			}
		}
	}

	addConnectionsForRoad ( junction: TvJunction, road: TvRoad, contact: TvContactPoint ) {

		this.generateConnections( junction, [ new TvRoadLink( TvRoadLinkType.ROAD, road, contact ) ] );

	}

	removeConnections ( junction: TvJunction, road: TvRoad ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			if ( connection.incomingRoad === road ) {

				this.roadManager.removeRoad( connection.connectingRoad );

				junction.removeConnection( connection );

			} else if ( connection.connectingRoad.successor?.element == road ) {

				this.roadManager.removeRoad( connection.connectingRoad );

				junction.removeConnection( connection );

			} else if ( connection.connectingRoad.predecessor?.element == road ) {

				this.roadManager.removeRoad( connection.connectingRoad );

				junction.removeConnection( connection );

			}

		}

	}

	updateGeometries ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.updateConnectionGeometry( junction, connection );

		}

	}

	updateConnectionGeometry ( junction: TvJunction, connection: TvJunctionConnection ) {

		const prevCoord = this.roadService.findLinkCoord( connection.connectingRoad.predecessor );

		const nextRoad = connection.connectingRoad.successor.element as TvRoad;
		const nextRoadCoord = this.roadService.findLinkCoord( connection.connectingRoad.successor );

		connection.laneLink.forEach( link => {

			if ( !connection.isCornerConnection ) {
				link.connectingLane.roadMarks.clear();
			}

			const incomingLane = link.incomingLane;
			const connectingLane = link.connectingLane;
			const outgoingLane = nextRoad.laneSections[ 0 ].getLaneById( connectingLane.successorId );

			const newSpline = SplineFactory.createManeuverSpline( prevCoord.toLaneCoord( incomingLane ), nextRoadCoord.toLaneCoord( outgoingLane ) );

			connection.connectingRoad.spline.controlPoints = newSpline.controlPoints;

			this.splineBuilder.buildGeometry( connection.connectingRoad.spline );

			if ( connection.connectingRoad.length > 1 ) {

				this.splineBuilder.buildSegments( connection.connectingRoad.spline );

			} else {

				this.roadManager.removeRoad( connection.connectingRoad );

				junction.removeConnection( connection );

			}

		} );

	}

	removeAllConnections ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadManager.removeRoad( connection.connectingRoad );

			junction.removeConnection( connection );

		}

	}
}
