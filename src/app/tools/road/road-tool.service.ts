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

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolService {

	// public pointStrategy: SelectStrategy<AbstractControlPoint>;
	// public roadStrategy: SelectStrategy<TvRoadCoord>;
	// public nodeStrategy: SelectStrategy<RoadNode>;

	constructor (
		public selection: SelectionService,
		public roadService: RoadService,
		public roadSplineService: RoadSplineService,
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointService: ControlPointFactory,
		public roadLinkService: RoadLinkService,
		public debug: RoadDebugService,
	) {
		// this.pointStrategy = new ControlPointStrategy();
		// this.roadStrategy = new RoadCoordStrategy();
		// this.nodeStrategy = new NodeStrategy<RoadNode>( RoadNode.lineTag, true );

		// this.pointStrategy.map = this.mapService;
		// this.roadStrategy.map = this.mapService;
	}

	hideRoad ( road: TvRoad ) {

		this.roadService.hideControlPoints( road );
		this.roadService.hideSpline( road );

	}

	showRoad ( road: TvRoad ) {

		this.roadService.showControlPoints( road );
		this.roadService.showSpline( road );

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



}
