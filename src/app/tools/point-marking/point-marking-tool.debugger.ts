/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { PointMarkingControlPoint } from './objects/point-marking-object';
import { IViewModel } from '../lane/visualizers/i-view-model';
import { SceneService } from 'app/services/scene.service';
import { RoadObjectViewModel } from "./road-object-view.model";


@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolDebugger {

	// private cache = new Map<TvRoadObject, PointMarkingControlPoint>();

	// private points = new Object3DArrayMap<TvRoad, PointMarkingControlPoint[]>();

	private viewModels = new Map<TvRoadObject, IViewModel<any, any>>();

	// showRoadObjects ( road: TvRoad ): void {

	// 	road.getObjectContainer().getRoadMarkings().forEach( roadObject => {

	// 		const point = this.createNode( road, roadObject );

	// 		this.points.addItem( road, point );

	// 	} )

	// }

	showRoadObjectViewModels ( road: TvRoad ): void {

		road.getObjectContainer().getRoadMarkings().forEach( roadObject => {

			if ( this.viewModels.has( roadObject ) ) {

				SceneService.addToolObject( this.viewModels.get( roadObject ).getObject3d() );

			} else {

				const viewModel = new RoadObjectViewModel( roadObject );

				SceneService.addToolObject( viewModel.getObject3d() );

				this.viewModels.set( roadObject, viewModel );

			}

		} );

	}

	hideRoadObjectViewModels ( road: TvRoad ): void {

		this.viewModels.forEach( viewModel => {

			SceneService.removeFromTool( viewModel.getObject3d() );

		} );

	}

	// hideRoadObjects ( road: TvRoad ): void {

	// 	this.points.removeKey( road );

	// }

	// createNode ( road: TvRoad, roadObject: TvRoadObject ): PointMarkingControlPoint {

	// 	const coord = road.getRoadPosition( roadObject.s, roadObject.t );

	// 	if ( !coord ) return;

	// 	let point: PointMarkingControlPoint;

	// 	if ( !this.cache.has( roadObject ) ) {

	// 		point = PointMarkingControlPoint.create( road, roadObject );

	// 		this.cache.set( roadObject, point );

	// 	} else {

	// 		point = this.cache.get( roadObject );

	// 	}

	// 	point.position.copy( coord.position );

	// 	point.userData.roadObject = roadObject;

	// 	point.userData.road = road;

	// 	return point;

	// }

	addPoint ( roadObject: TvRoadObject, point: PointMarkingControlPoint ): void {

		// this.cache.set( roadObject, point );

		// this.points.addItem( point.userData.road, point );

		throw new Error( 'Method not implemented.' );

	}

	removePoint ( roadObject: TvRoadObject, point: PointMarkingControlPoint ): void {

		// this.points.removeItem( point.road, point );

		throw new Error( 'Method not implemented.' );

	}

	clear (): void {

		// this.points.clear();

		this.viewModels.forEach( viewModel => {

			SceneService.removeFromTool( viewModel.getObject3d() );

		} );

	}

}

