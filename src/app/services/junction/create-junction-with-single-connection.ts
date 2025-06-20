/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Log } from "app/core/utils/log";
import { ConnectionFactory } from "app/factories/connection.factory";
import { determineTurnType } from "app/map/models/connections/connection-utils";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { TvLink } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { SplineFactory } from "../spline/spline.factory";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvLaneType } from "app/map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { RoadFactory } from "app/factories/road-factory.service";
import { SplineGeometryGenerator } from "../spline/spline-geometry-generator";

export class AddJunctionConnectionForEachLane {

	private debug = false;

	private connections = new Set<TvJunctionConnection>();

	private used = new Set<string>();

	constructor ( private roadFactory: RoadFactory, private splineBuilder: SplineGeometryGenerator ) { }

	add ( junction: TvJunction, roadLinks: TvLink[] ): void {

		for ( let i = 0; i < roadLinks.length; i++ ) {

			const linkA = roadLinks[ i ];

			let rightConnectionCreated = false;

			for ( let j = i + 1; j < roadLinks.length; j++ ) {

				const linkB = roadLinks[ j ];

				// check if this is the first and last connection
				const isFirstAndLast = i == 0 && j == roadLinks.length - 1

				if ( this.shouldSkipLinkPair( linkA, linkB ) ) continue;

				linkA.linkJunction( junction );
				linkB.linkJunction( junction );

				this.addConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );
				this.addConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				rightConnectionCreated = true;

			}

		}

		for ( const connection of this.connections ) {

			junction.addConnection( connection );

		}

		if ( this.debug ) Log.debug( 'Connections created', this.connections.size );
		if ( this.debug ) Log.debug( 'Connections', this.connections );
		if ( this.debug ) Log.debug( 'Junction', junction );

	}

	private addConnections ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, corner: boolean ): void {

		const turnType = determineTurnType( incoming, outgoing );

		const helper = ConnectionFactory.createConnectionAndRoad( junction, incoming, outgoing, turnType );

		if ( corner ) helper.markAsCornerConnection();

		const entries = helper.getEntryCoords();
		const exits = helper.getExitCoords();

		if ( this.debug ) Log.debug( 'Helper', helper.toString() );
		if ( this.debug ) Log.debug( 'Entries', entries.map( entry => entry.lane.id ), 'Exits', exits.map( exit => exit.lane.id ) );

		let lastConnection: TvJunctionConnection | undefined;

		for ( const entry of entries ) {

			// if ( this.used.has( `${ entry.lane.uuid }${ turnType }` ) ) continue;

			const exit = this.findBestExit( turnType, entry, exits );

			if ( !exit ) {
				Log.debug( 'No exit found for entry', entry.toString() );
				lastConnection = undefined;
				continue;
			}

			lastConnection = this.createSingleConnection( junction, entry, exit, corner, lastConnection );

			this.connections.add( lastConnection );

			this.used.add( `${ entry.lane.uuid }${ turnType }` );
			this.used.add( `${ exit.lane.uuid }${ turnType }` );

		}

	}

	private findBestExit ( turnType, entry: TvLaneCoord, exits: TvLaneCoord[] ): TvLaneCoord | undefined {

		let bestExit: TvLaneCoord | undefined;
		let bestDistance = Number.MAX_VALUE;

		for ( const exit of exits ) {

			if ( this.used.has( `${ exit.lane.uuid }${ turnType }` ) ) {
				continue;
			}

			if ( !entry.canConnect( exit ) ) {
				continue;
			}

			return exit;

			// const distance = entry.distanceTo( exit );

			// if ( distance < bestDistance ) {
			// 	bestDistance = distance;
			// 	bestExit = exit;
			// }

		}

		return bestExit;

	}


	private createSingleConnection ( junction: TvJunction, entry: TvLaneCoord, exit: TvLaneCoord, corner: boolean, lastConnection?: TvJunctionConnection ): TvJunctionConnection {

		const connection = lastConnection || this.createFromLaneCoord( junction, entry, exit, corner );

		const connectingRoad = connection.connectingRoad;

		const connectingLane = this.createConnectingLane( connectingRoad, entry, exit, corner );

		connection.addLaneLink( new TvJunctionLaneLink( entry.lane, connectingLane ) );

		if ( junction.hasMatchingConnection( connection ) ) {
			Log.debug( 'Connection already exists', connection.toString() );
			return connection;
		}

		return connection;

	}

	private createFromLaneCoord ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord, corner: boolean = false ): TvJunctionConnection {

		const connectingRoad = this.createConnectingRoad( junction, incoming, outgoing );

		const turnType = determineTurnType( incoming, outgoing );

		const connection = ConnectionFactory.createConnectionOfType( turnType, {
			incomingRoad: incoming.road,
			connectingRoad: connectingRoad,
		} )

		if ( corner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;
	}

	private createConnectingRoad ( junction: TvJunction, incoming: TvLaneCoord, outgoing: TvLaneCoord ): TvRoad {

		const road = this.roadFactory.createConnectingRoad( junction, incoming, outgoing );

		const spline = SplineFactory.createFromLaneCoord( incoming, outgoing );

		if ( !( incoming.isEntry() && outgoing.isExit() || incoming.isExit() && outgoing.isEntry() ) ) {
			console.warn( 'Creating a connection that is not an entry/exit pair', incoming.toString(), outgoing.toString() );
		}

		road.setSplineAndSegment( spline );

		this.splineBuilder.buildGeometry( spline );

		return road;

	}

	private shouldSkipLinkPair ( linkA: TvLink, linkB: TvLink ): boolean {

		// roads should be different
		if ( linkA.element === linkB.element ) return true;

		if ( linkA.element instanceof TvJunction || linkB.element instanceof TvJunction ) return true;

		return false;

	}

	private createConnectingLane ( connectingRoad: TvRoad, entry: TvLaneCoord, exit: TvLaneCoord, corner: boolean = false ): TvLane {

		const laneSection = connectingRoad.getLaneProfile().addDefaultLaneSection();

		laneSection.createCenterLane( 0, TvLaneType.none, false, false );

		const id = laneSection.getLaneCount() * -1;

		const connectingLane = laneSection.createRightLane( id, entry.lane.type, false, true );

		this.createLaneWidth( entry, connectingLane, connectingRoad, exit );

		this.createHeightNodes( entry, connectingLane, connectingRoad, exit );

		// if ( corner ) this.createRoadMarks( laneSection, incoming );

		connectingLane.setLinks( entry.lane, exit.lane );

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


}
