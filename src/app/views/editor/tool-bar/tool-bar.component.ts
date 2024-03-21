/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { ToolType } from 'app/tools/tool-types.enum';
import { CommandHistory } from 'app/services/command-history';
import { ToolManager } from '../../../managers/tool-manager';
import { ThreeService } from '../../../renderer/three.service';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { EnvironmentInspectorComponent } from 'app/views/inspectors/environment-inspector/environment-inspector.component';
import { Environment } from 'app/core/utils/environment';
import { ToolBarService } from './tool-bar.service';
import { MatToolbar } from '@angular/material/toolbar';
import { Tool } from "../../../tools/tool";

class IToolMenu {
	id: string;
	label: string;
	class?: string = 'toolbar-button';
	toolType: ToolType;
	action: string;
	icon: string;
	icon2?: string;
	title?: string;
	description?: string;
	track: string;
	tooltip: string;
	click: Function;
	enabled?: boolean = true;
}

@Component( {
	selector: 'app-tool-bar',
	templateUrl: './tool-bar.component.html',
	styleUrls: [ './tool-bar.component.css' ],
} )
export class ToolBarComponent implements OnInit, AfterViewInit {

	currentTool: Tool;

	ToolType = ToolType;

	mouseOnTool: IToolMenu;

	@ViewChild( 'popover', { static: false } ) popover: SatPopover;

	@ViewChild( 'toolbar', { static: false } ) toolbar: MatToolbar;

	private tools: IToolMenu[] = [
		{
			id: 'showPointerTool',
			label: 'Pointer',
			class: 'toolbar-button border-right',
			toolType: ToolType.Pointer,
			action: 'pointer-tool',
			icon: 'mouse',
			title: 'Pointer Tool',
			description: 'Pointer tool is used to view from different angles and to select the objects. You can browse the scene without interacting with any object in the scene',
			track: 'menu',
			tooltip: 'Pointer Tool',
			click: () => this.setToolType( ToolType.Pointer ),
			enabled: true,
		},
		{
			id: 'showMeasurementTool',
			label: 'Measurement',
			class: 'toolbar-button border-right',
			toolType: ToolType.MeasurementTool,
			action: 'Measurement-tool',
			icon: 'straighten',
			title: 'Measurement Tool',
			description: 'Measurement tool is used to measure the distance between two points in the scene',
			track: 'menu',
			tooltip: 'Measurement Tool',
			click: () => this.setToolType( ToolType.MeasurementTool ),
			enabled: true,
		},
		{
			id: 'showRoadTool',
			label: 'Road',
			class: 'toolbar-button',
			toolType: ToolType.Road,
			action: 'road-plan-tool',
			icon: 'timeline',
			title: 'ROAD-GEOMETRY-TITLE',
			description: 'ROAD-GEOMETRY-DESCRIPTION',
			track: 'button',
			tooltip: 'Road Tool',
			click: () => this.setToolType( ToolType.Road ),
			enabled: true,
		},
		{
			id: 'showRoadCircleTool',
			label: 'Circle',
			class: 'toolbar-button',
			toolType: ToolType.RoadCircle,
			action: 'road-circle-tool',
			icon: 'trip_origin',
			title: 'ROAD-CIRCLE-TITLE',
			description: 'ROAD-CIRCLE-DESCRIPTION',
			track: 'button',
			tooltip: 'Road Circle Tool',
			click: () => this.setToolType( ToolType.RoadCircle ),
			enabled: true,
		},
		{
			id: 'showRampTool',
			label: 'Ramp',
			class: 'toolbar-button',
			toolType: ToolType.RoadRampTool,
			action: 'ramp-tool',
			icon: 'fork_right', // fork_right, call_split
			track: 'menu',
			tooltip: 'Ramp Tool',
			click: () => this.setToolType( ToolType.RoadRampTool ),
			enabled: Environment.experimentalTools,
		},
		{
			id: 'showDividerTool',
			label: 'Divide',
			class: 'toolbar-button',
			toolType: ToolType.RoadDividerTool,
			action: 'divider-tool',
			icon: 'content_cut', // fork_right, call_split
			track: 'menu',
			tooltip: 'Divider Tool',
			title: 'Road Divider Tool',
			description: 'Tool to divide roads into two connected roads',
			click: () => this.setToolType( ToolType.RoadDividerTool ),
			enabled: true,
		},
		{
			id: 'showRoadElevationTool',
			label: 'Elevation',
			class: 'toolbar-button border-right',
			toolType: ToolType.RoadElevation,
			action: 'road-Elevation-tool',
			icon: 'height',
			title: 'Road Elevation Tool',
			description: 'Tool to create/edit elevation and height profile of the road',
			track: 'button',
			tooltip: 'Road Elevation Tool',
			click: () => this.setToolType( ToolType.RoadElevation ),
			enabled: true,
		},
		{
			id: 'showLaneTool',
			label: 'Lane',
			class: 'toolbar-button',
			toolType: ToolType.Lane,
			action: 'lane-tool',
			icon: 'swap_horiz',
			title: 'LANE-TOOL-TITLE',
			description: 'LANE-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Lane Tool',
			click: () => this.setToolType( ToolType.Lane ),
			enabled: true,
		},
		{
			id: 'showLaneWidthTool',
			label: 'LaneWidth',
			class: 'toolbar-button',
			toolType: ToolType.LaneWidth,
			action: 'lane-width-tool',
			icon: 'format_line_spacing',
			title: 'LANE-WIDTH-TOOL-TITLE',
			description: 'LANE-WIDTH-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Lane Width Tool',
			click: () => this.setToolType( ToolType.LaneWidth ),
			enabled: true,
		},
		{
			id: 'showLaneHeightTool',
			label: 'LaneHeight',
			class: 'toolbar-button',
			toolType: ToolType.LaneHeight,
			action: 'lane-height-tool',
			icon: 'upload',
			title: 'LANE-HEIGHT-TOOL-TITLE',
			description: 'LANE-HEIGHT-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Lane Height Tool',
			click: () => this.setToolType( ToolType.LaneHeight ),
			enabled: true,
		},
		// {
		// 	id: 'showLaneOffsetTool',
		// 	label: 'LaneOffset',
		// 	class: 'toolbar-button',
		// 	toolType: ToolType.LaneOffset,
		// 	action: 'lane-offset-tool',
		// 	icon: 'vertical_align_center',
		// 	track: 'button',
		// 	tooltip: 'Lane Offset Tool',
		// 	title: 'Lane Offset Tool',
		// 	description: 'This tool allows for precise adjustment of individual lanes in a 3D road network, without the need to shift the entire road"s reference line. Whether it is to add a new turning lane or to modify an existing one <br/><br/> <img src="assets/Lane-Offset-Tool.gif"/>',
		// 	click: () => this.setToolType( ToolType.LaneOffset ),
		// 	enabled: true,
		// },
		// {
		// 	id: 'showAddLaneTool',
		// 	label: 'AddLane',
		// 	class: 'toolbar-button',
		// 	toolType: ToolType.LaneAdd,
		// 	action: 'add-lane-tool',
		// 	icon: 'playlist_add',
		// 	title: 'ADD-LANE-TOOL-TITLE',
		// 	description: 'ADD-LANE-TOOL-DESCRIPTION',
		// 	track: 'button',
		// 	tooltip: 'Add Lane Tool',
		// 	click: () => this.setToolType( ToolType.LaneAdd ),
		// 	enabled: false,
		// },
		{
			id: 'showLaneMarkingTool',
			label: 'LaneMarking',
			class: 'toolbar-button border-right',
			toolType: ToolType.LaneMarking,
			action: 'lane-marking-tool',
			icon: 'format_align_center',
			title: 'LANE-MARKING-TOOL-TITLE',
			description: 'LANE-MARKING-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Add Lane Tool',
			click: () => this.setToolType( ToolType.LaneMarking ),
			enabled: true,
		},
		{
			id: 'showJunctionTool',
			label: 'Junction',
			class: 'toolbar-button',
			toolType: ToolType.Junction,
			action: 'junction',
			icon: 'grid_goldenratio',
			title: 'Junction Tool',
			description: 'Tool to create custom junctions',
			track: 'button',
			tooltip: 'Junction Tool',
			click: () => this.setToolType( ToolType.Junction ),
			enabled: Environment.developmentTools,
		},
		{
			id: 'showManeueverTool',
			label: 'Maneuver',
			class: 'toolbar-button',
			toolType: ToolType.Maneuver,
			action: 'maneuver-tool',
			icon: 'roundabout_left',//'fullscreen_exit',
			title: 'Maneuver Tool',
			description: 'Tool to create/edit junction maneuvers.',
			// description: 'Tool to create/edit junction maneuvers <br/> Use SHIFT + LEFT CLICK to select multiple entry/exits <br/> Use LEFT CLICK to select single junction entry/exit <br/> Merge Entry/Exists from inspector to create a junction maneuver <br/><br/> <img src="assets/Maneuver-Tool.gif"/>',
			track: 'button',
			tooltip: 'Maneuver Tool',
			click: () => this.setToolType( ToolType.Maneuver ),
			enabled: Environment.developmentTools,
		},
		{
			id: 'showTrafficTool',
			label: 'Traffic-Light',
			class: 'toolbar-button',
			toolType: ToolType.TrafficLight,
			action: 'traffic-light-tool',
			icon: 'traffic',
			title: 'Traffic Light Tool',
			description: '',
			track: 'button',
			tooltip: 'Traffic Light Tool',
			click: () => this.setToolType( ToolType.TrafficLight ),
			enabled: Environment.experimentalTools,
		},
		{
			id: 'showCrosswalkTool',
			label: 'Crosswalk',
			class: 'toolbar-button  border-right',
			toolType: ToolType.Crosswalk,
			action: 'crosswalk-tool',
			icon: 'reorder', // 'call_split', receipt
			title: 'Crosswalk Tool',
			description: 'Tool to create crosswalks on road.',
			track: 'button',
			tooltip: 'Crosswalk Tool',
			click: () => this.setToolType( ToolType.Crosswalk ),
			enabled: true,
		},
		{
			id: 'showPointMarkingTool',
			label: 'Point Marking',
			class: 'toolbar-button',
			toolType: ToolType.PointMarkingTool,
			action: 'point-marking-tool',
			icon: 'call_split',
			title: 'Point Marking Tool',
			description: 'Tool to create road marking points <br/> Select a roadmarking from ProjectBrowser <br/> Then use SHIFT + LEFT CLICK on road to create a roadmarking point',
			track: 'button',
			tooltip: 'Point Marking Tool',
			click: () => this.setToolType( ToolType.PointMarkingTool ),
			enabled: Environment.developmentTools,
		},
		{
			id: 'showTextMarkingTool',
			label: 'Text Marking',
			class: 'toolbar-button',
			toolType: ToolType.TextMarkingTool,
			action: 'text-marking-tool',
			icon: 'text_fields', // format_color_text, text_fields
			title: 'Text Marking Tool',
			description: 'Tool to create text markings on road.',
			track: 'button',
			tooltip: 'Text Marking Tool',
			click: () => this.setToolType( ToolType.TextMarkingTool ),
			enabled: Environment.developmentTools,
		},
		{
			id: 'showParkingRoadTool',
			label: 'Parking Road',
			class: 'toolbar-button',
			toolType: ToolType.ParkingRoad,
			action: 'parking-road-tool',
			icon: 'local_parking',
			icon2: 'timeline',
			title: 'Parking Road Tool',
			description: '',
			track: 'button',
			tooltip: 'Parking Road Tool',
			click: () => this.setToolType( ToolType.ParkingRoad ),
			enabled: Environment.experimentalTools,
		},
		{
			id: 'showParkingLotTool',
			label: 'Parking Lot',
			class: 'toolbar-button',
			toolType: ToolType.ParkingLot,
			action: 'parking-lot-tool',
			icon: 'local_parking',
			icon2: 'square',
			title: 'Parking Lot Tool',
			description: '',
			track: 'button',
			tooltip: 'Parking Lot Tool',
			click: () => this.setToolType( ToolType.ParkingLot ),
			enabled: Environment.experimentalTools,
		},
		{

			id: 'showPropPointTool',
			label: 'PropPoint',
			class: 'toolbar-button',
			toolType: ToolType.PropPoint,
			action: 'prop-point-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Point Tool',
			title: 'PROP-POINT-TOOL-TITLE',
			description: 'PROP-POINT-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.PropPoint ),
			enabled: true,
		},
		{
			id: 'showPropCurveTool',
			label: 'PropCurve',
			class: 'toolbar-button',
			toolType: ToolType.PropCurve,
			action: 'prop-curve-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Curve Tool',
			title: 'PROP-CURVE-TOOL-TITLE',
			description: 'PROP-CURVE-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.PropCurve ),
			enabled: true,
		},
		{
			id: 'showPropPolygonTool',
			label: 'PropPolygon',
			class: 'toolbar-button',
			toolType: ToolType.PropPolygon,
			action: 'prop-polygon-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Polygon Tool',
			title: 'PROP-POLYGON-TOOL-TITLE',
			description: 'PROP-POLYGON-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.PropPolygon ),
			enabled: true,
		},
		{
			id: 'showPropSpanTool',
			label: 'PropSpan',
			class: 'toolbar-button',
			toolType: ToolType.PropSpanTool,
			action: 'prop-span-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Span Tool',
			title: 'Prop Span Tool',
			description: 'Tool to place objects which are aligned with road span/shape',
			click: () => this.setToolType( ToolType.PropSpanTool ),
			enabled: Environment.developmentTools,
		},
		{
			id: 'showPolePropTool',
			label: 'Pole',
			class: 'toolbar-button',
			toolType: ToolType.PolePropTool,
			action: 'pole-prop-tool',
			icon: 'golf_course',
			track: 'button',
			tooltip: 'Pole Tool',
			title: 'Pole Prop Tool',
			description: '',
			click: () => this.setToolType( ToolType.PolePropTool ),
			enabled: Environment.experimentalTools,
		},
		{
			id: 'signal',
			label: 'Signal',
			class: 'toolbar-button border-right',
			toolType: ToolType.RoadSignalTool,
			action: 'signal-tool',
			icon: 'directions', // signpost,directions
			track: 'menu',
			tooltip: 'Signal Tool',
			click: () => this.setToolType( ToolType.RoadSignalTool ),
			enabled: Environment.experimentalTools,
		},
		{
			id: 'showSurfaceTool',
			label: 'Surface',
			class: 'toolbar-button',
			toolType: ToolType.Surface,
			action: 'surface-tool',
			icon: 'landscape',
			track: 'button',
			tooltip: 'Surface Tool',
			title: 'Surface Tool',
			description: 'Tool to create simple surface around road networks <br/> Use `SHIFT` + `LEFT CLICK` to create control points <br/> DRAG control points to get desired shape <br/><br/> <img src="assets/Surface-Tool.gif"/>',
			click: () => this.setToolType( ToolType.Surface ),
			enabled: true,
		},
		{
			id: 'vehicle',
			label: 'Vehicle Tool',
			class: 'toolbar-button',
			toolType: ToolType.Vehicle,
			action: 'vehicle-tool',
			icon: 'directions_car',
			track: 'menu',
			tooltip: 'Vehicle Tool',
			click: () => this.setToolType( ToolType.Vehicle ),
			enabled: Environment.experimentalTools && Environment.oscEnabled,
		},
		{
			id: 'environment',
			label: 'Environment',
			class: 'toolbar-button',
			toolType: ToolType.Environment,
			action: 'environment-tool',
			icon: 'light_mode',
			track: 'menu',
			tooltip: 'Environment',
			click: () => {

				const environment = this.threeService.environment;

				const command = new SetInspectorCommand( EnvironmentInspectorComponent, environment )

				CommandHistory.execute( command );

			},
			enabled: Environment.experimentalTools && Environment.oscEnabled,
		},
		// add more tools here...
	];

	enabledTools = this.tools.filter( tool => tool.enabled );

	constructor (
		private threeService: ThreeService,
		private viewContainerRef: ViewContainerRef,
		private toolBarService: ToolBarService,
	) {
	}

	ngOnInit () {

		ToolManager.toolChanged.subscribe( ( tool: Tool ) => {

			this.currentTool = tool;

		} );

	}

	ngAfterViewInit (): void {

		this.toolBarService.setToolbarHeight( this.toolbar._elementRef.nativeElement.offsetHeight );

	}

	getClass ( tool: IToolMenu ) {

		if ( !this.currentTool ) return tool.class;

		return this.currentTool.toolType == tool.toolType ? 'mat-accent ' + tool.class : tool.class;

	}

	onMouseOver ( tool: IToolMenu ) {

		if ( tool.description ) {

			const element = document.getElementById( tool.id );

			this.popover.setCustomAnchor( this.viewContainerRef, element );

			// bug fix to avoid auto selection of tool and buttons
			// which makes them appear as selected
			this.popover.open( {
				restoreFocus: false,
				autoFocus: false
			} );

			this.mouseOnTool = tool;

		} else {

			this.popover.close();

			this.mouseOnTool = null;

		}

	}

	onMouseOut ( tool: any ) {

		this.popover.anchor = null;

		this.popover.close();

		this.mouseOnTool = null;

	}

	setToolType ( type: ToolType ) {

		this.toolBarService.setToolByType( type );

	}

}
