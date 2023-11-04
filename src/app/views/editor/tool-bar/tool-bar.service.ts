import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/commands/set-tool-command';
import { CommandHistory } from 'app/services/command-history';
import { RoadService } from 'app/services/road/road.service';
import { BaseTool } from 'app/tools/base-tool';
import { JunctionTool } from 'app/tools/junction-tool/junction.tool';
import { LaneAddTool } from 'app/tools/lane-add/lane-add-tool';
import { LaneCreateTool } from 'app/tools/lane-create/lane-create-tool';
import { LaneMarkingTool } from 'app/tools/lane-marking/lane-marking-tool';
import { LaneOffsetTool } from 'app/tools/lane-offset/lane-offset-tool';
import { LaneWidthTool } from 'app/tools/lane-width/lane-width-tool';
import { LaneTool } from 'app/tools/lane/lane-tool';
import { ManeuverTool } from 'app/tools/maneuver/maneuver-tool';
import { CrosswalkTool } from 'app/tools/marking-line/crosswalk-tool';
import { MarkingPointTool } from 'app/tools/marking-point/marking-point-tool';
import { ParkingBoxTool } from 'app/tools/parking-box-tool';
import { PointerTool } from 'app/tools/pointer/pointer-tool';
import { PropCurveToolV2 } from 'app/tools/prop-curve/prop-curve-tool';
import { PropPointTool } from 'app/tools/prop-point/prop-point-tool';
import { PropPolygonTool } from 'app/tools/prop-polygon/prop-polygon-tool';
import { RoadCircleTool } from 'app/tools/road-circle/road-circle-tool';
import { RoadCuttingTool } from 'app/tools/road-cut-tool/road-cut-tool';
import { RoadElevationTool } from 'app/tools/road-elevation/road-elevation-tool';
import { RoadRampTool } from 'app/tools/road-ramp/road-ramp-tool';
import { RoadSignalTool } from 'app/tools/road-signal-tool';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolv2 } from 'app/tools/road/RoadToolv2';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { SurfaceTool } from 'app/tools/surface/surface-tool';
import { SurfaceToolv2 } from 'app/tools/surface/SurfaceToolv2';
import { ToolType } from 'app/tools/tool-types.enum';
import { VehicleTool } from 'app/tools/vehicle/vehicle-tool';
import { SurfaceToolService } from 'app/tools/surface/surface-tool.service';
import { PropPointService } from 'app/tools/prop-point/prop-point.service';

@Injectable( {
	providedIn: 'root'
} )
export class ToolBarService {

	constructor (
		private roadToolService: RoadToolService,
		private surfaceToolService: SurfaceToolService,
		private propPointService: PropPointService,
	) { }

	setTool ( tool: BaseTool ) {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}

	setToolByType ( type: ToolType ) {

		const tool = this.createTool( type );
		this.setTool( tool );

	}

	createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Road:
				return new RoadToolv2( this.roadToolService ) as any;
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
			case ToolType.PropPoint:
				return new PropPointTool(this.propPointService) as any;
			case ToolType.PropCurve:
				return new PropCurveToolV2();
			case ToolType.PropPolygon:
				return new PropPolygonTool();
			case ToolType.Surface:
				return new SurfaceToolv2( this.surfaceToolService ) as any;
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
