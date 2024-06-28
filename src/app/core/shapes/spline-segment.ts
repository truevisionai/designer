/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';

export enum SplineSegmentType {
	ROAD = 'road',
	JUNCTION = 'junction',
	NONE = 'none'
}


/**
 * @deprecated
 */
export class SplineSegment {

	public geometries: TvAbstractRoadGeometry[] = [];

	get isRoad () {
		return this.type == SplineSegmentType.ROAD && this.id != -1;
	}

	get isConnectingRoad () {
		return this.isRoad && ( this.segment as TvRoad ).isJunction;
	}

	get isJunction () {
		return this.type == SplineSegmentType.JUNCTION && this.id != -1;
	}

	get id () {
		return this.segment?.id || -1;
	}

	constructor (
		public start: number,
		public type: SplineSegmentType,
		public segment: TvRoad | TvJunction | null
	) {
	}

	getInstance<T> () {
		return this.segment as unknown as T;
	}

	getLength () {
		return 0;
	}

	makeEmpty () {
		this.type = SplineSegmentType.NONE;
		this.segment = null;
	}

	setStart ( start: number ) {

		this.start = start;

		if ( this.segment instanceof TvRoad ) {
			this.segment.sStart = start;
		}

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
