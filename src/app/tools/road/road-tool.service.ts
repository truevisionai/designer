/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map/map.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SelectionService } from '../selection.service';
import { RoadLinkService } from 'app/services/road/road-link.service';
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadNode } from 'app/objects/road-node';
import { SplineDebugService } from 'app/services/debug/spline-debug.service';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineFactory } from 'app/services/spline/spline.factory';
import { DebugState } from '../../services/debug/debug-state';

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

	}

	duplicateRoad ( selectedRoad: TvRoad ) {

		return this.roadService.duplicateRoad( selectedRoad );

	}

	createJoiningRoad ( nodeA: RoadNode, nodeB: RoadNode ) {

		const joiningRoad = this.roadService.createJoiningRoad( nodeA, nodeB );

		this.roadLinkService.linkRoads( nodeA, nodeB, joiningRoad );

		return joiningRoad;

	}

	removeHighlight () {

		this.roadDebug.removeHighlight();
		this.splineDebug.removeHighlight();

	}

	addSpline ( spline: AbstractSpline ) {

		this.splineService.addSpline( spline );

		this.setSplineState( spline, DebugState.SELECTED );

	}

	udpateSpline ( spline: AbstractSpline ) {

		this.splineService.updateSpline( spline );

		this.setSplineState( spline, DebugState.SELECTED );

		const successor = spline.getSuccessorSpline();

		if ( successor ) {

			this.setSplineState( successor, DebugState.DEFAULT );

		}

		const predecessor = spline.getPredecessorrSpline();

		if ( predecessor ) {

			this.setSplineState( predecessor, DebugState.DEFAULT );

		}

	}

	removeSpline ( spline: AbstractSpline ) {

		this.splineService.removeSpline( spline );

		this.setSplineState( spline, DebugState.REMOVED );

	}

	setSplineState ( spline: AbstractSpline, state: DebugState ) {

		if ( !spline ) return;

		if ( spline.controlPoints.length < 2 ) {

			this.splineDebug.showControlPoints( spline );

		} else {

			this.splineDebug.setState( spline, state );

			spline.getSplineSegments().filter( i => i.isRoad ).forEach( segment => {

				if ( state === DebugState.REMOVED ) {

					this.roadDebug.removeRoadNodes( segment.getInstance<TvRoad>() );

				} else {

					this.roadDebug.upateRoadNodes( segment.getInstance<TvRoad>() );

				}

			} );

		}

	}

}
