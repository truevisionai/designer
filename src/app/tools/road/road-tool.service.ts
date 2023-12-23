import { Injectable } from '@angular/core';
import { RoadSplineService } from 'app/services/road/road-spline.service';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SelectionService } from '../selection.service';
import { RoadLinkService } from 'app/services/road/road-link.service';
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineControlPoint } from 'app/modules/three-js/objects/spline-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolService {

	constructor (
		public selection: SelectionService,
		public roadSplineService: RoadSplineService,
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointService: ControlPointFactory,
		private roadLinkService: RoadLinkService,
		private debug: RoadDebugService,
		public roadService: RoadService,
	) {
	}

	showLinks ( road: TvRoad, point: AbstractControlPoint ) {

		this.roadLinkService.showLinks( road, point );

	}

	updateLinks ( road: TvRoad, point: AbstractControlPoint ) {

		this.roadLinkService.updateLinks( road, point );

	}

	hideLinks ( selectedRoad: TvRoad ) {

		this.roadLinkService.hideLinks( selectedRoad );

	}

	onToolDisabled () {

		this.roadService.hideAllRoadNodes();

		this.debug.clear();

	}

	onToolEnabled () {

		this.roadService.showAllRoadNodes();

		this.roadService.roads.forEach( road => this.debug.showRoadBorderLine( road ) );

	}

	createDefaultRoad () {

		return this.roadService.createDefaultRoad();

	}

	rebuildRoad ( road: TvRoad ) {

		this.roadService.rebuildRoad( road );

	}

	removeRoad ( road: TvRoad, hideHelpers: boolean ) {

		this.roadService.removeRoad( road, hideHelpers );

	}

	updateRoadNodes ( road: TvRoad ) {

		this.roadService.updateRoadNodes( road );

		this.debug.clear();

		this.debug.removeHighlight();

		this.debug.showRoadBorderLine( road );

		this.debug.selectRoad( road );

	}

	duplicateRoad ( selectedRoad: TvRoad ) {

		return this.roadService.duplicateRoad( selectedRoad );

	}

	createJoiningRoad ( nodeA: RoadNode, nodeB: RoadNode ) {

		const joiningRoad = this.roadService.createJoiningRoad( nodeA, nodeB );

		this.roadLinkService.linkRoads( nodeA, nodeB, joiningRoad );

		return joiningRoad;

	}

	unselectRoad ( road: TvRoad ) {

		this.roadService.hideControlPoints( road );
		this.roadService.hideSpline( road );

		this.debug.unselectRoad( road );

	}

	selectRoad ( road: TvRoad ) {

		this.roadService.showControlPoints( road );
		this.roadService.showSpline( road );

		if ( road.spline.controlPoints.length >= 2 ) this.debug.selectRoad( road );

	}

	addPoint ( spline: AbstractSpline, controlPoint: SplineControlPoint ): void {

		spline.addControlPoint( controlPoint );

		spline.update();

	}

	insertPoint ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		let minDistance = Infinity;
		let index = spline.controlPoints.length; // insert at the end by default

		for ( let i = 0; i < spline.controlPoints.length - 2; i++ ) {

			const segmentStart = spline.controlPoints[ i ];
			const segmentEnd = spline.controlPoints[ i + 1 ];

			const distance = this.calculateDistanceToSegment( point, segmentStart, segmentEnd );

			if ( distance < minDistance ) {

				minDistance = distance;
				index = i + 1;

			}

		}

		spline.controlPoints.splice( index, 0, point );

		spline.update();

	}

	private calculateDistanceToSegment ( point: AbstractControlPoint, segmentStart: AbstractControlPoint, segmentEnd: AbstractControlPoint ): number {

		const segmentDirection = segmentEnd.position.clone().sub( segmentStart.position ).normalize();

		const segmentStartToPoint = point.position.clone().sub( segmentStart.position );

		const projection = segmentStartToPoint.clone().dot( segmentDirection );

		if ( projection < 0 ) {

			return point.position.distanceTo( segmentStart.position );

		} else if ( projection > segmentStart.position.distanceTo( segmentEnd.position ) ) {

			return point.position.distanceTo( segmentEnd.position );

		} else {

			const projectionPoint = segmentDirection.clone().multiplyScalar( projection ).add( segmentStart.position );

			return point.position.distanceTo( projectionPoint );

		}

	}

	highlightRoad ( road: TvRoad ) {

		this.debug.highlightRoad( road );

	}

	removeHighlight () {

		this.debug.removeHighlight();

	}
}
