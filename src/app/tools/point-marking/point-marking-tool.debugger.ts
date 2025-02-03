/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadObjectViewModel } from "./road-object-view.model";
import { ViewManager } from './view-manager';
import { RoadObjectService } from 'app/map/road-object/road-object.service';

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolDebugger {

	constructor ( private roadObjectService: RoadObjectService ) { }

	showRoadObjectViewModels ( road: TvRoad ): void {

		road.getObjectContainer().getRoadMarkings().forEach( roadObject => {

			if ( ViewManager.hasModel( roadObject ) ) {

				ViewManager.addViewModel( ViewManager.getViewModel( roadObject ) );

			} else {

				ViewManager.addViewModel( new RoadObjectViewModel( roadObject, this.roadObjectService ) );

			}

		} );

	}

	hideRoadObjectViewModels ( road: TvRoad ): void {

		road.getObjectContainer().getRoadMarkings().forEach( roadObject => {

			if ( !ViewManager.hasModel( roadObject ) ) return;

			const viewModel = ViewManager.getViewModel( roadObject );

			const object3D = viewModel?.getObject3d();

			if ( object3D ) {

				object3D.visible = false;

			}

		} );

	}

	clear (): void {

		ViewManager.clear();

	}

}

