/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvRoad } from "../models/tv-road.model";
import { SplineGeometryGenerator } from "../../services/spline/spline-geometry-generator";
import { TvLink } from "../models/tv-link";
import { LinkFactory } from '../models/link-factory';
import { Log } from "../../core/utils/log";
import { ConnectionFactory } from "../../factories/connection.factory";
import { TvJunctionConnection } from "../models/connections/tv-junction-connection";
import { TvContactPoint } from "../models/tv-common";
import { ConnectionGeometryService } from "app/services/junction/connection-geometry.service";
import { GeometryUtils } from "app/services/surface/geometry-utils";

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionManager {

	constructor (
		private splineBuilder: SplineGeometryGenerator,
		private connectionFactory: ConnectionFactory,
		private connectionGeometryService: ConnectionGeometryService,
	) {
	}

	addConnectionsFromLinks ( junction: TvJunction, links: TvLink[] ): void {

		for ( let i = 0; i < links.length; i++ ) {

			const linkA = links[ i ];

			let rightConnectionCreated = false;

			for ( let j = i + 1; j < links.length; j++ ) {

				const linkB = links[ j ];

				// check if this is the first and last connection
				const isFirstAndLast = i == 0 && j == links.length - 1

				if ( this.shouldSkipLinkPair( linkA, linkB ) ) continue;

				linkA.linkJunction( junction );
				linkB.linkJunction( junction );

				this.connectionFactory.addConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );
				this.connectionFactory.addConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				rightConnectionCreated = true;

			}

		}

	}

	private shouldSkipLinkPair ( linkA: TvLink, linkB: TvLink ): boolean {

		// roads should be different
		if ( linkA.element === linkB.element ) return true;

		if ( linkA.element instanceof TvJunction || linkB.element instanceof TvJunction ) return true;

		return false;

	}

	// eslint-disable-next-line max-lines-per-function
	generateConnections ( junction: TvJunction, links: TvLink[] = [] ): void {

		Log.info( 'Generating connections for junction', junction.toString() );

		const roadLinks = junction.getRoadLinks();

		links.forEach( link => roadLinks.push( link ) );

		const sortedLinks: TvLink[] = GeometryUtils.sortRoadLinks( roadLinks );

		junction.removeAllConnections();

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

	addConnectionsForRoad ( junction: TvJunction, road: TvRoad, contact: TvContactPoint ): void {

		this.generateConnections( junction, [ LinkFactory.createRoadLink( road, contact ) ] );

	}

	updateGeometries ( junction: TvJunction ): void {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.connectionGeometryService.updateConnectionGeometry( connection );

			this.buildConnectionGeometry( junction, connection );

		}

	}

	buildConnectionGeometry ( junction: TvJunction, connection: TvJunctionConnection ): void {

		try {

			this.splineBuilder.buildGeometry( connection.connectingRoad.spline );

			this.splineBuilder.buildSegments( connection.connectingRoad.spline );

		} catch ( error ) {

			Log.error( 'Update connection geometry failed', connection.toString() );

			Log.error( error );

			junction.removeConnection( connection )

		}

	}

}
