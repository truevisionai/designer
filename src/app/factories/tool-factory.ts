/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tools/tool-types.enum';
import { BaseTool } from '../tools/base-tool';
import { LaneAddTool } from '../tools/lane-add/lane-add-tool';
import { LaneCreateTool } from '../tools/lane-create/lane-create-tool';
import { LaneMarkingTool } from '../tools/lane-marking/lane-marking-tool';
import { LaneOffsetTool } from '../tools/lane-offset/lane-offset-tool';
import { LaneWidthTool } from '../tools/lane-width/lane-width-tool';
import { LaneTool } from '../tools/lane/lane-tool';
import { ManeuverTool } from '../tools/maneuver/maneuver-tool';
import { CrosswalkTool } from '../tools/marking-line/crosswalk-tool';
import { MarkingPointTool } from '../tools/marking-point/marking-point-tool';
import { ParkingBoxTool } from '../tools/parking-box-tool';
import { PointerTool } from '../tools/pointer/pointer-tool';
import { PropCurveToolV2 } from '../tools/prop-curve/prop-curve-tool';
import { PropPointTool } from '../tools/prop-point/prop-point-tool';
import { PropPolygonTool } from '../tools/prop-polygon/prop-polygon-tool';
import { RoadCircleTool } from '../tools/road-circle/road-circle-tool';
import { RoadElevationTool } from '../tools/road-elevation/road-elevation-tool';
import { RoadRampTool } from '../tools/road-ramp/road-ramp-tool';
import { RoadSignalTool } from '../tools/road-signal-tool';
import { RoadTool } from '../tools/road/road-tool';
import { SurfaceTool } from '../tools/surface/surface-tool';
import { VehicleTool } from '../tools/vehicle/vehicle-tool';
import { RoadCuttingTool } from 'app/tools/road-cut-tool/road-cut-tool';
import { JunctionTool } from 'app/tools/junction-tool/junction.tool';

export class ToolFactory {

	static createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Road:
				return new RoadTool();
			case ToolType.RoadCircle:
				return new RoadCircleTool();
			case ToolType.Maneuver:
				return new ManeuverTool();
			case ToolType.Junction:
				return new JunctionTool();
			case ToolType.LaneWidth:
				return new LaneWidthTool();
			case ToolType.LaneOffset:
				return new LaneOffsetTool();
			case ToolType.PropCurve:
				return new PropCurveToolV2();
			case ToolType.PropPolygon:
				return new PropPolygonTool();
			case ToolType.Surface:
				return new SurfaceTool();
			case ToolType.LaneMarking:
				return new LaneMarkingTool();
			case ToolType.LaneAdd:
				return new LaneAddTool();
			case ToolType.LaneCreate:
				return new LaneCreateTool();
			case ToolType.Lane:
				return new LaneTool();
			case ToolType.MarkingPoint:
				return new MarkingPointTool();
			case ToolType.MarkingLine:
				throw new Error( 'Invalid tool type' + type );
			case ToolType.Crosswalk:
				return new CrosswalkTool();
			case ToolType.ParkingBox:
				return new ParkingBoxTool();
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			case ToolType.RoadSignalTool:
				return new RoadSignalTool();
			case ToolType.RoadElevation:
				return new RoadElevationTool();
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
