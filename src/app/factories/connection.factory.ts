/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
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
import { LaneLinkFactory } from "./lane-link-factory";
import { RightTurnConnection } from "../map/models/connections/right-turn-connection";
import { StraightConnection } from "../map/models/connections/straight-connection";
import { LeftTurnConnection } from "../map/models/connections/left-turn-connection";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { determineTurnType } from "app/map/models/connections/connection-utils";

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

	public addCornerConnections ( junction: TvJunction ): void {

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

	public addConnectionsNew ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, isCorner: boolean = false ): void {

		const connection = ConnectionFactory.createConnectionAndRoad( junction, incoming, outgoing );

		if ( isCorner ) connection.markAsCornerConnection();

		const links = LaneLinkFactory.createLinks( connection )

		if ( links.length === 0 ) {
			Log.debug( 'No links found', connection.toString() );
			return;
		}

		connection.addLaneLinks( links );

		connection.connectingRoad.spline = this.createConnectionSpline( connection, links, incoming, outgoing );

		junction.addConnection( connection );

	}

	private createConnectionSpline ( connection: TvJunctionConnection, links: TvJunctionLaneLink[], incoming: TvRoadCoord, outgoing: TvRoadCoord ): AbstractSpline {

		if ( links.length === 0 ) {
			throw new Error( 'No links found' );
		}

		const innerLink = links[ 0 ];

		const incomingLaneCoord = incoming.toLaneCoord( innerLink.getIncomingLane() );
		const outgoingLaneCoord = outgoing.toLaneCoord( innerLink.getOutgoingLane() );

		const spline = SplineFactory.createFromLaneCoords( incomingLaneCoord, outgoingLaneCoord );

		spline.addSegment( 0, connection.getRoad() );

		spline.updateSegmentGeometryAndBounds();

		return spline;
	}

	static createConnectionAndRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, type?: TurnType ): TvJunctionConnection {

		const connectingRoad = this.createConnectingRoad( junction, incoming, outgoing );

		const connection = this.createConnection( connectingRoad, incoming, outgoing, type );

		return connection;

	}

	private static createConnection ( connectingRoad: TvRoad, incoming: TvRoadCoord, outgoing: TvRoadCoord, type?: TurnType ): TvJunctionConnection {

		const turnType = type || determineTurnType( incoming, outgoing );

		let connection: TvJunctionConnection;

		if ( turnType == TurnType.RIGHT ) {

			connection = new RightTurnConnection( 0, incoming.road, connectingRoad, TvContactPoint.START );

		} else if ( turnType == TurnType.STRAIGHT ) {

			connection = new StraightConnection( 0, incoming.road, connectingRoad, TvContactPoint.START );

		} else if ( turnType == TurnType.LEFT ) {

			connection = new LeftTurnConnection( 0, incoming.road, connectingRoad, TvContactPoint.START );

		} else {

			throw new Error( 'Unknown turn type' );

		}

		return connection;

	}

	private static createConnectingRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvRoad {

		const roadId = incoming.road.getMap().generateRoadId( false );

		const connectingRoad = RoadFactory.createRoad( roadId );

		connectingRoad.setPredecessorRoad( incoming.road, incoming.contact );

		connectingRoad.setSuccessorRoad( outgoing.road, outgoing.contact );

		connectingRoad.junction = junction;

		// connectingRoad.spline = SplineFactory.createFromRoadCoords( incoming, outgoing );

		// connectingRoad.spline.addSegment( 0, connectingRoad );

		// connectingRoad.getLaneProfile().addDefaultLaneSection();

		// connectingRoad.spline.updateSegmentGeometryAndBounds();

		return connectingRoad;

	}

	public addConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean = false ): void {

		this.addConnectionsNew( junction, incoming, outgoing, corner );

		// const incomingLaneCoords = incoming.laneSection.getIncomingCoords( incoming.contact, corner );
		// const outgoingLaneCoords = outgoing.laneSection.getOutgoingCoords( outgoing.contact, corner );
		//
		// const processedLanes = new Set<TvLane>();
		//
		// const rightMostLane: TvLane = incoming.laneSection.getRightMostIncomingLane( incoming.contact );
		// const leftMostLane: TvLane = incoming.laneSection.getLeftMostIncomingLane( incoming.contact );
		//
		// for ( const entryLaneCoord of incomingLaneCoords ) {
		//
		// 	if ( processedLanes.has( entryLaneCoord.lane ) ) continue;
		//
		// 	if ( !corner && entryLaneCoord.lane.type !== TvLaneType.driving ) continue;
		//
		// 	let found = false;
		//
		// 	for ( const exitLaneCoord of outgoingLaneCoords ) {
		//
		// 		if ( exitLaneCoord.lane.type != entryLaneCoord.lane.type ) continue;
		//
		// 		if ( processedLanes.has( exitLaneCoord.lane ) ) continue;
		//
		// 		const turnType = determineTurnType( entryLaneCoord, exitLaneCoord );
		//
		// 		if ( turnType == TurnType.RIGHT || corner ) {
		// 			if ( incoming.contact == TvContactPoint.END && entryLaneCoord.lane.id > rightMostLane?.id ) {
		// 				continue;
		// 			}
		// 			if ( incoming.contact == TvContactPoint.START && entryLaneCoord.lane.id < rightMostLane?.id ) {
		// 				continue;
		// 			}
		// 		} else if ( turnType == TurnType.LEFT ) {
		// 			if ( incoming.contact == TvContactPoint.END && entryLaneCoord.lane.id < leftMostLane?.id ) {
		// 				continue;
		// 			}
		// 			if ( incoming.contact == TvContactPoint.START && entryLaneCoord.lane.id > leftMostLane?.id ) {
		// 				continue;
		// 			}
		// 		}
		//
		// 		if ( this.debug ) Log.debug( 'turnType', turnType, entryLaneCoord.toString(), exitLaneCoord.toString() );
		//
		// 		const connection = this.createConnection( junction, entryLaneCoord, exitLaneCoord, corner );
		//
		// 		if ( junction.hasMatchingConnection( connection ) ) continue;
		//
		// 		junction.addConnection( connection );
		//
		// 		processedLanes.add( entryLaneCoord.lane );
		//
		// 		processedLanes.add( exitLaneCoord.lane );
		//
		// 		found = true;
		//
		// 		break;
		//
		// 	}
		//
		// 	if ( found ) continue;
		//
		// }

	}

	public createSingleConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvJunctionConnection {

		const turnType = determineTurnType( incoming, outgoing );

		if ( this.debug ) Log.debug( 'turnType', turnType, incoming.toString(), outgoing.toString() );

		const connection = this.createConnection( junction, incoming, outgoing, false );

		if ( junction.hasMatchingConnection( connection ) ) return;

		return connection;

	}

	public createFakeCorners ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): void {

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
		connection.connectingRoad.getLaneProfile().addLaneSection( clone );

		connection.connectingRoad.laneSections.forEach( laneSection => {
			laneSection.getLanes().forEach( lane => {
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

	private createConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner: boolean = false ): TvJunctionConnection {

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

	private createConnectingRoad ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvRoad {

		const road = this.roadFactory.createConnectingRoad( junction, incoming, outgoing );

		road.spline = SplineFactory.createFromLaneCoords( incoming, outgoing );

		road.spline.addSegment( 0, road );

		this.splineBuilder.buildGeometry( road.spline );

		return road;

	}

	private createFakeConnection ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner: boolean = false ): TvJunctionConnection {

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

	private createFakeConnectingRoad ( junction: TvJunction, entry: TvLaneCoord, exit: TvLaneCoord ): TvRoad {

		const road = this.roadFactory.createFakeRoad();

		road.junction = junction;

		road.setPredecessorRoad( entry.road, entry.contact );

		road.setSuccessorRoad( exit.road, exit.contact );

		road.spline = SplineFactory.createFromLaneCoords( entry, exit );

		road.spline.addSegment( 0, road );

		this.splineBuilder.buildGeometry( road.spline );

		return road;

	}

	private createConnectingLane ( connectingRoad: TvRoad, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner: boolean = false ): TvLane {

		const laneSection = connectingRoad.getLaneProfile().addDefaultLaneSection();

		laneSection.createCenterLane( 0, TvLaneType.none, false, false );

		const connectingLane = laneSection.createRightLane( -1, incoming.lane.type, false, false );

		this.createLaneWidth( incoming, connectingLane, connectingRoad, outgoing );

		this.createHeightNodes( incoming, connectingLane, connectingRoad, outgoing );

		if ( corner ) this.createRoadMarks( laneSection, incoming );

		connectingLane.setLinks( incoming.lane, outgoing.lane );

		this.splineBuilder.buildGeometry( connectingRoad.spline );

		connectingRoad.computeLaneSectionCoordinates();

		return connectingLane;

	}

	private createRoadMarks ( laneSection: TvLaneSection, incoming: TvLaneCoord ): void {

		laneSection.getLanes().forEach( lane => {

			if ( lane.isCenter ) return;

			const lastRoadMark = incoming.lane.roadMarks.getLast();

			if ( lastRoadMark ) {
				lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
			}

		} );

	}

	private createLaneWidth ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, outgoing: TvLaneCoord ): void {

		// for start
		// LaneUtils.copyPrevLaneWidth( incoming.lane, incoming.laneSection, incoming.road, connectingLane );

		const roadLength = connectingRoad.length;

		const widhtAtStart = incoming.lane.getWidthValue( incoming.laneDistance );

		const widthAtEnd = outgoing.lane.getWidthValue( outgoing.laneDistance );

		connectingLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );

		connectingLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );

		connectingLane.updateWidthCoefficients();

	}

	private createHeightNodes ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, outgoing: TvLaneCoord ): void {

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

	private createLink ( incoming: TvLaneCoord, connectingLane: TvLane, connectingRoad: TvRoad, connection: TvJunctionConnection ): void {

		const link = new TvJunctionLaneLink( incoming.lane, connectingLane );

		connection.addLaneLink( link );
	}


}
