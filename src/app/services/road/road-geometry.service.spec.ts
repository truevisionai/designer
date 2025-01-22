import { RoadGeometryService } from './road-geometry.service';
import { TvRoad } from '../../map/models/tv-road.model';
import { Vector3 } from 'app/core/maths';
import { RoadFactory } from "../../factories/road-factory.service";
import { createDefaultRoad } from "../../../tests/base-test.spec";
import { TvElevationProfile } from "../../map/road-elevation/tv-elevation-profile.model";

describe( 'RoadGeometryService', () => {
	let roadGeometryService: RoadGeometryService;
	let mockRoad: TvRoad;

	beforeEach( () => {
		roadGeometryService = new RoadGeometryService();
		mockRoad = createDefaultRoad( { length: 100 } );
	} );

	it( 'should return a vertical normal for flat roads', () => {
		const normal = roadGeometryService.getRoadSurfaceNormal( mockRoad, 50, 0 );
		expect( normal.equals( new Vector3( 0, 0, 1 ) ) ).toBeTrue(); // Straight up for flat road
	} );

	it( 'should handle roads with steep elevation changes', () => {

		spyOn( mockRoad.getElevationProfile(), 'getElevationValue' ).and.returnValue( 0.1 );
		spyOn( mockRoad.getElevationProfile(), 'getSlopeAt' ).and.returnValue( 0.1 );

		const normal = roadGeometryService.getRoadSurfaceNormal( mockRoad, 50, 0 );
		// Expected normal tilted due to elevation slope
		expect( normal.x ).toBeCloseTo( -0.1 / Math.sqrt( 1.01 ), 6 );
		expect( normal.y ).toBeCloseTo( 0, 6 );
		expect( normal.z ).toBeCloseTo( 1 / Math.sqrt( 1.01 ), 6 );
	} );

	it( 'should handle roads with high superelevation values', () => {

		spyOn( mockRoad.getLateralProfile(), 'getSuperElevationValue' ).and.returnValue( Math.PI / 6 ); // 30 degrees tilt

		const normal = roadGeometryService.getRoadSurfaceNormal( mockRoad, 50, 2 ); // Offset t = 2
		expect( normal.x ).toBeCloseTo( 0, 6 ); // No elevation slope
		expect( normal.y ).toBeCloseTo( 0, 6 );
		expect( normal.z ).toBeCloseTo( -1, 6 ); // NOTE: this could be wrong // High lateral slope for t
	} );

	it( 'should handle various combinations of s and t values', () => {
		spyOn( mockRoad.getElevationProfile(), 'getElevationValue' ).and.returnValue( 0.05 );
		spyOn( mockRoad.getElevationProfile(), 'getSlopeAt' ).and.returnValue( 0.05 );
		spyOn( mockRoad.getLateralProfile(), 'getSuperElevationValue' ).and.returnValue( Math.PI / 12 ); // 15 degrees tilt

		const normal = roadGeometryService.getRoadSurfaceNormal( mockRoad, 20, 1 );
		expect( normal.x ).toBeCloseTo( -0.068 ); // NOTE: this could be wrong // Normalize factor
		expect( normal.y ).toBeCloseTo( 0, 6 );
		expect( normal.z ).toBeCloseTo( 0.997 ); // NOTE: this could be wrong
	} );

	it( 'should throw an exception for invalid s values', () => {
		expect( () => roadGeometryService.getRoadSurfaceNormal( mockRoad, -1, 0 ) )
			.toThrowError();
		expect( () => roadGeometryService.getRoadSurfaceNormal( mockRoad, 200, 0 ) )
			.toThrowError();
	} );
} );
