import { Injectable } from '@angular/core';
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
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { SplineDebugService } from 'app/services/debug/spline-debug.service';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineFactory } from 'app/services/spline/spline.factory';

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolService {

	constructor (
		public selection: SelectionService,
		public splineService: SplineService,
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointService: ControlPointFactory,
		private roadLinkService: RoadLinkService,
		private roadDebug: RoadDebugService,
		public roadService: RoadService,
		private splineDebugService: AbstractSplineDebugService,
		private splineDebug: SplineDebugService,
		public splineFactory: SplineFactory,
	) {
	}

	addControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ): void {

		spline.addControlPoint( controlPoint );

		spline.update();

		this.splineDebug.addControlPoint( spline, controlPoint );

	}

	insertControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		spline.insertPoint( controlPoint );

		// update not needed

		this.splineDebug.addControlPoint( spline, controlPoint );

	}

	removeControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		spline.removeControlPoint( controlPoint );

		spline.update();

		this.splineDebug.removeControlPoint( spline, controlPoint );

	}

	clear () {

		this.roadDebug.clear();

		this.splineDebug.clear();

	}

	updateSplineVisuals ( spline: AbstractSpline ) {

		this.removeSplineVisuals( spline );

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

	removeSplineVisuals ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			this.roadDebug.removeRoadBorderLine( road );

			this.roadDebug.removeRoadNodes( road );

		}

		this.splineDebug.remove( spline );

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

	removeRoad ( road: TvRoad ) {

		this.roadService.removeRoad( road );

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

		this.splineDebugService.hideControlPoints( spline );
		this.splineDebugService.hide( spline );

		this.splineDebug.unselect( spline );
		this.splineDebug.showBorder( spline );

	}

	hideSplineVisuals ( spline: AbstractSpline ) {

		this.splineDebugService.hideControlPoints( spline );
		this.splineDebugService.hide( spline );

	}

	selectSpline ( spline: AbstractSpline ) {

		this.splineDebugService.showControlPoints( spline );
		this.splineDebugService.show( spline );

		this.splineDebug.select( spline );

	}

	removeHighlight () {

		this.roadDebug.removeHighlight();
		this.splineDebug.removeHighlight();

	}

	highlightSpline ( spline: AbstractSpline ) {

		this.splineDebug.highlight( spline );

	}

	addSpline ( spline: AbstractSpline ) {

		this.splineService.addSpline( spline );

	}

	udpateSpline ( spline: AbstractSpline ) {

		this.splineService.updateSpline( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		this.splineDebug.remove( spline );

		this.splineDebugService.hideControlPoints( spline );
		this.splineDebugService.hide( spline );

		this.splineService.removeSpline( spline );

		this.removeSplineVisuals( spline );

	}

}
