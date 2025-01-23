/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadObjectService } from "../../map/road-object/road-object.service";
import { RoadPosition } from "../../scenario/models/positions/tv-road-position";
import { TvRoadObjectSkeleton } from "../../map/models/objects/tv-road-object-skeleton";
import { TvObjectPolyline } from "../../map/models/objects/tv-object-polyline";
import { TvObjectVertexRoad } from "../../map/models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../../map/models/objects/tv-object-vertex-local";
import { Vector3 } from "app/core/maths"
import { TvRoadObjectType } from "../../map/models/objects/tv-road-object";

@Injectable( {
	providedIn: 'root'
} )
export class PolePropFactory {

	constructor (
		private objectService: RoadObjectService
	) {
	}

	createStreetLight ( position: RoadPosition, height: number = 4, width: number = 2.0, poleWidth: number = 0.15 ): any {

		const object = this.objectService.createRoadObject( position.road, TvRoadObjectType.pole, position.s, position.t );

		object.skeleton = new TvRoadObjectSkeleton();

		const polyline = new TvObjectPolyline( 0 );
		polyline.vertices.push( new TvObjectVertexRoad( 0, position.s, position.t, 0, null, poleWidth, true ) );
		polyline.vertices.push( new TvObjectVertexRoad( 1, position.s, position.t, height, null, poleWidth, true ) );

		const polyline2 = new TvObjectPolyline( 1 );
		polyline2.vertices.push( new TvObjectVertexRoad( 0, position.s, position.t + 0, height - ( height * 0.1 ), null, poleWidth * 0.3 ) );
		polyline2.vertices.push( new TvObjectVertexRoad( 1, position.s, position.t + width, height - ( height * 0.1 ), null, poleWidth * 0.3 ) );

		object.skeleton.polylines.push( polyline );
		object.skeleton.polylines.push( polyline2 );

		return object;

	}

	createSmallPole ( position: RoadPosition, height: number = 1, radius: number = 0.05, useLocalVertex: boolean = true ): any {

		const object = this.objectService.createRoadObject( position.road, TvRoadObjectType.pole, position.s, position.t );

		object.radius = radius;

		object.width = radius * 2;

		object.height = height;

		object.length = radius * 2;

		object.skeleton = new TvRoadObjectSkeleton();

		const polyline = new TvObjectPolyline( 0 );

		if ( useLocalVertex === true ) {

			polyline.vertices.push( new TvObjectVertexLocal( 0, new Vector3( 0, 0, 0, ), null, radius, true ) );

			polyline.vertices.push( new TvObjectVertexLocal( 1, new Vector3( 0, 0, height, ), null, radius ) );

		} else {

			polyline.vertices.push( new TvObjectVertexRoad( 0, position.s, position.t, 0, null, radius, true ) );

			polyline.vertices.push( new TvObjectVertexRoad( 1, position.s, position.t, height, null, radius ) );

		}

		object.skeleton.polylines.push( polyline );

		return object;

	}

}
