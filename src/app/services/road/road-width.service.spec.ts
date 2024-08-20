import { TestBed } from '@angular/core/testing';
import { RoadWidthService } from './road-width.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineTestHelper } from '../spline/spline-test-helper.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

describe( 'Service: RoadWidth', () => {

	let road: TvRoad;
	let helper: SplineTestHelper;
	let service: RoadWidthService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: [ RoadWidthService ]
		} );

		service = TestBed.inject( RoadWidthService );
		helper = TestBed.inject( SplineTestHelper );

	} );

	it( 'should give correct width for road with 1 lane section', () => {

		road = helper.makeDefaultRoad( [] );

		expect( service.findTotalWidthAt( road, 0 ) ).toBe( 12.2 );
		expect( service.findLeftWidthAt( road, 0 ) ).toBe( 6.1 );
		expect( service.findRightWidthAt( road, 0 ) ).toBe( 6.1 );

		expect( service.findTotalWidthAt( road, 50 ) ).toBe( 12.2 );
		expect( service.findLeftWidthAt( road, 50 ) ).toBe( 6.1 );
		expect( service.findRightWidthAt( road, 50 ) ).toBe( 6.1 );

		expect( service.findTotalWidthAt( road, 100 ) ).toBe( 12.2 );
		expect( service.findLeftWidthAt( road, 100 ) ).toBe( 6.1 );
		expect( service.findRightWidthAt( road, 100 ) ).toBe( 6.1 );

	} );

	it( 'should give correct total for road with 2 lane sections', () => {

		road = helper.makeDefaultRoad( [] );

		const laneSection = road.getLaneProfile().getLaneSectionAt( 0 );

		const newLaneSection = laneSection.cloneAtS( 2, 50 );

		newLaneSection.getLaneArray().forEach( lane => lane.width.forEach( width => width.a *= 2 ) );

		road.getLaneProfile().addLaneSectionInstance( newLaneSection );

		expect( service.findTotalWidthAt( road, 0 ) ).toBe( 12.2 );
		expect( service.findLeftWidthAt( road, 0 ) ).toBe( 6.1 );
		expect( service.findRightWidthAt( road, 0 ) ).toBe( 6.1 );

		expect( service.findTotalWidthAt( road, 40 ) ).toBe( 12.2 );
		expect( service.findLeftWidthAt( road, 40 ) ).toBe( 6.1 );
		expect( service.findRightWidthAt( road, 40 ) ).toBe( 6.1 );

		expect( service.findTotalWidthAt( road, 50 ) ).toBe( 24.4 );
		expect( service.findLeftWidthAt( road, 50 ) ).toBe( 12.2 );
		expect( service.findRightWidthAt( road, 50 ) ).toBe( 12.2 );

		expect( service.findTotalWidthAt( road, 100 ) ).toBe( 24.4 );
		expect( service.findLeftWidthAt( road, 100 ) ).toBe( 12.2 );
		expect( service.findRightWidthAt( road, 100 ) ).toBe( 12.2 );

	} );

} );
