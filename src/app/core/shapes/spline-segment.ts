import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';


export enum SplineSegmentType {
	ROAD = 'road',
	JUNCTION = 'junction',
	NONE = 'none'
}

export class SplineSegment {

	get isRoad () {
		return this.type == SplineSegmentType.ROAD && this.id != -1;
	}

	constructor (
		public start: number, // Position on the spline where the segment starts
		public id: number, // Road to which this segment belongs
		public type: SplineSegmentType = SplineSegmentType.ROAD, // Type of road segment
		public geometries: TvAbstractRoadGeometry[] // Geometries for this road segment
	) {
	}
}
