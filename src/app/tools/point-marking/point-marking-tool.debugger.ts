/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { PointMarkingControlPoint } from './objects/point-marking-object';

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolDebugger {

	private cache = new Map<TvRoadObject, PointMarkingControlPoint>();

	private points = new Object3DArrayMap<TvRoad, PointMarkingControlPoint[]>();

	showRoadObjects ( road: TvRoad ): void {

		road.getObjectContainer().getRoadMarkings().forEach( roadObject => {

			const point = this.createNode( road, roadObject );

			this.points.addItem( road, point );

		} )

	}

	hideRoadObjects ( road: TvRoad ): void {

		this.points.removeKey( road );

	}

	createNode ( road: TvRoad, roadObject: TvRoadObject ) {

		const coord = road.getRoadPosition( roadObject.s, roadObject.t );

		if ( !coord ) return;

		let point: PointMarkingControlPoint;

		if ( !this.cache.has( roadObject ) ) {

			point = PointMarkingControlPoint.create( road, roadObject );

			this.cache.set( roadObject, point );

		} else {

			point = this.cache.get( roadObject );

		}

		point.position.copy( coord.position );

		point.userData.roadObject = roadObject;

		point.userData.road = road;

		return point;

	}

	addPoint ( roadObject: TvRoadObject, point: PointMarkingControlPoint ): void {

		this.cache.set( roadObject, point );

		this.points.addItem( point.userData.road, point );

	}

	removePoint ( roadObject: TvRoadObject, point: PointMarkingControlPoint ): void {

		this.points.removeItem( point.road, point );

	}

	clear (): void {

		this.points.clear();

	}

}

