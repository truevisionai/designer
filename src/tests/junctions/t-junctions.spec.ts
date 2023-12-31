import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { IntersectionService } from "app/services/junction/intersection.service";
import { JunctionService } from "app/services/junction/junction.service";
import { MapService } from "app/services/map.service";
import { RoadService } from "app/services/road/road.service";
import { RoadToolService } from "app/tools/road/road-tool.service";
import { Vector3 } from "three";

const DEFAULT_ROAD_WIDTH = 12.2;

describe( 't-junction tests', () => {

	let mapService: MapService;
	let roadService: RoadService;
	let intersectionService: IntersectionService;
	let junctionService: JunctionService;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		mapService = TestBed.inject( MapService );
		roadService = TestBed.inject( RoadService );
		intersectionService = TestBed.inject( IntersectionService );
		junctionService = TestBed.inject( JunctionService );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		eventServiceProvider.init();

	} );

	beforeEach( () => {

		mapService.reset();

	} );

	afterEach( () => {

		mapService.reset();

	} );

	it( 'should cut roads for t-junction at road end', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.addControlPointAt( new Vector3( -100, 0, 0 ) );
		xAxisRoad.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, -100, 0 ) );
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, 100, 0 ) );

		roadService.addRoad( xAxisRoad );
		roadService.addRoad( yAxisRoad );

		const junction = junctionService.createNewJunction();

		const coord1 = xAxisRoad.getRoadCoordAt( 100 );
		intersectionService.cutRoadForJunction( coord1, junction );
		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

		const coord2 = yAxisRoad.getRoadCoordAt( 100 );
		intersectionService.cutRoadForJunction( coord2, junction );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );

	} );

	it( 'should cut roads for t-junction at road start', () => {

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		xAxisRoad.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );
		roadService.addRoad( xAxisRoad );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, -100, 0 ) );
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, 100, 0 ) );
		roadService.addRoad( yAxisRoad );

		const junction = junctionService.createNewJunction();

		const coord1 = xAxisRoad.getRoadCoordAt( 100 );
		intersectionService.cutRoadForJunction( coord1, junction );

		const coord2 = yAxisRoad.getRoadCoordAt( 100 );
		intersectionService.cutRoadForJunction( coord2, junction );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		expect( xAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( yAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );
		expect( newYAxisRoad.length ).toBeCloseTo( 100 - DEFAULT_ROAD_WIDTH );


	} );

	it( 'should create t-junction connections at road end', () => {

		expect( roadService.getRoadCount() ).toBe( 0 );

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.addControlPointAt( new Vector3( -100, 0, 0 ) );
		xAxisRoad.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		roadService.addRoad( xAxisRoad );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, -100, 0 ) );
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, 100, 0 ) );
		roadService.addRoad( yAxisRoad );

		intersectionService.checkSplineIntersections( yAxisRoad.spline );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		const junction = junctionService.getJunctionById( 1 );

		expect( junction.connections.size ).toBe( 6 );
		expect( roadService.getRoadCount() ).toBe( 9 );

	} );

	it( 'should create t-junction connections at road start', () => {

		expect( roadService.getRoadCount() ).toBe( 0 );

		// left to right
		const xAxisRoad = roadService.createDefaultRoad();
		xAxisRoad.spline.addControlPointAt( new Vector3( 0, 0, 0 ) );
		xAxisRoad.spline.addControlPointAt( new Vector3( 100, 0, 0 ) );
		roadService.addRoad( xAxisRoad );

		// bottom to top
		const yAxisRoad = roadService.createDefaultRoad();
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, -100, 0 ) );
		yAxisRoad.spline.addControlPointAt( new Vector3( 0, 100, 0 ) );
		roadService.addRoad( yAxisRoad );

		intersectionService.checkSplineIntersections( yAxisRoad.spline );

		const newYAxisRoad = roadService.getRoad( 3 );

		expect( newYAxisRoad ).toBeDefined();

		const junction = junctionService.getJunctionById( 1 );

		expect( junction.connections.size ).toBe( 6 );
		expect( roadService.getRoadCount() ).toBe( 9 );

	} );

} );
