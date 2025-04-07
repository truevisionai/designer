/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Compiler, Inject, Injectable, Injector, NgModuleFactory, NgModuleRef } from '@angular/core';
import { ToolType } from "./tool-types.enum";
import { DebugServiceProvider } from "../core/providers/debug-service.provider";
import { RoadToolHelper } from "./road/road-tool-helper.service";
import { RoadCircleToolService } from "./road-circle/road-circle-tool.service";
import { ManeuverToolHelper } from "./maneuver/maneuver-tool-helper.service";
import { LaneMarkingToolService } from "./lane-marking/lane-marking-tool.service";
import { LaneToolHelper } from "./lane/lane-tool.helper";
import { RoadDividerToolService } from "./road-cut-tool/road-divider-tool.service";
import { RampToolHelper } from "./road-ramp/road-ramp.helper";
import { ParkingRoadToolService } from "./parking/parking-road-tool.service";
import { TextMarkingToolService } from "./text-marking/text-marking-tool.service";
import { PropSpanToolService } from "./prop-span/prop-span-tool.service";
import { PolePropToolService } from "./prop-pole/pole-prop.tool.service";
import { PointMarkingToolService } from "./point-marking/point-marking-tool.service";
import { MeasurementToolService } from "./measurement/measurement-tool.service";
import { RoadSignToolService } from "./road-signal/road-sign-tool.service";
import { BaseTool } from "./base-tool";
import { RoadTool } from "./road/road-tool";
import { RoadCircleTool } from "./road-circle/road-circle-tool";
import { ManeuverTool } from "./maneuver/maneuver-tool";
import { PropPointTool } from "./prop-point/prop-point-tool";
import { PropPolygonTool } from "./prop-polygon/prop-polygon.tool";
import { PropSpanTool } from "./prop-span/prop-span-tool";
import { PolePropTool } from "./prop-pole/pole-prop.tool";
import { LaneMarkingTool } from "./lane-marking/lane-marking-tool";
import { LaneTool } from "./lane/lane-tool";
import { PointMarkingTool } from "./point-marking/point-marking.tool";
import { TextMarkingTool } from "./text-marking/text-marking.tool";
import { PointerTool } from "./pointer/pointer-tool";
import { MeasurementTool } from "./measurement/measurement.tool";
import { VehicleTool } from "./vehicle/vehicle-tool";
import { RoadSignTool } from "./road-signal/road-sign-tool";
import { RoadRampTool } from "./road-ramp/road-ramp-tool";
import { RoadDividerTool } from "./road-cut-tool/road-divider-tool";
import { ParkingRoadTool } from "./parking/parking-road-tool";
import { ParkingLotTool } from "./parking/parking-lot.tool";
import { DepPointStrategy } from "../core/strategies/select-strategies/control-point-strategy";
import { SelectionService } from "./selection.service";
import { PropPolygon } from "../map/prop-polygon/prop-polygon.model";
import { FactoryServiceProvider } from "../core/providers/factory-service.provider";
import { ControlPointFactory } from "../factories/control-point.factory";
import { DataServiceProvider } from "./data-service-provider.service";
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { Tool, TOOL_PROVIDERS } from "./tool";
import { LaneHeightTool } from './lane-height/lane-height.tool';
import { BaseLaneTool } from "./base-lane.tool";
import { DepSelectLaneStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { TvLane } from 'app/map/models/tv-lane';
import { DebugLine } from 'app/objects/debug-line';
import { DepSelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { MidLaneMovingStrategy, } from "../core/strategies/move-strategies/end-lane.moving.strategy";
import { LanePointNode } from "../objects/lane-node";
import { SimpleControlPoint } from "../objects/simple-control-point";
import { TrafficLightTool } from './traffic-light/traffic-light.tool';
import { TrafficLightToolService } from './traffic-light/traffic-light-tool.service';
import { EntityService } from "../scenario/entity/entity.service";
import { LaneHeightToolService } from './lane-height/lane-height-tool.service';
import { DebugConnectionTool, DebugConnectionToolService } from "./debug-connections/debug-connections.tool";
import { SuperElevationTool, SuperElevationToolHelper } from "./road-super-elevation/super-elevation.tool";
import { ObjectUserDataStrategy } from "../core/strategies/select-strategies/object-user-data-strategy";
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class ToolFactory {

	private toolMap = new Map<ToolType, Tool>();

	constructor (
		private compiler: Compiler,
		private injector: Injector,
		private debugFactory: DebugServiceProvider,
		private roadToolService: RoadToolHelper,
		private roadCircleService: RoadCircleToolService,
		private maneuverToolService: ManeuverToolHelper,
		private laneMarkingService: LaneMarkingToolService,
		private laneToolService: LaneToolHelper,
		private roadCutToolService: RoadDividerToolService,
		private parkingRoadToolService: ParkingRoadToolService,
		private textMarkingToolService: TextMarkingToolService,
		private propSpanToolService: PropSpanToolService,
		private propBarrierToolService: PolePropToolService,
		private pointMarkingToolService: PointMarkingToolService,
		private measurementToolService: MeasurementToolService,
		private roadSignalToolService: RoadSignToolService,
		private selectionService: SelectionService,
		private factoryProvider: FactoryServiceProvider,
		private pointFactory: ControlPointFactory,
		private dataServiceProvider: DataServiceProvider,
		private trafficLightToolService: TrafficLightToolService,
		@Inject( TOOL_PROVIDERS ) tools: Tool[],
	) {
		tools.forEach( tool => {
			this.toolMap.set( tool.toolType, tool );
		} )
	}

	createTool ( type: ToolType ): Tool | null {

		const tool = this.createToolInstance( type );

		this.setToolServices( tool, type );

		return tool;
	}

	createToolInstance ( type: ToolType ): Tool {

		if ( this.toolMap.has( type ) ) {
			return this.toolMap.get( type );
		}

		let tool: Tool

		switch ( type ) {
			case ToolType.DebugConnections:
				tool = new DebugConnectionTool( this.injector.get( DebugConnectionToolService ) );
				break;
			case ToolType.Road:
				tool = this.createRoadTool()
				break;
			case ToolType.RoadCircle:
				tool = new RoadCircleTool( this.roadCircleService );
				break;
			case ToolType.SuperElevation:
				tool = new SuperElevationTool( this.injector.get( SuperElevationToolHelper ) );
				break;
			case ToolType.Maneuver:
				tool = new ManeuverTool( this.maneuverToolService );
				break;
			case ToolType.PropPoint:
				tool = new PropPointTool();
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
			case ToolType.LaneMarking:
				tool = new LaneMarkingTool( this.laneMarkingService );
				break;
			case ToolType.Lane:
				tool = new LaneTool( this.laneToolService );
				break;
			case ToolType.LaneHeight:
				tool = new LaneHeightTool( this.injector.get( LaneHeightToolService ) );
				break;
			case ToolType.PointMarkingTool:
				tool = new PointMarkingTool( this.pointMarkingToolService );
				break;
			case ToolType.TextMarkingTool:
				tool = new TextMarkingTool( this.textMarkingToolService );
				break;
			case ToolType.Pointer:
				tool = new PointerTool();
				break;
			case ToolType.MeasurementTool:
				tool = new MeasurementTool( this.measurementToolService );
				break;
			case ToolType.Vehicle:
				tool = new VehicleTool( this.injector.get( EntityService ) );
				break;
			case ToolType.RoadSignTool:
				tool = new RoadSignTool( this.roadSignalToolService );
				break;
			case ToolType.RoadRampTool:
				tool = new RoadRampTool( this.injector.get( RampToolHelper ) );
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
				Log.error( 'Invalid tool type' + type );
				break;
		}

		return tool;

	}

	setSelectionStrategies ( tool: BaseTool<any>, type: ToolType ): void {

		this.selectionService.reset();

		if ( type == ToolType.PropPolygon ) {
			this.selectionService.registerStrategy( SimpleControlPoint, new DepPointStrategy() );
			this.selectionService.registerStrategy( PropPolygon, new ObjectUserDataStrategy<PropPolygon>( PropPolygon.tag, 'polygon' ) );
			tool.setTypeName( PropPolygon.name );
		}

		if ( type == ToolType.PropPoint ) {
			this.selectionService.registerStrategy( SimpleControlPoint, new DepPointStrategy() );
			tool.setTypeName( PropInstance.name );
		}

		tool.setSelectionService( this.selectionService );

	}

	private createRoadTool (): RoadTool {

		return new RoadTool( this.roadToolService );

	}

	async loadToolModule ( toolType: ToolType ): Promise<Tool> {

		if ( this.toolMap.has( toolType ) ) {
			return this.toolMap.get( toolType );
		}

		let moduleFactory: NgModuleFactory<any>;

		if ( toolType == ToolType.ParkingSpot ) {

			const { ParkingSpotModule } = await import( 'app/modules/parking-spot/parking-spot.module' );

			// For JIT, compile the module. (In AOT mode, this step is not necessary)
			moduleFactory = await this.compiler.compileModuleAsync( ParkingSpotModule );

		} else {

			Log.error( 'Tool module not found' );
			return;

		}

		const moduleRef: NgModuleRef<any> = moduleFactory.create( this.injector );

		const tool = moduleRef.injector.get( TOOL_PROVIDERS ).find( tool => tool.toolType === toolType );

		this.toolMap.set( toolType, tool );

		this.setToolServices( tool, toolType );

		return tool;

	}

	private setToolServices ( tool: Tool, type: ToolType ): void {

		this.selectionService.reset();

		if ( tool instanceof BaseTool ) {

			tool.setDebugService( this.debugFactory.createDebugService( type ) );

			tool.setDataService( this.dataServiceProvider.createDataService( type ) );

			tool.setObjectFactory( this.factoryProvider.createFromToolType( type ) );

			tool.setPointFactory( this.pointFactory );

			this.setSelectionStrategies( tool, type );

		} else if ( tool instanceof BaseLaneTool ) {

			tool.debugger = this.debugFactory.createDebugService( type );

			tool.data = this.dataServiceProvider.createLinkedDataService( type );

			tool.factory = this.factoryProvider.createForLaneTool( type );

			tool.debugDrawService = this.debugFactory.debugDrawService;

			this.selectionService.reset();

			if ( type == ToolType.LaneHeight ) {

				this.selectionService.registerStrategy( LanePointNode, new DepPointStrategy() );

				this.selectionService.registerStrategy( DebugLine, new DepSelectLineStrategy() );

				this.selectionService.registerStrategy( TvLane, new DepSelectLaneStrategy() );

				this.selectionService.addMovingStrategy( new MidLaneMovingStrategy() );

			}

			tool.selection = this.selectionService;
		}

	}
}
