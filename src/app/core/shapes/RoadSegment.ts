import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';


export class RoadSegment {
	start: number; // Position on the spline where the segment starts

	// length: number;  // Length of the road segment
	roadId: number; // Road to which this segment belongs
	geometries: TvAbstractRoadGeometry[]; // Geometries for this road segment
}
