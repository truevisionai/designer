import { TestBed } from '@angular/core/testing';
import { MapService } from 'app/services/map/map.service';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { Vector3 } from 'three';
import { setupTest, validateMap, expectValidRoad } from 'tests/setup-tests';

describe( 'CircleJunctionTest', () => {

	let mapService: MapService;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		mapService = TestBed.get( MapService );
		testHelper = TestBed.get( SplineTestHelper );

	} );



} );
