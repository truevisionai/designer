import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { MapService } from '../map.service';
import { BaseToolService } from 'app/tools/base-tool.service';
import { RoadService } from './road.service';
import { Vector3 } from 'three';
import { CreateElevationNodeCommand } from 'app/tools/road-elevation/create-elevation-node-command';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { SceneService } from '../scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationService extends BaseService {

	private static nodes: RoadElevationNode[] = [];

	constructor (
		public base: BaseToolService,
		private mapService: MapService,
		private roadService: RoadService,
	) {
		super();
	}

	showElevationNodes ( road: TvRoad ) {

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng and end
			road.addElevation( 0, 0, 0, 0, 0 );
			road.addElevation( road.length, 0, 0, 0, 0 );

		}

		road.getElevationProfile().getElevations().forEach( elevation => {

			const node = this.createElevationNode( road, elevation );

			SceneService.addToolObject( node );

			RoadElevationService.nodes.push( node );

		} );

	}

	removeElevationNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			SceneService.removeFromTool( elevation.node );

			const index = RoadElevationService.nodes.indexOf( elevation.node );

			if ( index !== - 1 ) {

				RoadElevationService.nodes.splice( index, 1 );

			}

		} );

	}

	createElevation ( road: TvRoad, point: Vector3 ): RoadElevationNode {

		const roadCoord = road.getCoordAt( point );

		const elevation = road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		elevation.node = new RoadElevationNode( road, elevation );

		return elevation.node;

	}

	createElevationNode ( road: TvRoad, elevation: TvElevation ): RoadElevationNode {

		if ( elevation.node ) {

			elevation.node.visible = true;

		} else {

			elevation.node = new RoadElevationNode( road, elevation );

		}

		return elevation.node;

	}

	removeNode ( object: RoadElevationNode ) {

		SceneService.removeFromTool( object );

		const index = RoadElevationService.nodes.indexOf( object );

		if ( index !== - 1 ) {

			RoadElevationService.nodes.splice( index, 1 );

		}

		object.road.removeElevationInstance( object.elevation );
	}

	addNode ( object: RoadElevationNode ) {

		SceneService.addToolObject( object );

		RoadElevationService.nodes.push( object );

		object.road.addElevationInstance( object.elevation );
	}

	// createDefaultNodes ( road: TvRoad ) {

	// 	if ( road.spline.controlPoints.length < 2 ) return;

	// 	if ( road.elevationProfile.getElevationCount() === 0 ) {

	// 		// add elevation at begininng
	// 		const firstNode = road.addElevation( 0, 0, 0, 0, 0 );

	// 		// add elevation at end
	// 		const lastNode = road.addElevation( road.length, 0, 0, 0, 0 );

	// 		firstNode.node = new RoadElevationNode( road, firstNode );

	// 		lastNode.node = new RoadElevationNode( road, lastNode );
	// 	}

	// }

	// updateNodes ( road: TvRoad ) {

	// 	road.getElevationProfile().getElevations().forEach( elevation => {

	// 		elevation.node?.updateValuesAndPosition();

	// 	} );

	// }

}
