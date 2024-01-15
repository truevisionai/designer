import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { IntersectionService } from "app/services/junction/intersection.service";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { JunctionManager } from "./junction-manager";
import { JunctionFactory } from "app/factories/junction.factory";
import { MapService } from "app/services/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class IntersectionManager {

	constructor (
		private mapService: MapService,
		private intersectionService: IntersectionService,
		private junctionManager: JunctionManager,
		private splineBuilder: SplineBuilder,
		private junctionFactory: JunctionFactory,
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
				console.error( 'Could not create junction' );
				return;
			}

			this.intersectionService.postProcessJunction( junction );

			this.mapService.map.addJunctionInstance( junction );

			this.junctionManager.addJunction( junction );

			this.splineBuilder.buildSpline( item.spline );

			this.splineBuilder.buildSpline( item.otherSpline );

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


	createJunctionFromCoords ( coords: TvRoadCoord[] ): TvJunction {

		const junction = this.junctionFactory.createJunction();

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
