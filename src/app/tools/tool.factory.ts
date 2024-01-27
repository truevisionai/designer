import { Injectable } from '@angular/core';
import { ToolType } from "./tool-types.enum";
import { DebugServiceFactory } from "../services/debug/debug.factory";
import { RoadToolService } from "./road/road-tool.service";
import { SurfaceToolService } from "./surface/surface-tool.service";
import { PropPointService } from "./prop-point/prop-point.service";
import { RoadCircleToolService } from "./road-circle/road-circle-tool.service";
import { RoadElevationToolService } from "./road-elevation/road-elevation-tool.service";
import { ManeuverService } from "../services/junction/maneuver.service";
import { LaneWidthToolService } from "./lane-width/lane-width-tool.service";
import { LaneMarkingToolService } from "./lane-marking/lane-marking-tool.service";
import { LaneToolService } from "./lane/lane-tool.service";
import { CrosswalkToolService } from "./crosswalk/crosswalk-tool.service";
import { RoadDividerToolService } from "./road-cut-tool/road-divider-tool.service";
import { JunctionToolService } from "./junction/junction-tool.service";
import { PropCurveService } from "./prop-curve/prop-curve.service";
import { RoadRampService } from "../services/road/road-ramp.service";
import { PropPolygonToolService } from "./prop-polygon/prop-polygon-tool.service";
import { ParkingRoadToolService } from "./parking/parking-road-tool.service";
import { TextMarkingToolService } from "./text-marking/text-marking-tool.service";
import { PropSpanToolService } from "./prop-span/prop-span-tool.service";
import { PolePropToolService } from "./prop-pole/pole-prop.tool.service";
import { PointMarkingToolService } from "./point-marking/point-marking-tool.service";
import { MeasurementToolService } from "./measurement/measurement-tool.service";
import { RoadSignalToolService } from "./road-signal/road-signal-tool.service";
import { BaseTool } from "./base-tool";
import { RoadTool } from "./road/road-tool";
import { RoadCircleTool } from "./road-circle/road-circle-tool";
import { ManeuverTool } from "./maneuver/maneuver-tool";
import { JunctionTool } from "./junction/junction.tool";
import { LaneWidthTool } from "./lane-width/lane-width-tool";
import { PropPointTool } from "./prop-point/prop-point-tool";
import { PropCurveTool } from "./prop-curve/prop-curve-tool";
import { PropPolygonTool } from "./prop-polygon/prop-polygon-tool";
import { PropSpanTool } from "./prop-span/prop-span-tool";
import { PolePropTool } from "./prop-pole/pole-prop.tool";
import { SurfaceTool } from "./surface/surface-tool";
import { LaneMarkingTool } from "./lane-marking/lane-marking-tool";
import { LaneTool } from "./lane/lane-tool";
import { PointMarkingTool } from "./point-marking/point-marking.tool";
import { TextMarkingTool } from "./text-marking/text-marking.tool";
import { CrosswalkTool } from "./crosswalk/crosswalk-tool";
import { PointerTool } from "./pointer/pointer-tool";
import { MeasurementTool } from "./measurement/measurement.tool";
import { VehicleTool } from "./vehicle/vehicle-tool";
import { RoadSignalTool } from "./road-signal/road-signal-tool";
import { RoadElevationTool } from "./road-elevation/road-elevation.tool";
import { RoadRampTool } from "./road-ramp/road-ramp-tool";
import { RoadDividerTool } from "./road-cut-tool/road-divider-tool";
import { ParkingRoadTool } from "./parking/parking-road-tool";
import { ParkingLotTool } from "./parking/parking-lot.tool";
import { DataService } from "../services/debug/data.service";
import { SurfaceService } from "../services/surface/surface.service";

@Injectable( {
	providedIn: 'root'
} )
export class ToolFactory {

	constructor (
		private debugFactory: DebugServiceFactory,
		private roadToolService: RoadToolService,
		private surfaceToolService: SurfaceToolService,
		private propPointService: PropPointService,
		private roadCircleService: RoadCircleToolService,
		private roadElevationService: RoadElevationToolService,
		private maneuverService: ManeuverService,
		private laneWidthService: LaneWidthToolService,
		private laneMarkingService: LaneMarkingToolService,
		private laneToolService: LaneToolService,
		private crosswalkService: CrosswalkToolService,
		private roadCutToolService: RoadDividerToolService,
		private junctionToolService: JunctionToolService,
		private propCurveService: PropCurveService,
		private roadRampService: RoadRampService,
		private propPolygonToolService: PropPolygonToolService,
		private parkingRoadToolService: ParkingRoadToolService,
		private textMarkingToolService: TextMarkingToolService,
		private propSpanToolService: PropSpanToolService,
		private propBarrierToolService: PolePropToolService,
		private pointMarkingToolService: PointMarkingToolService,
		private measurementToolService: MeasurementToolService,
		private roadSignalToolService: RoadSignalToolService,
		private surfaceService: SurfaceService,
	) {
	}

	createTool ( type: ToolType ): BaseTool<any> {

		let tool: BaseTool<any>;

		switch ( type ) {
			case ToolType.Road:
				tool = this.createRoadTool()
				break;
			case ToolType.RoadCircle:
				tool = new RoadCircleTool( this.roadCircleService );
				break;
			case ToolType.Maneuver:
				tool = new ManeuverTool( this.maneuverService );
				break;
			case ToolType.Junction:
				tool = new JunctionTool( this.junctionToolService );
				break;
			case ToolType.LaneWidth:
				tool = new LaneWidthTool( this.laneWidthService );
				break;
			case ToolType.PropPoint:
				tool = new PropPointTool( this.propPointService );
				break;
			case ToolType.PropCurve:
				tool = new PropCurveTool( this.propCurveService );
				break;
			case ToolType.PropPolygon:
				tool = new PropPolygonTool( this.propPolygonToolService );
				break;
			case ToolType.PropSpanTool:
				tool = new PropSpanTool( this.propSpanToolService );
				break;
			case ToolType.PolePropTool:
				tool = new PolePropTool( this.propBarrierToolService );
				break;
			case ToolType.Surface:
				tool = new SurfaceTool( this.surfaceToolService );
				break;
			case ToolType.LaneMarking:
				tool = new LaneMarkingTool( this.laneMarkingService );
				break;
			case ToolType.Lane:
				tool = new LaneTool( this.laneToolService );
				break;
			case ToolType.PointMarkingTool:
				tool = new PointMarkingTool( this.pointMarkingToolService );
				break;
			case ToolType.TextMarkingTool:
				tool = new TextMarkingTool( this.textMarkingToolService );
				break;
			case ToolType.LineMarkingTool:
				throw new Error( 'Invalid tool type' + type );
			case ToolType.Crosswalk:
				tool = new CrosswalkTool( this.crosswalkService );
				break;
			case ToolType.Pointer:
				tool = new PointerTool();
				break;
			case ToolType.MeasurementTool:
				tool = new MeasurementTool( this.measurementToolService );
				break;
			case ToolType.Vehicle:
				tool = new VehicleTool();
				break;
			case ToolType.RoadSignalTool:
				tool = new RoadSignalTool( this.roadSignalToolService );
				break;
			case ToolType.RoadElevation:
				tool = new RoadElevationTool( this.roadElevationService );
				break;
			case ToolType.RoadRampTool:
				tool = new RoadRampTool( this.roadRampService );
				break;
			case ToolType.RoadDividerTool:
				tool = new RoadDividerTool( this.roadCutToolService );
				break;
			case ToolType.ParkingRoad:
				tool = new ParkingRoadTool( this.parkingRoadToolService );
				break;
			case ToolType.ParkingLot:
				tool = new ParkingLotTool( this.parkingRoadToolService );
				break;
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

		const debugService = this.debugFactory.createDebugService( type );

		const dataService = this.createDataService( type );

		tool.setDebugService( debugService );

		tool.setDataService( dataService );

		return tool;
	}

	createDataService ( type: ToolType ): DataService<any> {

		switch ( type ) {

			case ToolType.Road:
				return this.roadToolService.splineService;

			case ToolType.RoadCircle:
				return this.roadToolService.splineService;

			case ToolType.Surface:
				return this.surfaceService;
		}

	}

	private createRoadTool () {

		return new RoadTool( this.roadToolService );

	}
}
