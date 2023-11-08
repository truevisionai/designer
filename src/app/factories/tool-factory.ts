/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tools/tool-types.enum';
import { BaseTool } from '../tools/base-tool';
import { LaneOffsetTool } from '../tools/lane-offset/lane-offset-tool';
import { CrosswalkTool } from '../tools/marking-line/crosswalk-tool';
import { MarkingPointTool } from '../tools/marking-point/marking-point-tool';
import { ParkingBoxTool } from '../tools/parking-box-tool';
import { PointerTool } from '../tools/pointer/pointer-tool';
import { PropCurveToolV2 } from '../tools/prop-curve/prop-curve-tool';
import { PropPolygonTool } from '../tools/prop-polygon/prop-polygon-tool';
import { RoadRampTool } from '../tools/road-ramp/road-ramp-tool';
import { RoadSignalTool } from '../tools/road-signal-tool';
import { SurfaceTool } from '../tools/surface/surface-tool';
import { VehicleTool } from '../tools/vehicle/vehicle-tool';
import { RoadCuttingTool } from 'app/tools/road-cut-tool/road-cut-tool';
import { JunctionTool } from 'app/tools/junction-tool/junction.tool';

export class ToolFactory {

	static createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Junction:
				return new JunctionTool();
			case ToolType.LaneOffset:
				return new LaneOffsetTool();
			case ToolType.PropCurve:
				return new PropCurveToolV2();
			case ToolType.PropPolygon:
				return new PropPolygonTool();
			case ToolType.Surface:
				return new SurfaceTool();
			case ToolType.MarkingPoint:
				return new MarkingPointTool();
			case ToolType.ParkingBox:
				return new ParkingBoxTool();
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			case ToolType.RoadSignalTool:
				return new RoadSignalTool();
			case ToolType.RoadRampTool:
				return new RoadRampTool();
			case ToolType.RoadCuttingTool:
				return new RoadCuttingTool();
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

	}
}
