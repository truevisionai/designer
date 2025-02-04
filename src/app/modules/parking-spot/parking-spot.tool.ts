import { Injectable } from "@angular/core";
import { SplineService } from "../../services/spline/spline.service";
import { BaseToolService } from "../../tools/base-tool.service";
import { ToolWithHandler } from "../../tools/base-tool-v2";
import { ToolType } from "../../tools/tool-types.enum";


@Injectable()
export class ParkingSpotToolService {

	constructor (
		public splineService: SplineService,
		public base: BaseToolService,
	) {
	}
}

export class ParkingSpotTool extends ToolWithHandler {

	public name: string = 'ParkingSpotTool';

	public toolType = ToolType.ParkingSpot;

	constructor ( private tool: ParkingSpotToolService ) {

		super();

		console.log( 'ParkingSpotTool constructor' );

	}

	init (): void {

		super.init();

		console.log( 'ParkingSpotTool initialized' );

	}

}
