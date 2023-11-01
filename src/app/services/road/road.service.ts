import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../scene.service';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { BaseService } from '../base.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadSplineService } from './road-spline.service';
import { RoadLinkService } from './road-link.service';


@Injectable( {
	providedIn: 'root'
} )
export class RoadService extends BaseService {

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ) {

		const joiningRoad = RoadFactory.createJoiningRoad( firstNode, secondNode );

		const spline = ( new RoadSplineService() ).createSplineFromNodes( firstNode, secondNode );

		( new RoadLinkService() ).linkRoads( firstNode, secondNode, joiningRoad );

		spline.addRoadSegment( 0, -1, joiningRoad.id );

		joiningRoad.spline = spline;

		return joiningRoad;

	}

	showRoadNodes ( road: TvRoad ) {

		this.updateRoadNodes( road );

		if ( road.startNode ) road.startNode.visible = true;

		if ( road.endNode ) road.endNode.visible = true;

	}

	hideRoadNodes ( road: TvRoad ) {

		if ( road.startNode ) road.startNode.visible = false;

		if ( road.endNode ) road.endNode.visible = false;

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

			if ( road.startNode ) road.startNode.update();

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

	updateSplineRoads ( spline: AbstractSpline ) {

		spline.updateRoadSegments();

		spline.getRoadSegments().forEach( segment => {

			const road = this.map.getRoadById( segment.roadId );

			if ( road ) {

				road.clearGeometries();

				segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			}


		} );

	}

	updateSplineGeometries ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		road.spline?.getRoadSegments().forEach( segment => {

			const road = this.map.getRoadById( segment.roadId );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

		} );
	}

	rebuildRoad ( road: TvRoad ): void {

		if ( road.spline.controlPoints.length < 2 ) return;

		console.debug( 'regen', road );

		road.spline?.getRoadSegments().forEach( segment => {

			const road = this.map.getRoadById( segment.roadId );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			this.updateRoadNodes( road );

			super.rebuildRoad( road );

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
