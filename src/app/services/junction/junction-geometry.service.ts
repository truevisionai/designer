import { Injectable } from '@angular/core';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { Box2, Box3, Vector2 } from "three";
import { JunctionRoadService } from "./junction-road.service";
import { Log } from "../../core/utils/log";
import { TvJunctionBoundaryBuilder } from "../../map/junction-boundary/tv-junction-boundary.builder";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGeometryService {

	constructor (
		private junctionRoadService: JunctionRoadService,
		public boundaryBuilder: TvJunctionBoundaryBuilder,
	) {
	}

	update ( junction: TvJunction ) {

		junction.depBoundingBox = this.createBoundingBoxFromConnectingRoads( junction );

		this.updateBoundingBox( junction );

	}

	updateBoundingBox ( junction: TvJunction ) {

		const centroid = junction.boundingBox.getCenter( new Vector2() );

		junction.centroid.x = centroid.x;

		junction.centroid.y = centroid.y;

	}

	createBoundingBoxFromConnectingRoads ( junction: TvJunction ) {

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

	createBoundingBoxFromOuterBoundary ( junction: TvJunction ): Box2 {

		const points = this.boundaryBuilder.convertBoundaryToPositions( junction.outerBoundary );

		if ( points.length < 2 ) {
			Log.error( 'JunctionBuilder.buildBoundingBox: Invalid boundary points', junction.toString() );
			return new Box2();
		}

		const box = new Box2();

		box.setFromPoints( points.map( p => new Vector2( p.x, p.y ) ) );

		return box;

	}

}
