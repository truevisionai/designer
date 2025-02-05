import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from "../../tools/tool";
import { ParkingCurveController, ParkingCurvePointController, ParkingCurveService, ParkingCurveVisualizer, ParkingSpotTool, ParkingSpotToolService } from "./parking-spot.tool";
import { ParkingCurveCreator, ParkingCurvePointCreator } from "./services/parking-spot-creation-strategy";

const Controllers = [
	ParkingCurvePointController,
	ParkingCurveController,
];

const Services = [
	ParkingSpotToolService,
	ParkingCurveCreator,
	ParkingCurvePointCreator,
	ParkingCurveService,
];

const Views = [
	ParkingCurveVisualizer
];

@NgModule( {
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		...Controllers,
		...Services,
		...Views,
		{
			provide: TOOL_PROVIDERS,
			useClass: ParkingSpotTool,
			deps: [ ParkingSpotToolService ],
			multi: true,
		},
	]
} )
export class ParkingSpotModule {
}
