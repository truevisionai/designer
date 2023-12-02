import { TvObjectPolyline } from "./tv-object-polyline";

export class TvRoadObjectSkeleton {

	constructor (
		public polylines: TvObjectPolyline[] = []
	) {
	}

	clone (): TvRoadObjectSkeleton {

		return new TvRoadObjectSkeleton(
			this.polylines.map( polyline => polyline.clone() )
		);

	}
}