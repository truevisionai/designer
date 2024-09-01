/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { SplineUtils } from "app/utils/spline.utils";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { Log } from "app/core/utils/log";
import { SplineLinkService } from "./spline-link.service";
import { SplineGeometryService } from "app/services/spline/spline-geometry.service";
import { SplineSegmentService } from "app/services/spline/spline-segment.service";

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
		private fixer: SplineFixerService,
		private splineLinkService: SplineLinkService,
		private splineGeometryService: SplineGeometryService,
		private segmentService: SplineSegmentService,
	) {
	}

	addSpline ( spline: AbstractSpline, updateJunctions = true ) {

		if ( this.debug ) Log.debug( "Add", spline.toString() );

		this.fixer.fix( spline );

		this.splineLinkService.onSplineAdded( spline );

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

		if ( spline.getControlPointCount() < 2 ) {

			this.removeMesh( spline );

		}

		this.splineGeometryService.updateGeometryAndBounds( spline );

		for ( const road of spline.getRoadSegments() ) {

			this.roadManager.updateRoad( road );

		}

		this.splineLinkService.updateLinkedSplines( spline );

		this.buildLinkedSplines( spline );

		if ( updateJunctions ) this.junctionManager.detectJunctions( spline );

	}

	buildLinkedSplines ( spline: AbstractSpline ): void {

		this.splineLinkService.getLinkedSplines( spline ).forEach( linkedSpline => {

			this.buildSpline( linkedSpline );

		} );

	}

	removeSpline ( spline: AbstractSpline ): void {

		if ( this.debug ) Log.debug( "Remove", spline.toString() );

		if ( SplineUtils.isConnection( spline ) ) {
			this.mapService.map.removeSpline( spline );
			return;
		}

		this.splineLinkService.onSplineRemoved( spline );

		this.removeMesh( spline );

		this.mapService.map.removeSpline( spline );

		this.segmentService.removeSegments( spline );

	}

	private removeMesh ( spline: AbstractSpline ): void {

		for ( const segment of spline.segmentMap.toArray() ) {

			if ( segment instanceof TvRoad ) {

				this.roadManager.removeMesh( segment );

			}

		}

	}

	private addSegments ( spline: AbstractSpline ): void {

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


