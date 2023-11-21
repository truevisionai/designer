import { Vector3 } from "three";
import { AutoSplineV2 } from './auto-spline-v2';
import { TvGeometryType } from "app/modules/tv-map/models/tv-common";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

describe( 'AutoSplineV2 tests', () => {

	let spline: AutoSplineV2;
	let road: TvRoad;
	let road2: TvRoad;

	beforeEach( () => {

		road = RoadFactory.createDefaultRoad();
		road2 = RoadFactory.createDefaultRoad();

	} );

	it( 'should export 1 road segment with line geometry covering all road', () => {

		spline = new AutoSplineV2();

		spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		spline.addRoadSegment( 0, road.id );

		let segments = spline.getRoadSegments();

		expect( spline.controlPoints.length ).toBe( 2 );
		expect( segments.length ).toBe( 1 );

		expect( segments[ 0 ].start ).toBe( 0 );
		// expect( segments[ 0 ].length ).toBe( 100 );
		expect( segments[ 0 ].geometries.length ).toBe( 1 );

		expect( segments[ 0 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].x ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].hdg ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].length ).toBe( 100 );

	} )


	it( 'should export 1 road segment with line geometry', () => {

		spline = new AutoSplineV2();

		spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		spline.addRoadSegment( 10, road.id );
		spline.addRoadSegment( 40, -1 );

		let segments = spline.getRoadSegments();

		expect( spline.controlPoints.length ).toBe( 2 );
		expect( segments.length ).toBe( 2 );

		expect( segments[ 0 ].start ).toBe( 10 );
		// expect( segments[ 0 ].length ).toBe( 40 );
		expect( segments[ 0 ].geometries.length ).toBe( 1 );

		expect( segments[ 0 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].x ).toBe( 10 );
		expect( segments[ 0 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].hdg ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].length ).toBe( 30 );

	} )


	it( 'should export 2 road segment on line geometry only', () => {

		spline = new AutoSplineV2();

		spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 200, 0, 0 ) );

		spline.addRoadSegment( 10, road.id );
		spline.addRoadSegment( 60, road2.id );

		let segments = spline.getRoadSegments();

		expect( spline.controlPoints.length ).toBe( 2 );
		expect( segments.length ).toBe( 2 );

		expect( segments[ 0 ].start ).toBe( 10 );
		expect( segments[ 0 ].geometries.length ).toBe( 1 );
		expect( segments[ 0 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].x ).toBe( 10 );
		expect( segments[ 0 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].hdg ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].length ).toBe( 50 );

		expect( segments[ 1 ].start ).toBe( 60 );
		expect( segments[ 1 ].geometries.length ).toBe( 1 );
		expect( segments[ 1 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 1 ].geometries[ 0 ].x ).toBe( 60 );
		expect( segments[ 1 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 1 ].geometries[ 0 ].hdg ).toBe( 0 );
		expect( segments[ 1 ].geometries[ 0 ].length ).toBe( 140 );

	} )

	it( 'should export 1 road segment with line + arc geometry', () => {

		spline = new AutoSplineV2();

		spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 50, 0 ) );

		spline.addRoadSegment( 10, road.id );
		spline.addRoadSegment( 80, -1 );

		let segments = spline.getRoadSegments();

		expect( spline.controlPoints.length ).toBe( 3 );
		expect( segments.length ).toBe( 2 );

		expect( segments[ 0 ].start ).toBe( 10 );
		expect( segments[ 0 ].geometries.length ).toBe( 2 );

		expect( segments[ 0 ].geometries[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( segments[ 0 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].x ).toBe( 10 );
		expect( segments[ 0 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].hdg ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].length ).toBe( 40 );

		expect( segments[ 0 ].geometries[ 1 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( segments[ 0 ].geometries[ 1 ].s ).toBe( 40 );
		expect( segments[ 0 ].geometries[ 1 ].x ).toBe( 50 );
		expect( segments[ 0 ].geometries[ 1 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 1 ].hdg ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 1 ].length ).toBe( 30 );

	} )

	it( 'should export 2 road segments with line and arc geometry', () => {

		spline = new AutoSplineV2();

		spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 0, 0 ) );
		spline.addControlPointAt( new Vector3( 100, 50, 0 ) );

		spline.addRoadSegment( 10, road.id );
		spline.addRoadSegment( 50, road2.id );

		let segments = spline.getRoadSegments();

		expect( spline.controlPoints.length ).toBe( 3 );
		expect( segments.length ).toBe( 2 );

		expect( segments[ 0 ].start ).toBe( 10 );
		expect( segments[ 0 ].geometries.length ).toBe( 1 );
		expect( segments[ 0 ].geometries[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( segments[ 0 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].x ).toBe( 10 );
		expect( segments[ 0 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 0 ].geometries[ 0 ].hdg ).toBe( 0 );
		// expect( segments[ 0 ].geometries[ 0 ].length ).toBe( 40 );

		expect( segments[ 1 ].start ).toBe( 50 );
		expect( segments[ 1 ].geometries.length ).toBe( 1 );
		expect( segments[ 1 ].geometries[ 0 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( segments[ 1 ].geometries[ 0 ].s ).toBe( 0 );
		expect( segments[ 1 ].geometries[ 0 ].x ).toBe( 50 );
		expect( segments[ 1 ].geometries[ 0 ].y ).toBe( 0 );
		expect( segments[ 1 ].geometries[ 0 ].hdg ).toBe( 0 );
		// expect( segments[ 1 ].geometries[ 0 ].length ).toBe( 40 );

	} )


} );
