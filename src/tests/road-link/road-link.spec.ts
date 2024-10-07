import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { TvRoad } from "../../app/map/models/tv-road.model";
import { setupTest } from 'tests/setup-tests';
import { TestBed } from "@angular/core/testing";
import { Vector3 } from "three";
import { TvContactPoint } from "app/map/models/tv-common";

describe( 'RoadLinker', () => {

	let leftRoad: TvRoad;
	let rightRoad: TvRoad;
	let helper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

		leftRoad = helper.createStraightRoad( new Vector3( 0, 0, 0 ), 100 );
		rightRoad = helper.createStraightRoad( new Vector3( 100, 0, 0 ), 100 );

	} );

	it( 'link when next road is successor', () => {

		leftRoad.linkSuccessor( rightRoad, TvContactPoint.START );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.successorId ).toBeDefined();
			expect( lane.successorUUID ).toBeDefined();
			expect( lane.successorId ).toBe( lane.id );
		} );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
			expect( lane.predecessorId ).toBeUndefined();
			expect( lane.predecessorUUID ).toBeUndefined();
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( false );
			expect( lane.successorId ).toBeUndefined();
			expect( lane.successorUUID ).toBeUndefined();
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( true );
			expect( lane.predecessorId ).toBeDefined();
			expect( lane.predecessorUUID ).toBeDefined();
			expect( lane.predecessorId ).toBe( lane.id );
		} );

	} );

	it( 'link when both roads are successor to each other', () => {

		leftRoad.linkSuccessor( rightRoad, TvContactPoint.END );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.successorId ).toBeDefined();
			expect( lane.successorUUID ).toBeDefined();
			expect( lane.successorId ).toBe( lane.id * -1 );
		} );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
			expect( lane.predecessorId ).toBeUndefined();
			expect( lane.predecessorUUID ).toBeUndefined();
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.successorId ).toBeDefined();
			expect( lane.successorUUID ).toBeDefined();
			expect( lane.successorId ).toBe( lane.id * -1 );
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
			expect( lane.predecessorId ).toBeUndefined();
			expect( lane.predecessorUUID ).toBeUndefined();
		} );

	} );

	xit( 'link predecessor with successor', () => {

		leftRoad.linkSuccessor( rightRoad, TvContactPoint.START );

	} );

	xit( 'link predecessor with predecessor', () => {

		leftRoad.linkSuccessor( rightRoad, TvContactPoint.START );

	} );

} );
