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
import { TurnType, TvContactPoint, TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { LaneUtils } from "app/utils/lane.utils";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvLane } from "app/map/models/tv-lane";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";
import { TvUtils } from "app/map/models/tv-utils";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { Log } from "app/core/utils/log";
import { Maths } from "app/utils/maths";
import { LinkFactory } from 'app/map/models/link-factory';
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { RoadWidthService } from "app/services/road/road-width.service";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionFactory {

	private debug = false;

	constructor (
		private roadFactory: RoadFactory,
		private splineBuilder: SplineGeometryGenerator,
	) {
	}

	public addCornerConnections ( junction: TvJunction ) {

		junction.corners = [];

		const coords = junction.getRoadCoords();

		for ( let i = 0; i < coords.length; i++ ) {

			const incoming = coords[ i ];

			for ( let j = 0; j < coords.length; j++ ) {

				const outgoing = coords[ j ];

				if ( incoming.road == outgoing.road ) continue;

				this.createFakeCorners( junction, incoming, outgoing );

			}

		}

	}

	addConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner = false ): void {

		const incomingCoords = incoming.laneSection.getIncomingCoords( incoming.contact, corner );
		const outgoingCoords = outgoing.laneSection.getOutgoingCoords( outgoing.contact, corner );

		const processedLanes = new Set<TvLane>();

		const rightMostLane: TvLane = incoming.laneSection.getRightMostIncomingLane( incoming.contact );
		const leftMostLane: TvLane = incoming.laneSection.getLeftMostIncomingLane( incoming.contact );

		for ( let i = 0; i < incomingCoords.length; i++ ) {

			const incomingCoord = incomingCoords[ i ];

			if ( processedLanes.has( incomingCoord.lane ) ) continue;

			if ( !corner && incomingCoord.lane.type != TvLaneType.driving ) continue;

			let found = false;

			for ( let j = 0; j < outgoingCoords.length; j++ ) {

				const outgoingCoord = outgoingCoords[ j ];

				if ( outgoingCoord.lane.type != incomingCoord.lane.type ) continue;

				if ( processedLanes.has( outgoingCoord.lane ) ) continue;

				const turnType = LaneUtils.determineTurnType( incomingCoord, outgoingCoord );

				if ( turnType == TurnType.RIGHT || corner ) {
					if ( incoming.contact == TvContactPoint.END && incomingCoord.lane.id > rightMostLane?.id ) {
						continue;
					}
					if ( incoming.contact == TvContactPoint.START && incomingCoord.lane.id < rightMostLane?.id ) {
						continue;
					}
				} else if ( turnType == TurnType.LEFT ) {
					if ( incoming.contact == TvContactPoint.END && incomingCoord.lane.id < leftMostLane?.id ) {
						continue;
					}
					if ( incoming.contact == TvContactPoint.START && incomingCoord.lane.id > leftMostLane?.id ) {
						continue;
					}
				}

				if ( this.debug ) Log.debug( 'turnType', turnType, incomingCoord.toString(), outgoingCoord.toString() );

				const connection = this.createConnection( junction, incomingCoord, outgoingCoord, corner );

				if ( this.hasConnection( junction, connection ) ) continue;

				junction.addConnection( connection );

				processedLanes.add( incomingCoord.lane );

				processedLanes.add( outgoingCoord.lane );

				found = true;

				break;

			}

			if ( found ) continue;

		}

	}

	public createSingleConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection {

		const turnType = LaneUtils.determineTurnType( incoming, outgoing );

		if ( this.debug ) Log.debug( 'turnType', turnType, incoming.toString(), outgoing.toString() );

		const connection = this.createConnection( junction, incoming, outgoing, false );

		if ( this.hasConnection( junction, connection ) ) return;

		return connection;

	}

	private createCornerConnection ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean ) {

		let rightLane: TvLane;
		let leftLane: TvLane;

		if ( incoming.contact == TvContactPoint.END ) {
			rightLane = LaneUtils.findLowest( incoming.laneSection.getLaneArray() );
		} else {
			rightLane = LaneUtils.findHighest( incoming.laneSection.getLaneArray() );
		}

		if ( outgoing.contact == TvContactPoint.END ) {
			leftLane = LaneUtils.findHighest( outgoing.laneSection.getLaneArray() );
		} else {
			leftLane = LaneUtils.findLowest( outgoing.laneSection.getLaneArray() );
		}

		console.log( 'fake incomingRightMost', rightLane?.toString() );
		console.log( 'fake outgoingLeftMost', leftLane?.toString() );

		const incomingCoord = incoming.toLaneCoord( rightLane );
		const outgoingCoord = outgoing.toLaneCoord( leftLane );

		// pass corner as false to avoid creating roadmarks and other corner specific stuff
		const connection = this.createConnection( junction, incomingCoord, outgoingCoord, false );

		if ( incoming.contact == TvContactPoint.START ) {
			const width = rightLane.getWidthValue( 0 );
			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( 0, width, 0, 0, 0 );
		} else {
			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( 0, 0, 0, 0, 0 );
		}

		if ( outgoing.contact == TvContactPoint.END ) {
			const width = leftLane.getWidthValue( 0 );
			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( connection.connectingRoad.length, width, 0, 0, 0 );
		} else {
			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( connection.connectingRoad.length, 0, 0, 0, 0 );
		}

		TvUtils.computeCoefficients( connection.connectingRoad.laneOffsets, connection.connectingRoad.length );

		return connection;

	}

	public createFakeCorners ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		const rightLane = ( incoming.contact == TvContactPoint.END )
			? LaneUtils.findLowest( incoming.lanes )
			: LaneUtils.findHighest( incoming.lanes );

		const leftLane = ( outgoing.contact == TvContactPoint.END )
			? LaneUtils.findHighest( outgoing.lanes )
			: LaneUtils.findLowest( outgoing.lanes );

		const incomingCoord = incoming.toLaneCoord( rightLane );
		const outgoingCoord = outgoing.toLaneCoord( leftLane );

		// pass corner as false to avoid creating roadmarks and other corner specific stuff
		const connection = this.createFakeConnection( junction, incomingCoord, outgoingCoord, true );
		connection.connectingRoad.laneSections.splice( 0, 1 );
		const clone = incoming.laneSection.cloneAtS( 0, 0, false, connection.connectingRoad );
		connection.connectingRoad.getLaneProfile().addLaneSectionInstance( clone );

		connection.connectingRoad.laneSections.forEach( laneSection => {
			laneSection.lanesMap.forEach( lane => {
				lane.roadMarks.clear()
			} )
		} );

		if ( incoming.contact == TvContactPoint.START ) {

			const size = RoadWidthService.instance.findRoadWidthAt( incoming.road, incoming.s );

			const diff = size.rightSideWidth - size.leftSideWidth;

			const widthUpto = RoadGeometryService.instance.findWidthUpto( incoming.road, incoming.laneSection, rightLane, incoming.s );

			const offset = Maths.approxEquals( diff, 0 ) ? widthUpto - rightLane.getWidthValue( incoming.s ) : diff;

			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( 0, offset, 0, 0, 0 );

		} else {

			const size = RoadWidthService.instance.findRoadWidthAt( incoming.road, incoming.s );

			const diff = size.rightSideWidth - size.leftSideWidth;

			const widthUpto = RoadGeometryService.instance.findWidthUpto( incoming.road, incoming.laneSection, rightLane, incoming.s );

			// const offset = Maths.approxEquals( diff, 0 ) ? widthUpto - rightLane.getWidthValue( incoming.s ) : diff - rightLane.getWidthValue( incoming.s );
			const offset = widthUpto - rightLane.getWidthValue( incoming.s );

			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( 0, offset, 0, 0, 0 );
		}

		if ( outgoing.contact == TvContactPoint.END ) {

			const size = RoadWidthService.instance.findRoadWidthAt( outgoing.road, 0 );

			const diff = size.rightSideWidth - size.leftSideWidth;

			const widthUpto = RoadGeometryService.instance.findWidthUpto( outgoing.road, outgoing.laneSection, leftLane, 0 );

			const offset = Maths.approxEquals( diff, 0 ) ? widthUpto - leftLane.getWidthValue( 0 ) : diff + widthUpto - leftLane.getWidthValue( 0 );

			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( connection.connectingRoad.length, offset, 0, 0, 0 );

		} else {

			const size = RoadWidthService.instance.findRoadWidthAt( incoming.road, 0 );

			const diff = size.rightSideWidth - size.leftSideWidth;

			const offset = size.rightSideWidth - leftLane.getWidthValue( 0 );

			connection.connectingRoad.getLaneProfile().createAndAddLaneOffset( connection.connectingRoad.length, offset, 0, 0, 0 );

		}


		TvUtils.computeCoefficients( connection.connectingRoad.laneOffsets, connection.connectingRoad.length );

		junction.corners.push( connection );

	}

	// private createFakeConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean ) {

	// 	const connections: TvJunctionConnection[] = [];

	// 	const incomingCoords = LaneUtils.createIncomingCoords( incoming, corner, false );
	// 	const outgoingCoords = LaneUtils.createOutgoingCoords( outgoing, corner, false );

	// 	for ( let i = 0; i < incomingCoords.length; i++ ) {

	// 		const incomingCoord = incomingCoords[ i ];

	// 		if ( incomingCoord.lane.type != TvLaneType.driving ) continue;

	// 		for ( let j = 0; j < outgoingCoords.length; j++ ) {

	// 			const outgoingCoord = outgoingCoords[ j ];

	// 			if ( outgoingCoord.lane.type != TvLaneType.driving ) continue;

	// 			const connection = this.createConnection( junction, incomingCoord, outgoingCoord, false );

	// 			connections.push( connection );

	// 			junction.addConnection( connection );

	// 		}

	// 	}

	// 	return connections;
	// }

	// private createFakeConnectionsV2 ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean ) {

	// 	const connections: TvJunctionConnection[] = [];

	// 	const incomingCoords = LaneUtils.createIncomingCoords( incoming, corner, false );

	// 	for ( let i = 0; i < incomingCoords.length; i++ ) {

	// 		const incomingCoord = incomingCoords[ i ];

	// 		// const outgoingLane = outgoing.laneSection.getNearestLane( incomingCoord.lane );
	// 		const outgoingLane = TvLaneSection.getNearestLane( outgoing.laneSection.getLaneArray(), incomingCoord.lane );

	// 		if ( !outgoingLane ) continue;

	// 		const outgoingCoord = outgoing.toLaneCoord( outgoingLane );

	// 		const connection = this.createConnection( junction, incomingCoord, outgoingCoord, false );

	// 		connections.push( connection );

	// 	}

	// 	return connections;
	// }

	// private createFakeConnectionsV3 ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean ) {

	// 	const leftLink = new TvRoadLink( TvRoadLinkType.ROAD, incoming.road, incoming.contact );
	// 	const rightLink = new TvRoadLink( TvRoadLinkType.ROAD, outgoing.road, outgoing.contact );

	// 	const road = this.roadFactory.createNewRoad();

	// 	road.spline = this.splineFactory.createSplineFromLinks( leftLink, rightLink );

	// 	road.junction = junction;

	// 	road.spline.segmentMap.set( 0, road );

	// 	this.splineBuilder.buildGeometry( road.spline );

	// 	// const laneSections = this.laneSectionFactory.createFromRoadLink( road, leftLink, rightLink );

	// 	// laneSections.forEach( laneSection => road.getLaneProfile().addLaneSectionInstance( laneSection ) );

	// 	road.getLaneProfile().addLaneSectionInstance( incoming.laneSection.cloneAtS( 0, 0, false, road ) );

	// 	road.laneSections.forEach( laneSection => {
	// 		laneSection.lanes.forEach( lane => {
	// 			lane.roadMarks.clear()
	// 		} )
	// 	} );

	// 	const connection = new TvJunctionConnection( junction.connections.size, incoming.road, road, TvContactPoint.START );

	// 	junction.addConnection( connection );

	// 	return [ connection ];
	// }

	private createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner = false ): TvJunctionConnection {

		const connectingRoad = this.createConnectingRoad( junction, incoming, outgoing );

		const connectingLane = this.createConnectingLane( connectingRoad, incoming, outgoing, corner );

		const connection = new TvJunctionConnection( junction.getConnectionCount(), incoming.road, connectingRoad, TvContactPoint.START );

		this.createLink( incoming, connectingLane, connectingRoad, connection );

		if ( corner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;
	}

	private createConnectingRoad ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ) {

		const road = this.roadFactory.createConnectingRoad( junction, incoming, outgoing );

		road.spline = SplineFactory.createManeuverSpline( incoming, outgoing );

		road.spline.addSegment( 0, road );

		this.splineBuilder.buildGeometry( road.spline );

		return road;

	}

	private createFakeConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner = false ): TvJunctionConnection {

		const connectingRoad = this.createFakeConnectingRoad( junction, incoming, outgoing );

		const connectingLane = this.createConnectingLane( connectingRoad, incoming, outgoing, corner );

		const connection = new TvJunctionConnection( junction.getConnectionCount(), incoming.road, connectingRoad, TvContactPoint.START );

		this.createLink( incoming, connectingLane, connectingRoad, connection );

		if ( corner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;

	}

	private createFakeConnectingRoad ( junction: TvJunction, entry: TvLaneCoord, exit: TvLaneCoord ) {

		const road = this.roadFactory.createFakeRoad();

		road.junction = junction;

		road.predecessor = LinkFactory.createRoadLink( entry.road, entry.contact );

		road.successor = LinkFactory.createRoadLink( exit.road, exit.contact );

		road.spline = SplineFactory.createManeuverSpline( entry, exit );

		road.spline.addSegment( 0, road );

		this.splineBuilder.buildGeometry( road.spline );

		return road;

	}

	private createConnectingLane ( connectingRoad: TvRoad, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner = false ): TvLane {

		const laneSection = connectingRoad.getLaneProfile().addGetLaneSection( 0 );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		const connectingLane = laneSection.createLane( TvLaneSide.RIGHT, -1, incoming.lane.type, false, false );

		this.createLaneWidth( incoming, connectingLane, connectingRoad, outgoing );

		this.createHeightNodes( incoming, connectingLane, connectingRoad, outgoing );

		if ( corner ) this.createRoadMarks( laneSection, incoming );

		connectingLane.predecessorId = incoming.laneId;

		connectingLane.successorId = outgoing.laneId;

		this.splineBuilder.buildGeometry( connectingRoad.spline );

		connectingRoad.computeLaneSectionCoordinates();

		return connectingLane;

	}

	private createRoadMarks ( laneSection: TvLaneSection, incoming: TvLaneCoord ) {

		laneSection.lanesMap.forEach( lane => {

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

		const widhtAtStart = incoming.lane.getWidthValue( incoming.laneDistance );

		const widthAtEnd = outgoing.lane.getWidthValue( outgoing.laneDistance );

		connectingLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

		connectingLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );

		TvUtils.computeCoefficients( connectingLane.width, roadLength );

	}

	private determineConnectionType ( incomingCoord: TvLaneCoord, outgoingCoord: TvLaneCoord ): string {

		const incomingLaneId = incomingCoord.lane.id;
		const outgoingLaneId = outgoingCoord.lane.id;

		if ( incomingCoord.contact === TvContactPoint.START ) {

			if ( incomingLaneId === outgoingLaneId ) {
				return "straight";
			} else if ( incomingLaneId > outgoingLaneId ) {
				return "left";
			} else {
				return "right";
			}

		} else { // TvContactPoint.END
			if ( incomingLaneId === outgoingLaneId ) {
				return "straight";
			} else if ( incomingLaneId < outgoingLaneId ) {
				return "left";
			} else {
				return "right";
			}
		}

	}

	private createHeightNodes ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, outgoing: TvLaneCoord ) {

		const roadLength = connectingRoad.length;

		const startHeight = incoming.lane.getHeightValue( incoming.laneDistance );

		const endHeight = outgoing.lane.getHeightValue( outgoing.laneDistance );

		// if ( startHeight.inner > 0 || startHeight.outer > 0 ) {
		connectingLane.addHeightRecord( 0, startHeight.inner, startHeight.outer );
		// }

		// if ( endHeight.inner > 0 || endHeight.outer > 0 ) {
		connectingLane.addHeightRecord( roadLength, endHeight.inner, endHeight.outer );
		// }
	}

	private createLink ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, connection: TvJunctionConnection ) {

		const link = new TvJunctionLaneLink( incoming.lane, connectingLane );

		link.incomingRoad = incoming.road;
		link.connectingRoad = connectingRoad;

		connection.addLaneLink( link );
	}

	private hasConnection ( junction: TvJunction, target: TvJunctionConnection ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			if ( connection.matches( target ) ) {
				return true;
			}

		}

		return false;
	}

}
