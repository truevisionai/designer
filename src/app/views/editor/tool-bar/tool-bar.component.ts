/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, Host, HostBinding, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { ToolType } from 'app/tools/tool-types.enum';
import { CommandHistory } from 'app/commands/command-history';
import { ToolManager } from '../../../managers/tool-manager';
import { ThreeService } from '../../../renderer/three.service';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import {
	EnvironmentInspectorComponent
} from 'app/views/inspectors/environment-inspector/environment-inspector.component';
import { Environment } from 'app/core/utils/environment';
import { ToolBarService } from './tool-bar.service';
import { MatToolbar } from '@angular/material/toolbar';
import { Tool } from "../../../tools/tool";
import { WorldSettingInspectorComponent } from 'app/views/inspectors/world-setting-inspector/world-setting-inspector.component';

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
	tooltip?: string;
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
			click: () => this.setToolType( ToolType.Pointer ),
			enabled: true,
		},
		{
			id: 'showMeasurementTool',
			label: 'Measurement',
			class: 'toolbar-button',
			toolType: ToolType.MeasurementTool,
			action: 'Measurement-tool',
			icon: 'straighten',
			title: 'Measurement Tool',
			description: 'Measurement tool is used to measure the distance between two points in the scene',
			track: 'menu',
			click: () => this.setToolType( ToolType.MeasurementTool ),
			enabled: true,
		},
		{
			id: 'connections',
			label: 'Debug',
			class: 'toolbar-button border-right',
			toolType: ToolType.DebugConnections,
			action: 'debug-connections-tool',
			icon: 'bug_report',
			track: 'menu',
			click: () => this.setToolType( ToolType.DebugConnections ),
			enabled: !Environment.production && Environment.developmentTools,
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
			title: 'RAMP-TOOL-TITLE',
			description: 'RAMP-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.RoadRampTool ),
			enabled: true,
		},
		{
			id: 'showDividerTool',
			label: 'Divide',
			class: 'toolbar-button',
			toolType: ToolType.RoadDividerTool,
			action: 'divider-tool',
			icon: 'content_cut', // fork_right, call_split
			track: 'menu',
			title: 'ROAD-DIVIDER-TITLE',
			description: 'ROAD-DIVIDER-DESCRIPTION',
			click: () => this.setToolType( ToolType.RoadDividerTool ),
			enabled: true,
		},
		{
			id: 'showRoadElevationTool',
			label: 'Elevation',
			class: 'toolbar-button',
			toolType: ToolType.RoadElevation,
			action: 'road-Elevation-tool',
			icon: 'height',
			title: 'ROAD-ELEVATION-TITLE',
			description: 'ROAD-ELEVATION-DESCRIPTION',
			track: 'button',
			click: () => this.setToolType( ToolType.RoadElevation ),
			enabled: true,
		},
		{
			id: 'showSuperElevationTool',
			label: 'SuperElevation',
			class: 'toolbar-button border-right',
			toolType: ToolType.SuperElevation,
			action: 'road-super-elevation-tool',
			icon: 'replay',
			title: 'SUPER-ELEVATION-TITLE',
			description: 'SUPER-ELEVATION-DESCRIPTION',
			track: 'button',
			click: () => this.setToolType( ToolType.SuperElevation ),
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
			title: 'LANE-HEIGHT-TITLE',
			description: 'LANE-HEIGHT-DESCRIPTION',
			track: 'button',
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
			title: 'JUNCTION-TOOL-TITLE',
			description: 'JUNCTION-TOOL-DESCRIPTION',
			track: 'button',
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
			title: 'MANEUVER-TITLE',
			description: 'MANEUVER-DESCRIPTION',
			track: 'button',
			click: () => this.setToolType( ToolType.Maneuver ),
			enabled: true,
		},
		{
			id: 'showTrafficTool',
			label: 'Traffic Signal',
			class: 'toolbar-button',
			toolType: ToolType.TrafficLight,
			action: 'traffic-signal-tool',
			icon: 'traffic',
			title: 'TRAFFIC-SIGNAL-TOOL-TITLE',
			description: 'TRAFFIC-SIGNAL-TOOL-DESCRIPTION',
			track: 'button',
			click: () => this.setToolType( ToolType.TrafficLight ),
			enabled: true,
		},
		{
			id: 'showCrosswalkTool',
			label: 'Crosswalk',
			class: 'toolbar-button  border-right',
			toolType: ToolType.Crosswalk,
			action: 'crosswalk-tool',
			icon: 'reorder', // 'call_split', receipt
			title: 'CROSSWALK-TOOL-TITLE',
			description: 'CROSSWALK-TOOL-DESCRIPTION',
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
			title: 'POINT-MARKING-TOOL-TITLE',
			description: 'POINT-MARKING-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Point Marking Tool',
			click: () => this.setToolType( ToolType.PointMarkingTool ),
			enabled: true,
		},
		{
			id: 'showTextMarkingTool',
			label: 'Text Marking',
			class: 'toolbar-button',
			toolType: ToolType.TextMarkingTool,
			action: 'text-marking-tool',
			icon: 'text_fields', // format_color_text, text_fields
			title: 'TEXT-MARKING-TOOL-TITLE',
			description: 'TEXT-MARKING-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Text Marking Tool',
			click: () => this.setToolType( ToolType.TextMarkingTool ),
			enabled: true,
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
			label: 'Prop Point',
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
			label: 'Prop Span',
			class: 'toolbar-button',
			toolType: ToolType.PropSpanTool,
			action: 'prop-span-tool',
			icon: 'category',
			track: 'button',
			title: 'PROP-SPAN-TOOL-TITLE',
			description: 'PROP-SPAN-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.PropSpanTool ),
			enabled: true,
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
			id: 'sign',
			label: 'Sign',
			class: 'toolbar-button border-right',
			toolType: ToolType.RoadSignTool,
			action: 'road-sign-tool',
			icon: 'directions', // signpost,directions
			track: 'menu',
			title: 'ROAD-SIGN-TOOL-TITLE',
			description: 'ROAD-SIGN-TOOL-DESCRIPTION',
			click: () => this.setToolType( ToolType.RoadSignTool ),
			enabled: true,
		},
		{
			id: 'showSurfaceTool',
			label: 'Surface',
			class: 'toolbar-button',
			toolType: ToolType.Surface,
			action: 'surface-tool',
			icon: 'landscape',
			track: 'button',
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
			id: 'world',
			label: 'World',
			class: 'toolbar-button',
			toolType: ToolType.WorldSetting,
			action: 'world-setting-tool',
			icon: 'public',
			track: 'menu',
			title: 'World Settings Tool',
			description: 'World Settings Tool is used to set the projection, latitude, longitude, and other world settings',
			click: () => this.toolBarService.setWorldInspector(),
			enabled: true,
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
			click: () => this.toolBarService.setEnvironmentInspector(),
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

	@HostListener( 'document:keydown', [ '$event' ] )
	onKeyDown ( event: KeyboardEvent ) {

		// check if mouse is on tool
		if ( !this.mouseOnTool ) return;

		// check if F1 key is pressed
		if ( event.key !== 'F1' ) return;

		// TODO: open help section for that tool
	}

	setToolType ( type: ToolType ) {

		this.toolBarService.setToolByType( type );

	}

}
