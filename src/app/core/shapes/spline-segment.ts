import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

export enum SplineSegmentType {
	ROAD = 'road',
	JUNCTION = 'junction',
	NONE = 'none'
}

export class SplineSegment {

	public geometries: TvAbstractRoadGeometry[] = [];

	get isRoad () {
		return this._type == SplineSegmentType.ROAD && this.id != -1;
	}

	get id () {
		return this.segment?.id || -1;
	}

	get type () {
		return this._type;
	}

	constructor (
		public start: number,
		private _type: SplineSegmentType,
		public segment: TvRoad | TvJunction | null
	) {
	}

	getInstance<T> () {
		return this.segment as any;
	}

	getLength () {
		return 0;
	}

	makeEmpty () {
		this._type = SplineSegmentType.NONE;
		this.segment = null;
	}


	static stringToType ( type: string ): SplineSegmentType {
		switch ( type ) {
			case SplineSegmentType.ROAD:
				return SplineSegmentType.ROAD;
			case SplineSegmentType.JUNCTION:
				return SplineSegmentType.JUNCTION;
			default:
				return SplineSegmentType.NONE;
		}
	}
}
