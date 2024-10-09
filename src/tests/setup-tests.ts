import { TestBed } from "@angular/core/testing";
import { SharedTestModule } from "./shared-test/shared-test.module";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { LaneWidthModule } from "app/modules/lane-width/lane-width.module";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";
import { TvMap } from "app/map/models/tv-map.model";
import { MapValidatorService } from "app/services/map/map-validator.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadValidator } from "app/managers/road/road-validator";

export function setupTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

	disableMeshBuilding();

}


export function setupLaneWidthTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule, LaneWidthModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

	disableMeshBuilding();

}

export function validateMap ( map: TvMap, throwError = true ): void {

	TestBed.inject( MapValidatorService ).validateMap( map, throwError );

}

export function expectValidRoad ( road: TvRoad, message?: string ): void {

	const isValid = TestBed.inject( RoadValidator ).validateRoad( road );

	if ( !isValid ) {
		throw new Error( message || `Road validation failed for road ${ road.id }` );
	}

}

