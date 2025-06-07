import { TestBed } from "@angular/core/testing";
import { TvMap } from "app/map/models/tv-map.model";
import { SplineTestHelper, TOWN_03, TOWN_04 } from "app/services/spline/spline-test-helper.service";
import { setupTest } from "tests/setup-tests";

describe( 'TownMap-Tests', () => {

	let helper: SplineTestHelper;
	let map: TvMap;

	beforeEach( async () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );

	} );

	it( 'town-03 should pass validations', async () => {

		map = await helper.loadAndParseXodr( TOWN_03 );

		helper.mapValidator.validateMap( map, true );

	} );

	it( 'town-03 should pass validations', async () => {

		map = await helper.loadAndParseXodr( TOWN_04 );

		helper.mapValidator.validateMap( map, true );

	} );

} );
