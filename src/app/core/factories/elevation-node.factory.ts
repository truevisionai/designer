/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadElevationNode } from '../../modules/three-js/objects/road-elevation-node';
import { TvElevation } from '../../modules/tv-map/models/tv-elevation';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';

export class ElevationNodeFactory {

	public static showNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.makeNode( road, elevation );

		} );

	}

	public static updateNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}

	public static removeNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			if ( elevation.node ) {

				elevation.node.visible = false;

			}

			SceneService.remove( elevation.node );

		} );

	}

	private static makeNode ( road: TvRoad, elevation: TvElevation ) {

		if ( elevation.node ) {

			elevation.node.visible = true;

		} else {

			elevation.node = new RoadElevationNode( road, elevation );

		}

		SceneService.add( elevation.node );

	}
}
