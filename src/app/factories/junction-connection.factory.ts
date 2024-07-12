/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { SplineFactory } from "app/services/spline/spline.factory";
import { RoadFactory } from "./road-factory.service";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { LaneUtils } from "app/utils/lane.utils";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvLane } from "app/map/models/tv-lane";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { TvUtils } from "app/map/models/tv-utils";
import { TvLaneSection } from "app/map/models/tv-lane-section";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionConnectionFactory {

	constructor (
		private roadFactory: RoadFactory,
		private splineBuilder: SplineBuilder,
	) {
	}

	createConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner = false ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		const incomingCoords = this.createIncomingCoords( incoming, corner );

		const outgoingCoords = this.createOutgoingCoords( outgoing, corner );

		const processed = new Set<TvLane>();

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incomingCoord = incomingCoords[ i ];

			if ( incomingCoord.lane.type != TvLaneType.driving && !corner ) continue;

			if ( processed.has( incomingCoord.lane ) ) continue;

			let found = false;

			for ( let j = 0; j < outgoingCoords.length; j++ ) {

				const outgoingCoord = outgoingCoords[ j ];

				if ( outgoingCoord.lane.type != incomingCoord.lane.type ) continue;

				if ( processed.has( outgoingCoord.lane ) ) continue;

				const connection = this.createConnection( junction, incomingCoord, outgoingCoord, corner );

				junction.addConnection( connection );

				connections.push( connection );

				found = true;

				processed.add( incomingCoord.lane );

				processed.add( outgoingCoord.lane );

				break;

			}

			if ( found ) continue;

		}

		return connections;

	}

	private createIncomingCoords ( roadCoord: TvRoadCoord, corner: boolean ) {

		const direction = LaneUtils.determineDirection( roadCoord.contact );

		const lanes = roadCoord.laneSection.getLaneArray().filter( lane => lane.direction === direction );

		const coords = lanes.map( lane => roadCoord.toLaneCoord( lane ) );

		if ( this.shouldSortIncoming( roadCoord.contact, corner ) ) {
			coords.sort( ( a, b ) => a.lane.id - b.lane.id );
		}

		return coords;
	}

	private createOutgoingCoords ( roadCoord: TvRoadCoord, corner: boolean ) {

		const direction = LaneUtils.determineOutgoingDirection( roadCoord, roadCoord );

		const lanes = roadCoord.laneSection.getLaneArray().filter( lane => lane.direction === direction );

		const coords = lanes.map( lane => roadCoord.toLaneCoord( lane ) );

		if ( this.shouldSortOutgoing( roadCoord.contact, corner ) ) {
			coords.sort( ( a, b ) => a.lane.id - b.lane.id );
		}

		return coords;
	}

	private shouldSortIncoming ( contact: TvContactPoint, corner: boolean ): boolean {

		if ( corner ) {
			return contact === TvContactPoint.END ? true : false;
		}

		return contact === TvContactPoint.END ? false : true;
	}

	private shouldSortOutgoing ( contact: TvContactPoint, corner: boolean ): boolean {

		if ( corner ) {
			return contact === TvContactPoint.END ? false : true;
		}

		return contact === TvContactPoint.END ? true : false;
	}

	createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner = false ): TvJunctionConnection {

		const connectingRoad = this.createConnectingRoad( junction, incoming, outgoing );

		const connectingLane = this.createConnectingLane( connectingRoad, incoming, outgoing, corner );

		const connection = new TvJunctionConnection( junction.connections.size, incoming.road, connectingRoad, TvContactPoint.START, outgoing.road );

		this.createLink( incoming, connectingLane, connectingRoad, connection );

		if ( corner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;
	}

	createConnectingRoad ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ) {

		const road = this.roadFactory.createConnectingRoad( junction, incoming, outgoing );

		road.spline = SplineFactory.createManeuverSpline( incoming, outgoing );

		road.spline.segmentMap.set( 0, road );

		this.splineBuilder.buildSpline( road.spline );

		return road;

	}

	createConnectingLane ( connectingRoad: TvRoad, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner = false ): TvLane {

		const laneSection = connectingRoad.addGetLaneSection( 0 );

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const connectingLane = laneSection.addLane( TvLaneSide.RIGHT, -1, incoming.lane.type, false, false );

		this.createLaneWidth( incoming, connectingLane, connectingRoad, outgoing );

		this.createHeightNodes( incoming, connectingLane, connectingRoad, outgoing );

		if ( corner ) this.createRoadMarks( laneSection, incoming );

		connectingLane.predecessorId = incoming.laneId;

		connectingLane.successorId = outgoing.laneId;

		this.splineBuilder.buildSegments( connectingRoad.spline );

		return connectingLane;

	}

	private createRoadMarks ( laneSection: TvLaneSection, incoming: TvLaneCoord ) {

		laneSection.lanes.forEach( lane => {

			if ( lane.side == TvLaneSide.CENTER ) return;

			const lastRoadMark = incoming.lane.roadMarks.getLast();

			if ( lastRoadMark ) {
				lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
			}

		} );

	}

	private createLaneWidth ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, outgoing: TvLaneCoord ) {

		// for start
		// LaneUtils.copyPrevLaneWidth( incoming.lane, incoming.laneSection, incoming.road, connectingLane );

		const roadLength = connectingRoad.length;

		const widhtAtStart = incoming.lane.getWidthValue( incoming.s );

		const widthAtEnd = outgoing.lane.getWidthValue( outgoing.s );

		connectingLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

		connectingLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );

		TvUtils.computeCoefficients( connectingLane.width, roadLength );

	}

	createHeightNodes ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, outgoing: TvLaneCoord ) {

		const roadLength = connectingRoad.length;

		const startHeight = incoming.lane.getHeightValue( incoming.s );

		const endHeight = outgoing.lane.getHeightValue( outgoing.s );

		// if ( startHeight.inner > 0 || startHeight.outer > 0 ) {
		connectingLane.addHeightRecord( 0, startHeight.inner, startHeight.outer );
		// }

		// if ( endHeight.inner > 0 || endHeight.outer > 0 ) {
		connectingLane.addHeightRecord( roadLength, endHeight.inner, endHeight.outer );
		// }
	}

	createLink ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, connection: TvJunctionConnection ) {

		const link = new TvJunctionLaneLink( incoming.lane, connectingLane );

		link.incomingRoad = incoming.road;
		link.incomingContactPoint = incoming.contact;

		link.connectingRoad = connectingRoad;
		link.connectingContactPoint = TvContactPoint.START;

		connection.addLaneLink( link );
	}

}
