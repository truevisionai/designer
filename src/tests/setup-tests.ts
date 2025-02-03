import { TestBed } from "@angular/core/testing";
import { SharedTestModule } from "./shared-test/shared-test.module";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { LaneWidthModule } from "app/modules/lane-width/lane-width.module";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";
import { TvMap } from "app/map/models/tv-map.model";
import { MapValidatorService } from "app/services/map/map-validator.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadValidator } from "app/managers/road/road-validator";
import { SurfaceToolModule } from "app/modules/surface/surface.module";
import { CrosswalkToolModule } from "../app/modules/crosswalk/crosswalk-tool.module";
import { ToolFactory } from "../app/tools/tool.factory";
import { ToolType } from "../app/tools/tool-types.enum";
import { BaseTool } from "../app/tools/base-tool";
import { ToolManager } from "../app/managers/tool-manager";

export function setupTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

	disableMeshBuilding();

}

export function setCurrentTool<T extends BaseTool<T>> ( toolType: ToolType ): T {

	const tool = TestBed.inject( ToolFactory ).createTool( toolType ) as T;

	tool.init();

	ToolManager.setCurrentTool( tool );

	return tool;

}

export function setupLaneWidthTest (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule, LaneWidthModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

	disableMeshBuilding();

}

export function setupSurfaceTool (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule, SurfaceToolModule ],
	} );

	TestBed.inject( EventServiceProvider ).init();

	disableMeshBuilding();

}

export function setupCrosswalkTool (): void {

	TestBed.configureTestingModule( {
		imports: [ SharedTestModule, CrosswalkToolModule ],
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

