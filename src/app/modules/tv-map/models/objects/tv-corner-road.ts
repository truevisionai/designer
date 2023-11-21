import { DynamicControlPoint } from "../../../three-js/objects/dynamic-control-point";
import { TvRoad } from "../tv-road.model";
import { Vector3 } from "three";

/**
 * Defines a corner point on the object’s outline in road co-ordinates..
 */
export class TvCornerRoad extends DynamicControlPoint<any> {

	constructor (
		public attr_id: number,
		public road: TvRoad,
		public s: number,
		public t: number,
		public dz: number = 0,
		public height: number = 0
	) {
		super( null, road.getPositionAt( s, t ).toVector3() );
	}

	copyPosition ( position: Vector3 ): void {

		super.copyPosition( position );

		const coord = this.road?.getCoordAt( position );

		if ( coord ) this.s = coord.s;

		if ( coord ) this.t = coord.t;

		this.mainObject?.update();

	}
}
