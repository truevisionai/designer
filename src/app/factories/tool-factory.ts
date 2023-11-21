/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tools/tool-types.enum';
import { BaseTool } from '../tools/base-tool';
import { LaneOffsetTool } from '../tools/lane-offset/lane-offset-tool';
import { MarkingPointTool } from '../tools/marking-point/marking-point-tool';
import { PointerTool } from '../tools/pointer/pointer-tool';
import { PropPolygonTool } from '../tools/prop-polygon/prop-polygon-tool';
import { RoadRampTool } from '../tools/road-ramp/road-ramp-tool';
import { RoadSignalTool } from '../tools/road-signal-tool';
import { VehicleTool } from '../tools/vehicle/vehicle-tool';

export class ToolFactory {

	static createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.LaneOffset:
				return new LaneOffsetTool();
			case ToolType.PropPolygon:
				return new PropPolygonTool();
			case ToolType.MarkingPoint:
				return new MarkingPointTool();
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			case ToolType.RoadSignalTool:
				return new RoadSignalTool();
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

	}
}
