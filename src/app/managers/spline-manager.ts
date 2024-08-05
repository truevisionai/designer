/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { SplineService } from "../services/spline/spline.service";
import { SplineUtils } from "app/utils/spline.utils";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { Log } from "app/core/utils/log";
import { SplineLinkService } from "./spline-link.service";

@Injectable( {
	providedIn: 'root'
} )
export class SplineManager {

	private debug = true;

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private junctionManager: JunctionManager,
		private splineService: SplineService,
		private fixer: SplineFixerService,
		private splineLinkManager: SplineLinkService,
	) {
	}

	addSpline ( spline: AbstractSpline, updateJunctions = true ) {

		if ( this.debug ) Log.debug( "Add", spline.toString() );

		this.fixer.fix( spline );

		this.splineLinkManager.onSplineAdded( spline );

		this.splineBuilder.build( spline );

		this.addSegments( spline );

		if ( updateJunctions ) this.junctionManager.detectJunctions( spline );

	}

	buildSpline ( spline: AbstractSpline ) {

		this.splineBuilder.build( spline );

	}

	updateSpline ( spline: AbstractSpline, updateJunctions = true ) {

		if ( this.debug ) Log.debug( "Update", spline.toString() );

		this.fixer.fix( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.splineBuilder.buildGeometry( spline );

		for ( const road of this.splineService.getRoads( spline ) ) {

			this.roadManager.updateRoad( road );

		}

		this.splineBuilder.buildBoundingBox( spline );

		this.splineLinkManager.onSplineUpdated( spline );

		if ( updateJunctions ) this.junctionManager.detectJunctions( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		if ( this.debug ) Log.debug( "Remove", spline.toString() );

		if ( SplineUtils.isConnection( spline ) ) {
			this.mapService.map.removeSpline( spline );
			return;
		}

		this.splineLinkManager.onSplineRemoved( spline );

		this.removeMesh( spline );

		this.mapService.map.removeSpline( spline );
	}

	private removeMesh ( spline: AbstractSpline ) {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				this.roadManager.removeMesh( segment );

			}

		}

	}

	private addSegments ( spline: AbstractSpline ) {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				if ( this.mapService.hasRoad( segment ) ) {

					Log.warn( "Road already exists", segment.toString() );

				} else {

					this.mapService.addRoad( segment );
				}

			}

		}

	}

}


