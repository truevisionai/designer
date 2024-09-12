/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { Box2, Box3, Vector2 } from "three";
import { JunctionRoadService } from "./junction-road.service";
import { Log } from "../../core/utils/log";
import { BoundaryPositionService } from 'app/map/junction-boundary/boundary-position.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionBoundsService {

	constructor (
		private junctionRoadService: JunctionRoadService,
		private boundaryPositionService: BoundaryPositionService,
	) {
	}

	updateBounds ( junction: TvJunction ): void {

		junction.depBoundingBox = this.buildBox3( junction );

		junction.boundingBox = this.buildBox2( junction );

		const centroid = junction.boundingBox.getCenter( new Vector2() );

		junction.centroid.x = centroid.x;

		junction.centroid.y = centroid.y;

	}

	private buildBox3 ( junction: TvJunction ): Box3 {

		const boundingBox = new Box3();

		const connectingRoads = this.junctionRoadService.getConnectingRoads( junction );

		for ( let i = 0; i < connectingRoads.length; i++ ) {

			const connectingRoad = connectingRoads[ i ];

			if ( !connectingRoad.boundingBox ) {
				connectingRoad.computeBoundingBox();
			}

			if ( connectingRoad.boundingBox ) {
				boundingBox.union( connectingRoad.boundingBox );
			}

		}

		return boundingBox;

	}

	private buildBox2 ( junction: TvJunction ): Box2 {

		const points = this.boundaryPositionService.getBoundaryPositions( junction.innerBoundary );

		if ( points.length < 2 ) {
			Log.error( 'JunctionBuilder.buildBoundingBox: Invalid boundary points', junction.toString() );
			return new Box2();
		}

		const box = new Box2();

		box.setFromPoints( points.map( p => new Vector2( p.x, p.y ) ) );

		return box;

	}

}
