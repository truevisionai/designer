/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { MapService } from "app/services/map/map.service";
import { RoadManager } from "./road/road-manager";
import { TvRoad } from "app/map/models/tv-road.model";
import { JunctionManager } from "./junction-manager";
import { SplineFixerService } from "app/services/spline/spline.fixer";
import { Log } from "app/core/utils/log";
import { SplineLinkService } from "./spline-link.service";
import { SplineSegmentService } from "app/services/spline/spline-segment.service";
import { MapEvents } from "app/events/map-events";


@Injectable( {
	providedIn: 'root'
} )
export class SplineManager {

	private debug = true;

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private junctionManager: JunctionManager,
		private fixer: SplineFixerService,
		private splineLinkService: SplineLinkService,
		private segmentService: SplineSegmentService
	) {
	}

	addSpline ( spline: AbstractSpline, updateJunctions = true ) {

		if ( this.debug ) Log.debug( "Add", spline.toString() );

		this.fixer.fix( spline );

		this.splineLinkService.onSplineAdded( spline );

		spline.updateSegmentGeometryAndBounds();

		this.addSegments( spline );

		if ( updateJunctions ) this.junctionManager.handleSplineAdded( spline );

	}

	buildSpline ( spline: AbstractSpline ): void {

		spline.updateSegmentGeometryAndBounds();

	}

	updateSpline ( spline: AbstractSpline, updateJunctions = true ): void {

		if ( this.debug ) Log.debug( "Update", spline.toString() );

		this.fixer.fix( spline );

		spline.updateSegmentGeometryAndBounds();

		this.updateAndBuildLinkedSplines( spline );

		for ( const road of spline.getRoadSegments() ) {

			this.roadManager.updateRoad( road );

		}

		if ( updateJunctions ) this.junctionManager.handleSplineUpdated( spline );

	}

	updateAndBuildLinkedSplines ( spline: AbstractSpline ): void {

		this.splineLinkService.updateLinkedSplines( spline );

		spline.getLinkedSplines().forEach( linkedSpline => {

			this.buildSpline( linkedSpline );

		} );

	}

	removeSpline ( spline: AbstractSpline ): void {

		if ( this.debug ) Log.debug( "Remove", spline.toString() );

		if ( spline.isConnectingRoad() ) {
			this.mapService.map.removeSpline( spline );
			return;
		}

		this.splineLinkService.onSplineRemoved( spline );

		this.mapService.map.removeSpline( spline );

		this.segmentService.removeSegments( spline );

		MapEvents.removeMesh.emit( spline );

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


