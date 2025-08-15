/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { JunctionService } from 'app/services/junction/junction.service';
import { BaseToolService } from '../../tools/base-tool.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { JunctionDebugService } from "../../services/junction/junction.debug";
import { TvLink } from 'app/map/models/tv-link';
import { ConnectionFactory } from 'app/factories/connection.factory';
import { JunctionFactory } from "../../factories/junction.factory";
import { GeometryUtils } from 'app/services/surface/geometry-utils';
import { Vector3 } from "../../core/maths";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionToolHelper {

	// TODO: this helper/class should not be provided in root
	// currently its being used in spline test helper, which is used
	// in every test file

	private debug = true;

	constructor (
		public junctionDebugger: JunctionDebugService,
		public junctionService: JunctionService,
		public base: BaseToolService,
		public connectionFactory: ConnectionFactory,
	) {
	}

	createCustomJunction ( roadLinks: TvLink[] ): TvJunction {

		const sortedLinks: TvLink[] = GeometryUtils.sortRoadLinks( roadLinks );

		const centroid = this.findCentroid( sortedLinks );

		const junction = JunctionFactory.createCustomJunction( centroid );

		this.addConnections( sortedLinks, junction );

		return junction;
	}

	private findCentroid ( links: TvLink[] ): Vector3 {

		const points = links.map( link => link.getPosition().toVector3() );

		return GeometryUtils.getCentroid( points );

	}

	private addConnections ( sortedLinks: TvLink[], junction: TvJunction ): void {

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
	}
}
