import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionManager } from "./junction-manager";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { JunctionService } from "app/services/junction/junction.service";

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionManager {

	constructor (
		private intersectionService: IntersectionService,
		private junctionService: JunctionService,
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

			const junction = this.intersectionService.createJunction(
				item.spline,
				item.otherSpline,
				item.intersection
			);

			if ( !junction ) {
				throw new Error( 'Could not create junction' );
				return;
			}

			this.junctionService.addJunction( junction );

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

		this.junctionService.removeJunction( junction );

	}
}
