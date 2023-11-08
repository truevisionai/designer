import { TvCornerRoad } from "./tv-corner-road";
import { TvCornerLocal } from "./tv-corner-local";
import { ObjectFillType, TvLaneType } from "../tv-common";
import { TvRoad } from "../tv-road.model";

export class TvObjectOutline {

	public cornerRoad: TvCornerRoad[] = [];
	public cornerLocal: TvCornerLocal[] = [];

	public id: number;

	constructor (
		public fillType: ObjectFillType = ObjectFillType.none,
		public outer: boolean = false,
		public closed: boolean = false,
		public laneType: TvLaneType = TvLaneType.none,
	) {
	}

	addCornerRoad ( road: TvRoad, s: number, t: number, dz: number = 0, height: number = 0, id?: number ): TvCornerRoad {
		const cornerRoad = new TvCornerRoad( id || this.cornerRoad.length, road, s, t, dz, height );
		this.cornerRoad.push( cornerRoad );
		return cornerRoad;
	}

	getCornerLocal ( i: number ): TvCornerLocal {
		return this.cornerLocal[ i ];
	}

	getCornerLocalCount (): number {
		return this.cornerLocal.length;
	}

	getCornerRoad ( i: number ): TvCornerRoad {
		return this.cornerRoad[ i ];
	}

	getCornerRoadCount (): number {
		return this.cornerRoad.length;
	}

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ) {

		const index = this.cornerRoad.indexOf( tvCornerRoad );

		if ( index > -1 ) {
			this.cornerRoad.splice( index, 1 );
		}
	}

}
