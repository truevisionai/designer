import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TOOL_PROVIDERS } from "../../tools/tool";
import { ParkingSpotTool, ParkingSpotToolService } from "./parking-spot.tool";

const Controllers = [];

const Services = [
	ParkingSpotToolService
];

const Views = [];

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
