import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../marking-line/road-object.service';
import { RoadPosition } from 'app/modules/scenario/models/positions/tv-road-position';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { Vector3 } from 'three';
import { TvRoadObjectSkeleton } from "../../modules/tv-map/models/objects/tv-road-object-skeleton";
import { TvObjectPolyline } from "../../modules/tv-map/models/objects/tv-object-polyline";
import { TvObjectVertexRoad } from "../../modules/tv-map/models/objects/tv-object-vertex-road";
import { TvObjectVertexLocal } from "../../modules/tv-map/models/objects/tv-object-vertex-local";

@Injectable( {
	providedIn: 'root'
} )
export class PolePropToolService {

	constructor (
		public base: BaseToolService,
		public objectService: RoadObjectService,
	) { }

	createStreetLight ( position: RoadPosition, height = 4, width = 2.0, poleWidth = 0.15 ) {

		const object = this.objectService.createRoadObject( position.road, ObjectTypes.pole, position.s, position.t );

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

	createSmallPole ( position: RoadPosition, height = 1, radius = 0.05, useLocalVertex = true ) {

		const object = this.objectService.createRoadObject( position.road, ObjectTypes.pole, position.s, position.t );

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
