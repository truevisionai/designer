import { ToolType } from "../models/tool-types.enum";
import { BaseTool } from "../tools/base-tool";
import { LaneAddTool } from "../tools/lane-add/lane-add-tool";
import { LaneCreateTool } from "../tools/lane-create/lane-create-tool";
import { LaneMarkingTool } from "../tools/lane-marking/lane-marking-tool";
import { LaneOffsetTool } from "../tools/lane-offset/lane-offset-tool";
import { LaneTool } from "../tools/lane/lane-tool";
import { LaneWidthTool } from "../tools/lane-width/lane-width-tool";
import { ManeuverTool } from "../tools/maneuver/maneuver-tool";
import { MarkingLineTool } from "../tools/marking-line/marking-line-tool";
import { MarkingPointTool } from "../tools/marking-point/marking-point-tool";
import { ParkingBoxTool } from "../tools/parking-box-tool";
import { PointerTool } from "../tools/pointer/pointer-tool";
import { PropCurveTool } from "../tools/prop-curve/prop-curve-tool";
import { PropPointTool } from "../tools/prop-point/prop-point-tool";
import { DeprecatedPropPolygonTool } from "../tools/prop-polygon/deprecated_prop_polygon_tool";
import { RoadCircleTool } from "../tools/road-circle/road-circle-tool";
import { RoadTool } from "../tools/road/road-tool";
import { SurfaceTool } from "../tools/surface/surface-tool";
import { PropPolygonTool } from "../tools/prop-polygon/prop-polygon-tool";
import { VehicleTool } from "../tools/vehicle/vehicle-tool";

export class ToolFactory {

	static createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Road:
				return new RoadTool();
			case ToolType.RoadCircle:
				return new RoadCircleTool();
			case ToolType.Maneuver:
				return new ManeuverTool();
			case ToolType.LaneWidth:
				return new LaneWidthTool();
			case ToolType.LaneOffset:
				return new LaneOffsetTool();
			case ToolType.PropPoint:
				return new PropPointTool();
			case ToolType.PropCurve:
				return new PropCurveTool();
			case ToolType.PropPolygon:
				return new PropPolygonTool();
				return new DeprecatedPropPolygonTool();
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
				return new MarkingLineTool();
			case ToolType.ParkingBox:
				return new ParkingBoxTool();
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

	}
}
