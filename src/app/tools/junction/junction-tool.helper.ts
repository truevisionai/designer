/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { MapService } from 'app/services/map/map.service';
import { BaseToolService } from '../base-tool.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionDebugService } from "../../services/junction/junction.debug";
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { JunctionManager } from "../../managers/junction-manager";
import { TvLink } from 'app/map/models/tv-link';
import { Log } from 'app/core/utils/log';
import { RoadService } from 'app/services/road/road.service';
import { ConnectionFactory } from 'app/factories/connection.factory';
import { JunctionFactory } from "../../factories/junction.factory";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionToolHelper {

	private debug = true;

	constructor (
		public junctionDebugger: JunctionDebugService,
		public junctionService: JunctionService,
		public junctionManager: JunctionManager,
		public debugDraw: DebugDrawService,
		public base: BaseToolService,
		public mapService: MapService,
		public roadService: RoadService,
		public connectionFactory: ConnectionFactory,
		public junctionFactory: JunctionFactory,
	) {
	}

	addJunction ( junction: TvJunction ) {

		this.junctionService.fireCreatedEvent( junction );

	}

	removeJunction ( junction: TvJunction ) {

		this.junctionService.fireRemovedEvent( junction );

	}

	createCustomJunction ( roadLinks: TvLink[] ): TvJunction {

		const sortedLinks: TvLink[] = this.roadService.sortLinks( roadLinks );

		const centroid = this.roadService.findCentroid( sortedLinks );

		const junction = this.junctionFactory.createCustomJunction( centroid );

		if ( this.debug ) Log.info( 'coords', sortedLinks.length, sortedLinks );

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

				linkA.linkJunction( junction );
				linkB.linkJunction( junction );

				this.connectionFactory.addConnections( junction, linkA.toRoadCoord(), linkB.toRoadCoord(), !rightConnectionCreated );
				this.connectionFactory.addConnections( junction, linkB.toRoadCoord(), linkA.toRoadCoord(), isFirstAndLast );

				if ( !rightConnectionCreated || isFirstAndLast ) {
					// TODO: check if this is necessary
					// this.connectionFactory.createFakeCorners( junction, linkA.toRoadCoord(), linkB.toRoadCoord() );
				}

				rightConnectionCreated = true;

			}

		}

		return junction;
	}
}
