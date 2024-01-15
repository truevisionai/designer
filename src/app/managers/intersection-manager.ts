import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionManager } from "./junction-manager";
import { RoadSplineService } from "app/services/road/road-spline.service";
import { JunctionService } from "app/services/junction/junction.service";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";

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

		if ( spline.isConnectingRoad() ) return;

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

			this.intersectionService.postProcessJunction( junction );

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


	createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {

		let junction: TvJunction;

		junction = this.junctionService.createNewJunction();

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const coordB = coords[ j ];

				// roads should be different
				if ( coordA.road === coordB.road ) continue;

				this.intersectionService.addConnections( junction, coordA, coordB );


			}

		}

		this.intersectionService.postProcessJunction( junction );

		return junction;
	}
}
