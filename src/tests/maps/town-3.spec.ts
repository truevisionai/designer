import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TvMap } from "app/map/models/tv-map.model";
import { RoadService } from "app/services/road/road.service";
import { SplineTestHelper, TOWN_03, TOWN_04 } from "app/services/spline/spline-test-helper.service";

describe( 'TownMap-Tests', () => {

	let helper: SplineTestHelper;
	let map: TvMap;

	beforeEach( async () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

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
