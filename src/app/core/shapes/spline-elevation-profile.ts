import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { AbstractSpline } from "./abstract-spline";
import { Log } from "../utils/log";


export class SplineElevationProfile {

	constructor (
		private spline: AbstractSpline
	) { }

	getHeightAtOffset ( splineDistance: number ): number {

		const road = this.getNearestRoad( splineDistance );

		if ( !road ) {
			Log.debug( 'SplineElevationProfile', `No road found at spline distance: ${ splineDistance }` );
			return 0;
		}

		const roadDistance = splineDistance - road.sStart;

		const profile = road.getElevationProfile();

		return profile.getElevationValue( roadDistance );

	}

	private getNearestRoad ( splineDistance: number ): TvRoad {

		const segment = this.spline.getSegmentAt( splineDistance );

		let road: TvRoad;

		if ( segment instanceof TvJunction ) {

			road = this.spline.getPreviousSegment( segment ) as TvRoad || this.spline.getNextSegment( segment ) as TvRoad;

		} else if ( segment instanceof TvRoad ) {

			road = segment;

		}

		return road;
	}

}
