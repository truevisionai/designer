import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { RoadFactory } from "app/factories/road-factory.service";
import { RoadService } from "../road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class SegmentManager {

	constructor (
		private roadFactory: RoadFactory,
		private roadService: RoadService,
	) {
	}

	onCreated ( segment: SplineSegment ) {

	}

	onUpdated ( segment: SplineSegment ) {

	}

	onRemoved ( spline: AbstractSpline, segment: SplineSegment ) {

		if ( spline.getSplineSegmentCount() > 0 ) {

			// make sure first segment has start = 0
			const firstSegment = spline.getFirstSegment();

			if ( firstSegment.isRoad ) {

				firstSegment.setStart( 0 );

			}

			if ( firstSegment.start > 0 && firstSegment.isJunction ) {

				this.addDefaulSegment( spline );

			}

		}

		spline.update();

	}

	private addDefaulSegment ( spline: AbstractSpline ) {

		const road = this.roadFactory.createDefaultRoad();

		road.spline = spline;

		spline.addRoadSegment( 0, road );

		this.roadService.add( road );

	}

}
