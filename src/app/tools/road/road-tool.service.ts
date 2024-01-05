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
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { SplineDebugService } from 'app/services/debug/spline-debug.service';

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
		private roadDebug: RoadDebugService,
		public roadService: RoadService,
		private splineService: AbstractSplineDebugService,
		private splineDebug: SplineDebugService,
	) {
	}

	updateSplineVisuals ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			this.roadDebug.upateRoadBorderLine( road );

			this.roadDebug.upateRoadNodes( road );

		}

		this.splineDebug.updateSpline( spline );

	}

	showLinks ( spline: AbstractSpline, point: AbstractControlPoint ) {

		this.roadLinkService.showSplineLinks( spline, point );

	}

	updateLinks ( spline: AbstractSpline, point: AbstractControlPoint ) {

		this.roadLinkService.updateSplineLinks( spline, point );

	}

	hideLinks ( selectedRoad: TvRoad ) {

		this.roadLinkService.hideLinks( selectedRoad );

	}

	onToolDisabled () {

		this.roadDebug.hideNodes();

		this.roadDebug.clear();

		this.splineDebug.clear();

	}

	onToolEnabled () {

		this.splineDebug.showBorders();

		this.roadDebug.showNodes();

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

		this.roadDebug.upateRoadNodes( road );

		// this.roadService.updateRoadNodes( road );

		// this.roadDebug.clear();

		// this.roadDebug.removeHighlight();

		// this.roadDebug.showRoadBorderLine( road );

		// this.roadDebug.selectRoad( road );

	}

	duplicateRoad ( selectedRoad: TvRoad ) {

		return this.roadService.duplicateRoad( selectedRoad );

	}

	createJoiningRoad ( nodeA: RoadNode, nodeB: RoadNode ) {

		const joiningRoad = this.roadService.createJoiningRoad( nodeA, nodeB );

		this.roadLinkService.linkRoads( nodeA, nodeB, joiningRoad );

		return joiningRoad;

	}

	unselectSpline ( spline: AbstractSpline ) {

		this.splineService.hideControlPoints( spline );
		this.splineService.hide( spline );

		this.splineDebug.unselect( spline );
		this.splineDebug.showBorder( spline );

	}

	selectSpline ( spline: AbstractSpline ) {

		this.splineService.showControlPoints( spline );
		this.splineService.show( spline );

		this.splineDebug.select( spline );

	}

	addPoint ( spline: AbstractSpline, controlPoint: SplineControlPoint ): void {

		spline.addControlPoint( controlPoint );

		spline.update();

	}

	insertPoint ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		let minDistance = Infinity;
		let index = spline.controlPoints.length; // insert at the end by default

		for ( let i = 0; i < spline.controlPoints.length - 1; i++ ) {

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

	removeHighlight () {

		this.roadDebug.removeHighlight();
		this.splineDebug.removeHighlight();

	}

	highlightSpline ( spline: AbstractSpline ) {

		this.splineDebug.highlight( spline );

	}

	addSpline ( spline: AbstractSpline ) {

		this.roadSplineService.addSpline( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		this.splineDebug.remove( spline );

		this.splineService.hideControlPoints( spline );
		this.splineService.hide( spline );

		this.roadSplineService.removeSpline( spline );

	}

}
