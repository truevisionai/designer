import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/commands/set-tool-command';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from 'app/tools/base-tool';
import { JunctionTool } from 'app/tools/junction-tool/junction.tool';
import { LaneMarkingTool } from 'app/tools/lane-marking/lane-marking-tool';
import { LaneWidthTool } from 'app/tools/lane-width/lane-width-tool';
import { LaneTool } from 'app/tools/lane/lane-tool';
import { ManeuverTool } from 'app/tools/maneuver/maneuver-tool';
import { CrosswalkTool } from 'app/tools/marking-line/crosswalk-tool';
import { MarkingPointTool } from 'app/tools/marking-point/marking-point-tool';
import { PointerTool } from 'app/tools/pointer/pointer-tool';
import { PropCurveTool } from 'app/tools/prop-curve/prop-curve-tool';
import { PropPointTool } from 'app/tools/prop-point/prop-point-tool';
import { PropPolygonTool } from 'app/tools/prop-polygon/prop-polygon-tool';
import { RoadCircleTool } from 'app/tools/road-circle/road-circle-tool';
import { RoadDividerTool } from 'app/tools/road-cut-tool/road-divider-tool';
import { RoadElevationTool } from 'app/tools/road-elevation/road-elevation-tool';
import { RoadRampTool } from 'app/tools/road-ramp/road-ramp-tool';
import { RoadSignalTool } from 'app/tools/road-signal-tool';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { SurfaceTool } from 'app/tools/surface/surface-tool';
import { ToolType } from 'app/tools/tool-types.enum';
import { VehicleTool } from 'app/tools/vehicle/vehicle-tool';
import { SurfaceToolService } from 'app/tools/surface/surface-tool.service';
import { PropPointService } from 'app/tools/prop-point/prop-point.service';
import { RoadCircleService } from 'app/services/road/road-circle.service';
import { RoadElevationService } from 'app/services/road/road-elevation.service';
import { ManeuverService } from 'app/services/junction/maneuver.service';
import { LaneWidthService } from 'app/tools/lane-width/lane-width.service';
import { LaneMarkingService } from 'app/tools/lane-marking/lane-marking.service';
import { LaneService } from 'app/tools/lane/lane.service';
import { RoadObjectService } from 'app/tools/marking-line/road-object.service';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { BaseToolService } from 'app/tools/base-tool.service';
import { RoadDividerToolService } from 'app/tools/road-cut-tool/road-divider-tool.service';
import { JunctionService } from 'app/services/junction/junction.service';
import { ToolManager } from 'app/tools/tool-manager';
import { PropCurveService } from 'app/tools/prop-curve/prop-curve.service';
import { RoadRampService } from 'app/services/road/road-ramp.service';
import { CrosswalkToolService } from "../../../tools/marking-line/crosswalk-tool.service";
import { PropPolygonToolService } from "../../../tools/prop-polygon/prop-polygon-tool.service";

@Injectable( {
	providedIn: 'root'
} )
export class ToolBarService {

	constructor (
		private roadToolService: RoadToolService,
		private surfaceToolService: SurfaceToolService,
		private propPointService: PropPointService,
		private roadCircleService: RoadCircleService,
		private roadElevationService: RoadElevationService,
		private maneuverService: ManeuverService,
		private laneWidthService: LaneWidthService,
		private laneMarkingService: LaneMarkingService,
		private laneService: LaneService,
		private crosswalkService: CrosswalkToolService,
		private roadCuttingService: RoadDividerService,
		private baseToolService: BaseToolService,
		private roadCutToolService: RoadDividerToolService,
		private junctionService: JunctionService,
		private propCurveService: PropCurveService,
		private roadRampService: RoadRampService,
		private propPolygonToolService: PropPolygonToolService
	) {
	}

	setToolByType ( type: ToolType ) {

		if ( ToolManager.currentTool?.toolType === type ) return;

		this.setTool( this.createTool( type ) );

	}

	createTool ( type: ToolType ): BaseTool {

		switch ( type ) {
			case ToolType.Road:
				return new RoadTool( this.roadToolService );
			case ToolType.RoadCircle:
				return new RoadCircleTool( this.roadCircleService );
			case ToolType.Maneuver:
				return new ManeuverTool( this.maneuverService );
			case ToolType.Junction:
				return new JunctionTool( this.junctionService );
			case ToolType.LaneWidth:
				return new LaneWidthTool( this.laneWidthService );
			case ToolType.PropPoint:
				return new PropPointTool( this.propPointService );
			case ToolType.PropCurve:
				return new PropCurveTool( this.propCurveService );
			case ToolType.PropPolygon:
				return new PropPolygonTool( this.propPolygonToolService );
			case ToolType.Surface:
				return new SurfaceTool( this.surfaceToolService );
			case ToolType.LaneMarking:
				return new LaneMarkingTool( this.laneMarkingService );
			case ToolType.Lane:
				return new LaneTool( this.laneService );
			case ToolType.MarkingPoint:
				return new MarkingPointTool();
			case ToolType.MarkingLine:
				throw new Error( 'Invalid tool type' + type );
			case ToolType.Crosswalk:
				return new CrosswalkTool( this.crosswalkService );
			case ToolType.Pointer:
				return new PointerTool();
			case ToolType.Vehicle:
				return new VehicleTool();
			case ToolType.RoadSignalTool:
				return new RoadSignalTool();
			case ToolType.RoadElevation:
				return new RoadElevationTool( this.roadElevationService );
			case ToolType.RoadRampTool:
				return new RoadRampTool( this.roadRampService );
			case ToolType.RoadDividerTool:
				return new RoadDividerTool( this.roadCutToolService );
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

	}

	private setTool ( tool: BaseTool ) {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}
}
