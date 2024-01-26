/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { TvObjectPolyline } from 'app/map/models/objects/tv-object-polyline';
import { TvObjectVertexLocal } from 'app/map/models/objects/tv-object-vertex-local';
import { TvObjectVertexRoad } from 'app/map/models/objects/tv-object-vertex-road';
import { TvRoadObjectSkeleton } from 'app/map/models/objects/tv-road-object-skeleton';
import { ObjectTypes } from 'app/map/models/tv-common';
import { Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { RoadObjectService } from '../crosswalk/road-object.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadBarrierService {

	constructor (
		public base: BaseToolService,
		public objectService: RoadObjectService,
	) { }

	createWall ( position: RoadPosition, height = 1.0, width = 0.1 ) {

		// const sqLength = 1, sqWidth = 0.25;
		// const squareShape = new Shape()
		// 	.moveTo( 0, 0 )
		// 	.lineTo( 0, -sqWidth )
		// 	.lineTo( -sqLength, -sqWidth )
		// 	.lineTo( -sqLength, 0 )
		// 	.lineTo( 0, 0 );

		const object = this.objectService.createRoadObject( position.road, ObjectTypes.barrier, position.s, position.t );

		object.subType = 'wall';

		object.width = width;

		object.height = height;

		object.length = -1;	// continuous

		object.skeleton = new TvRoadObjectSkeleton();

		const polyline = new TvObjectPolyline( 0 );

		// + u is forward
		// + v is left
		// + z is up
		polyline.vertices.push( new TvObjectVertexLocal( 1, new Vector3( 0, width, 0 ), null, null ) );
		polyline.vertices.push( new TvObjectVertexLocal( 2, new Vector3( 0, width, height ), null, null ) );
		polyline.vertices.push( new TvObjectVertexLocal( 3, new Vector3( 0, 0, height ), null, null ) );
		polyline.vertices.push( new TvObjectVertexLocal( 4, new Vector3( 0, 0, 0 ), null, null ) );

		object.skeleton.polylines.push( polyline );

		return object;

	}

}
