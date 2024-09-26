import { TestBed } from "@angular/core/testing";
import { SharedTestModule } from "./shared-test/shared-test.module";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { LaneWidthModule } from "app/modules/lane-width/lane-width.module";

export function setupTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

}


export function setupLaneWidthTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule, LaneWidthModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

}
