import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';


export enum RoadSegmentType {
	ROAD = 'road',
	JUNCTION = 'junction',
	NONE = 'none'
}

export class RoadSegment {

	get isRoad () {
		return this.type == RoadSegmentType.ROAD;
	}

	constructor (
		public start: number, // Position on the spline where the segment starts
		public id: number, // Road to which this segment belongs
		public type: RoadSegmentType = RoadSegmentType.ROAD, // Type of road segment
		public geometries: TvAbstractRoadGeometry[] // Geometries for this road segment
	) {
	}
}
