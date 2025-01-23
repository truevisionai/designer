import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { TvRoad } from "../../app/map/models/tv-road.model";
import { setupTest } from 'tests/setup-tests';
import { TestBed } from "@angular/core/testing";
import { Vector3 } from "app/core/maths"
import { TvContactPoint } from "app/map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";

function expectLaneSectionWithNoLinks ( laneSection: TvLaneSection ) {
	laneSection.getNonCenterLanes().forEach( lane => {
		expect( lane.successorExists ).toBeFalse();
		expect( lane.predecessorExists ).toBeFalse();
	} );
}

describe( 'RoadLinker', () => {

	let leftRoad: TvRoad;
	let rightRoad: TvRoad;
	let helper: SplineTestHelper;
	let prevSection: TvLaneSection;
	let nextSection: TvLaneSection;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

		leftRoad = helper.createStraightRoad( new Vector3( 0, 0, 0 ), 100 );
		rightRoad = helper.createStraightRoad( new Vector3( 100, 0, 0 ), 100 );

		prevSection = leftRoad.getLaneProfile().getLastLaneSection();
		nextSection = rightRoad.getLaneProfile().getFirstLaneSection();

	} );

	it( 'link when next road is successor', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.START );

		leftRoad.getLaneProfile().getNonCenterLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.isSuccessor( nextSection.getLaneById( lane.id ) ) ).toBe( true );
		} );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( false );
		} );

		rightRoad.getLaneProfile().getNonCenterLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( true );
			expect( lane.isPredecessor( prevSection.getLaneById( lane.id ) ) ).toBe( true );
		} );

	} );

	it( 'should unlink with successor with contact start', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.START );

		leftRoad.removeSuccessor();

		expect( leftRoad.hasSuccessor() ).toBe( false );
		expect( leftRoad.hasPredecessor() ).toBe( false );

		expect( rightRoad.hasSuccessor() ).toBe( false );
		expect( rightRoad.hasPredecessor() ).toBe( false );

		leftRoad.laneSections.forEach( laneSection => expectLaneSectionWithNoLinks( laneSection ) );
		rightRoad.laneSections.forEach( laneSection => expectLaneSectionWithNoLinks( laneSection ) );

	} );

	it( 'should unlink with successor with contact end', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.END );

		leftRoad.removeSuccessor();

		expect( leftRoad.hasPredecessor() ).toBe( false );
		expect( leftRoad.hasSuccessor() ).toBe( false );

		expect( rightRoad.hasPredecessor() ).toBe( false );
		expect( rightRoad.hasSuccessor() ).toBe( false );

		leftRoad.laneSections.forEach( laneSection => expectLaneSectionWithNoLinks( laneSection ) );
		rightRoad.laneSections.forEach( laneSection => expectLaneSectionWithNoLinks( laneSection ) );

	} );

	it( 'link when both roads are successor to each other', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.END );

		leftRoad.getLaneProfile().getNonCenterLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.isSuccessor( nextSection.getLaneById( lane.id * -1 ) ) ).toBe( true );
		} );

		leftRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
		} );

		rightRoad.getLaneProfile().getNonCenterLanes().forEach( lane => {
			expect( lane.successorExists ).toBe( true );
			expect( lane.isSuccessor( prevSection.getLaneById( lane.id * -1 ) ) ).toBe( true );
		} );

		rightRoad.getLaneProfile().getLanes().forEach( lane => {
			expect( lane.predecessorExists ).toBe( false );
		} );

	} );

	xit( 'link predecessor with successor', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.START );

	} );

	xit( 'link predecessor with predecessor', () => {

		leftRoad.linkSuccessorRoad( rightRoad, TvContactPoint.START );

	} );

} );
