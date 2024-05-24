/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from "./tool-types.enum";
import { DebugServiceProvider } from "../core/providers/debug-service.provider";
import { RoadToolService } from "./road/road-tool.service";
import { SurfaceToolService } from "./surface/surface-tool.service";
import { PropPointService } from "../map/prop-point/prop-point.service";
import { RoadCircleToolService } from "./road-circle/road-circle-tool.service";
import { RoadElevationToolService } from "./road-elevation/road-elevation-tool.service";
import { ManeuverToolService } from "./maneuver/maneuver-tool.service";
import { LaneWidthToolService } from "./lane-width/lane-width-tool.service";
import { LaneMarkingToolService } from "./lane-marking/lane-marking-tool.service";
import { LaneToolService } from "./lane/lane-tool.service";
import { CrosswalkToolService } from "./crosswalk/crosswalk-tool.service";
import { RoadDividerToolService } from "./road-cut-tool/road-divider-tool.service";
import { JunctionToolService } from "./junction/junction-tool.service";
import { PropCurveService } from "../map/prop-curve/prop-curve.service";
import { RoadRampService } from "../services/road/road-ramp.service";
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
import { PropPolygonTool } from "./prop-polygon/prop-polygon.tool";
import { PropSpanTool } from "./prop-span/prop-span-tool";
import { PolePropTool } from "./prop-pole/pole-prop.tool";
import { SurfaceTool } from "./surface/surface.tool";
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
import { ControlPointStrategy } from "../core/strategies/select-strategies/control-point-strategy";
import { SelectionService } from "./selection.service";
import { PropPolygon } from "../map/prop-polygon/prop-polygon.model";
import { ObjectTagStrategy, ObjectUserDataStrategy } from "../core/strategies/select-strategies/object-tag-strategy";
import { Surface } from 'app/map/surface/surface.model';
import { FactoryServiceProvider } from "../core/providers/factory-service.provider";
import { ControlPointFactory } from "../factories/control-point.factory";
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { DataServiceProvider } from "./data-service-provider.service";
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { ToolHintsProvider } from "../core/providers/tool-hints.provider";
import { Tool } from "./tool";
import { LaneHeightTool } from './lane-height-tool/lane-height.tool';
import { BaseLaneTool } from "./base-lane.tool";
import { SelectLaneStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { TvLane } from 'app/map/models/tv-lane';
import { LaneHeightService } from 'app/map/lane-height/lane-height.service';
import { DebugLine } from 'app/objects/debug-line';
import { SelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { MidLaneMovingStrategy, } from "../core/strategies/move-strategies/end-lane.moving.strategy";
import { FollowHeadingMovingStrategy } from 'app/core/strategies/move-strategies/follow-heading-moving-strategy';
import { LaneNode } from "../objects/lane-node";
import { SimpleControlPoint } from "../objects/simple-control-point";
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { ManeuverMesh } from 'app/services/junction/junction.debug';
import { TrafficLightTool } from './traffic-light/traffic-light.tool';
import { TrafficLightToolService } from './traffic-light/traffic-light-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class ToolFactory {

	constructor (
		private debugFactory: DebugServiceProvider,
		private roadToolService: RoadToolService,
		private surfaceToolService: SurfaceToolService,
		private propPointService: PropPointService,
		private roadCircleService: RoadCircleToolService,
		private roadElevationService: RoadElevationToolService,
		private maneuverToolService: ManeuverToolService,
		private laneWidthService: LaneWidthToolService,
		private laneMarkingService: LaneMarkingToolService,
		private laneToolService: LaneToolService,
		private crosswalkService: CrosswalkToolService,
		private roadCutToolService: RoadDividerToolService,
		private junctionToolService: JunctionToolService,
		private propCurveService: PropCurveService,
		private roadRampService: RoadRampService,
		private parkingRoadToolService: ParkingRoadToolService,
		private textMarkingToolService: TextMarkingToolService,
		private propSpanToolService: PropSpanToolService,
		private propBarrierToolService: PolePropToolService,
		private pointMarkingToolService: PointMarkingToolService,
		private measurementToolService: MeasurementToolService,
		private roadSignalToolService: RoadSignalToolService,
		private selectionService: SelectionService,
		private factoryProvider: FactoryServiceProvider,
		private pointFactory: ControlPointFactory,
		private dataServiceProvider: DataServiceProvider,
		private toolHintsProvider: ToolHintsProvider,
		private laneHeightService: LaneHeightService,
		private trafficLightToolService: TrafficLightToolService,
	) {
	}

	createTool ( type: ToolType ): Tool {

		let tool: Tool;

		switch ( type ) {
			case ToolType.Road:
				tool = this.createRoadTool()
				break;
			case ToolType.RoadCircle:
				tool = new RoadCircleTool( this.roadCircleService );
				break;
			case ToolType.Maneuver:
				tool = new ManeuverTool( this.maneuverToolService );
				break;
			case ToolType.Junction:
				tool = new JunctionTool( this.junctionToolService );
				break;
			case ToolType.LaneWidth:
				tool = new LaneWidthTool( this.laneWidthService );
				break;
			case ToolType.PropPoint:
				tool = new PropPointTool();
				break;
			case ToolType.PropCurve:
				tool = new PropCurveTool();
				break;
			case ToolType.PropPolygon:
				tool = new PropPolygonTool();
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
			case ToolType.LaneHeight:
				tool = new LaneHeightTool();
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
			case ToolType.TrafficLight:
				tool = new TrafficLightTool( this.trafficLightToolService );
				break;
			default:
				throw new Error( 'Invalid tool type' + type );
				break;
		}

		if ( tool instanceof BaseTool ) {

			tool.setDebugService( this.debugFactory.createDebugService( type ) );

			tool.setDataService( this.dataServiceProvider.createDataService( type ) );

			tool.setObjectFactory( this.factoryProvider.createFromToolType( type ) );

			tool.setPointFactory( this.pointFactory );

			tool.setHints( this.toolHintsProvider.createFromToolType( type ) );

			this.setSelectionStrategies( tool, type );

		} else if ( tool instanceof BaseLaneTool ) {

			tool.debugger = this.debugFactory.createDebugService( type );

			tool.data = this.dataServiceProvider.createLinkedDataService( type );

			tool.factory = this.factoryProvider.createForLaneTool( type );

			tool.hints = this.toolHintsProvider.createFromToolType( type );

			tool.debugDrawService = this.debugFactory.debugDrawService;

			this.selectionService.reset();

			if ( type == ToolType.LaneHeight ) {

				this.selectionService.registerStrategy( LaneNode.name, new ControlPointStrategy() );

				this.selectionService.registerStrategy( DebugLine.name, new SelectLineStrategy() );

				this.selectionService.registerStrategy( TvLane.name, new SelectLaneStrategy() );

				this.selectionService.addMovingStrategy( new MidLaneMovingStrategy() );

			}

			tool.selection = this.selectionService;
		}

		return tool;
	}

	setSelectionStrategies ( tool: BaseTool<any>, type: ToolType ) {

		this.selectionService.reset();

		if ( type == ToolType.PropPolygon ) {
			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			this.selectionService.registerStrategy( PropPolygon.name, new ObjectUserDataStrategy<PropPolygon>( PropPolygon.tag, 'polygon' ) );
			tool.setTypeName( PropPolygon.name );
		}

		if ( type == ToolType.PropCurve ) {
			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			this.selectionService.registerStrategy( PropCurve.name, new ObjectUserDataStrategy<PropCurve>( PropCurve.tag, 'curve' ) );
			tool.setTypeName( PropCurve.name );
		}

		if ( type == ToolType.PropPoint ) {
			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			tool.setTypeName( PropInstance.name );
		}

		if ( type == ToolType.Surface ) {
			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			this.selectionService.registerStrategy( Surface.name, new ObjectUserDataStrategy( Surface.tag, 'surface' ) );
			tool.setTypeName( Surface.name );
		}

		if ( type == ToolType.Maneuver ) {

			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			this.selectionService.registerStrategy( ManeuverMesh.name, new ObjectTagStrategy( 'link' ) );
			this.selectionService.registerStrategy( TvJunction.name, new ObjectUserDataStrategy( 'junction', 'junction' ) );

			this.selectionService.registerTag( SimpleControlPoint.name, SimpleControlPoint.name );
			this.selectionService.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
			this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
			this.selectionService.registerTag( TvJunction.name, TvJunction.name );

			this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

			tool.setTypeName( TvJunction.name );

		}

		if ( type == ToolType.TrafficLight ) {

			this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
			this.selectionService.registerStrategy( DebugLine.name, new SelectLineStrategy() );
			this.selectionService.registerStrategy( ManeuverMesh.name, new ObjectTagStrategy( 'link' ) );
			this.selectionService.registerStrategy( TvJunction.name, new ObjectUserDataStrategy( 'junction', 'junction' ) );

			this.selectionService.registerTag( SimpleControlPoint.name, SimpleControlPoint.name );
			this.selectionService.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
			this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
			this.selectionService.registerTag( TvJunction.name, TvJunction.name );

			this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

			tool.setTypeName( TvJunction.name );

		}

		tool.setSelectionService( this.selectionService );

	}

	private createRoadTool () {

		return new RoadTool( this.roadToolService );

	}
}
