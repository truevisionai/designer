import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from "../../tools/tool";
import { ParkingSpotTool, ParkingSpotToolService } from "./parking-spot.tool";
import { ParkingCurveCreator, ParkingCurvePointCreator } from "./services/parking-spot-creation-strategy";
import { ParkingCurveService } from "./parking-curve.service";
import { ParkingCurveController } from "./parking-curve-controller.service";
import { ParkingCurvePointController, ParkingNodeController, ParkingNodeVisualizer } from "./parking-curve-point-controller.service";
import { ParkingCurveVisualizer } from "./parking-curve-visualizer.service";
import { ParkingCurvePointVisualizer } from "./parking-curve-point-visualizer.service";

const Controllers = [
	ParkingCurvePointController,
	ParkingCurveController,
	ParkingNodeController,
];

const Services = [
	ParkingSpotToolService,
	ParkingCurveCreator,
	ParkingCurvePointCreator,
	ParkingCurveService,
];

const Views = [
	ParkingCurveVisualizer,
	ParkingCurvePointVisualizer,
	ParkingNodeVisualizer,
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
