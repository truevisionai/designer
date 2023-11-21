import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../scene.service';
import { BaseService } from '../base.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadSplineService } from './road-spline.service';
import { RoadLinkService } from './road-link.service';
import { DynamicControlPoint } from "../../modules/three-js/objects/dynamic-control-point";
import { TvPosTheta } from "../../modules/tv-map/models/tv-pos-theta";
import { MapService } from '../map.service';
import { SplineService } from '../spline.service';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { TvRoadLinkChild, TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService extends BaseService {

	private static nodes: RoadNode[] = [];
	private static cornerPoints: DynamicControlPoint<TvRoad>[] = [];

	constructor (
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
		private splineService: SplineService,
	) {

		super();
	}

	hideAllRoadNodes () {

		this.mapService.map.getRoads().forEach( road => this.hideRoadNodes( road ) );

	}

	showAllRoadNodes () {

		this.mapService.map.getRoads().forEach( road => this.showRoadNodes( road ) );

	}

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ) {

		const joiningRoad = RoadFactory.createJoiningRoad( firstNode, secondNode );

		const spline = this.roadSplineService.createSplineFromNodes( firstNode, secondNode );

		this.roadLinkService.linkRoads( firstNode, secondNode, joiningRoad );

		spline.addRoadSegment( 0, joiningRoad.id );

		joiningRoad.spline = spline;

		return joiningRoad;

	}

	showRoadNodes ( road: TvRoad ) {

		this.hideRoadNodes( road );

		this.createRoadNode( road, TvContactPoint.START );
		this.createRoadNode( road, TvContactPoint.END );

	}

	hideRoadNodes ( road: TvRoad ) {

		RoadService.nodes.filter( node => node.roadId == road.id ).forEach( node => {

			SceneService.removeFromTool( node );

		} );

	}

	showSpline ( road: TvRoad ) {

		this.splineService.show( road.spline );

	}

	hideSpline ( road: TvRoad ) {

		this.splineService.hide( road.spline );

	}

	showControlPoints ( road: TvRoad ) {

		this.splineService.showControlPoints( road.spline );

	}

	hideControlPoints ( road: TvRoad ) {

		this.splineService.hideControlPoints( road.spline );

	}

	updateRoadNodes ( road: TvRoad ) {

		this.hideRoadNodes( road );
		this.showRoadNodes( road );

	}

	// updateSplineRoads ( spline: AbstractSpline ) {

	// 	spline.updateRoadSegments();

	// 	spline.getRoadSegments().forEach( segment => {

	// 		if ( segment.roadId == -1 ) return;

	// 		const road = this.mapService.map.getRoadById( segment.roadId );

	// 		if ( road ) {

	// 			road.clearGeometries();

	// 			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

	// 		}

	// 	} );

	// }

	updateSplineGeometries ( road: TvRoad ) {

		this.roadSplineService.updateRoadSpline( road.spline );

	}

	rebuildRoad ( road: TvRoad ): void {

		if ( road.spline.controlPoints.length < 2 ) return;

		console.debug( 'regen', road );

		road.spline?.getRoadSegments().forEach( segment => {

			if ( segment.roadId == -1 ) return;

			const road = this.mapService.map.getRoadById( segment.roadId );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			this.updateRoadNodes( road );

			super.rebuildRoad( road );

		} );

	}

	private createRoadNode ( road: TvRoad, contact: TvContactPoint ): RoadNode {

		const node = new RoadNode( road, contact );

		SceneService.addToolObject( node );

		RoadService.nodes.push( node );

		return node;

	}

	showCornerPoints ( road: TvRoad, ) {

		this.createCornerPoint( road, road.getStartCoord() );
		this.createCornerPoint( road, road.getEndCoord() );

	}

	hideCornerPoints ( road: TvRoad ) {

		RoadService.cornerPoints
			.filter( point => point.mainObject.id == road.id )
			.forEach( point => {

				SceneService.removeFromTool( point );

			} );

	}

	createCornerPoint ( road: TvRoad, coord: TvPosTheta ) {

		const rightT = road.getRightsideWidth( coord.s );
		const leftT = road.getLeftSideWidth( coord.s );

		const leftPosition = coord.clone().addLateralOffset( leftT ).toVector3();
		const rightPosition = coord.clone().addLateralOffset( -rightT ).toVector3();

		const leftPoint = new DynamicControlPoint( road, leftPosition );
		const rightPoint = new DynamicControlPoint( road, rightPosition );

		RoadService.cornerPoints.push( leftPoint );
		RoadService.cornerPoints.push( rightPoint );

		SceneService.addToolObject( leftPoint );
		SceneService.addToolObject( rightPoint );

	}

	showAllCornerPoints () {

		this.mapService.map.getRoads().forEach( road => {

			this.showCornerPoints( road );

		} );

	}

	hideAllCornerPoints () {

		this.mapService.map.getRoads().forEach( road => {

			this.hideCornerPoints( road );

		} );

	}

	rebuildLinks ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		this.roadLinkService.updateLinks( road, controlPoint, true );

		this.rebuildLink( road.predecessor );

		this.rebuildLink( road.successor );

	}

	rebuildLink ( link: TvRoadLinkChild ) {

		if ( !link ) return;

		if ( link.elementType == TvRoadLinkChildType.road ) {

			this.rebuildLinkedRoad( link );

		} else if ( link.elementType == TvRoadLinkChildType.junction ) {

			console.warn( 'TODO: rebuild junction' );

		}

	}

	rebuildLinkedRoad ( link: TvRoadLinkChild ) {

		const road = this.mapService.map.getRoadById( link.elementId );

		if ( !road ) return;

		this.rebuildRoad( road );

	}

}
