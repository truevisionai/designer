import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionRemovedEvent } from "app/events/junction/junction-removed-event";
import { MapEvents } from "app/events/map-events";
import { RoadRemovedEvent } from "app/events/road/road-removed-event";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionManager } from "./junction-manager";
import { RoadSplineService } from "app/services/road/road-spline.service";

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionManager {

	constructor (
		private intersectionService: IntersectionService,
		private junctionManager: JunctionManager,
		private roadSplineService: RoadSplineService,
	) { }

	updateIntersections ( spline: AbstractSpline ) {

		// when a spline is updated
		// we first check if it has junctions or not
		const junctions = spline.getJunctions();

		const intersections = this.intersectionService.getSplineIntersections( spline );

		this.removeJunctions( junctions );

		for ( let i = 0; i < intersections.length; i++ ) {

			const item = intersections[ i ];

			this.intersectionService.createSplineIntersection( item.spline, item.otherSpline, item.intersection );

			this.roadSplineService.rebuildSpline( item.spline );

			this.roadSplineService.rebuildSpline( item.otherSpline );

		}

	}

	removeJunctions ( junctions: TvJunction[] ) {

		for ( let i = 0; i < junctions.length; i++ ) {

			this.removeJunction( junctions[ i ] );

		}

	}

	removeJunction ( junction: TvJunction ) {

		this.junctionManager.removeJunction( junction );

	}
}
