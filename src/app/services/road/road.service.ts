import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../scene.service';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService {

	constructor () { }

	showRoadNodes ( road: TvRoad ) {

		this.updateRoadNodes( road );

		road.startNode.visible = true;

		road.endNode.visible = true;

	}

	hideRoadNodes ( road: TvRoad ) {

		road.startNode.visible = false;

		road.endNode.visible = false;

	}

	showSpline ( road: TvRoad ) {

		road.spline.show();

	}

	hideSpline ( road: TvRoad ) {

		road.spline.hide();

	}

	showControlPoints ( road: TvRoad ) {

		road.spline.showControlPoints();

	}

	hideControlPoints ( road: TvRoad ) {

		road.spline.hideControlPoints();

	}

	updateRoadNodes ( road: TvRoad ) {

		if ( !road.startNode ) {

			road.startNode = this.createRoadNode( road, TvContactPoint.START );

		} else {

			road.startNode.update();

		}

		if ( !road.endNode ) {

			road.endNode = this.createRoadNode( road, TvContactPoint.END );

		} else {

			road.endNode.update();

		}

	}

	showElevationNodes ( road: TvRoad ) {

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng and end
			road.addElevation( 0, 0, 0, 0, 0 );
			road.addElevation( road.length, 0, 0, 0, 0 );

		}

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.createElevationNode( road, elevation );

		} );

	}

	removeElevationNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			if ( elevation.node ) {

				elevation.node.visible = false;

			}

			SceneService.removeFromTool( elevation.node );

		} );

	}

	updateElevationNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}

	private createElevationNode ( road: TvRoad, elevation: TvElevation ) {

		if ( elevation.node ) {

			elevation.node.visible = true;

		} else {

			elevation.node = new RoadElevationNode( road, elevation );

		}

		SceneService.addToolObject( elevation.node );

	}

	private createRoadNode ( road: TvRoad, contact: TvContactPoint ): RoadNode {

		const node = new RoadNode( road, contact );

		SceneService.addToolObject( node );

		return node;

	}

}
