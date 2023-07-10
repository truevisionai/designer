/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { SetToolCommand } from 'app/core/commands/set-tool-command';
import { ToolFactory } from 'app/core/factories/tool-factory';
import { ToolType } from 'app/core/models/tool-types.enum';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from '../../../core/tools/base-tool';
import { ToolManager } from '../../../core/tools/tool-manager';
import { ThreeService } from '../../../modules/three-js/three.service';

class IToolMenu {
	id: string;
	label: string;
	class?: string = 'toolbar-button';
	toolType: ToolType;
	action: string;
	icon: string;
	title?: string;
	description?: string;
	track: string;
	tooltip: string;
	click: Function;
}

@Component( {
	selector: 'app-tool-bar',
	templateUrl: './tool-bar.component.html',
	styleUrls: [ './tool-bar.component.css' ],
} )
export class ToolBarComponent implements OnInit {

	currentTool: BaseTool;

	ToolType = ToolType;

	selectedTool: any;

	@ViewChild( 'popover', { static: false } ) popover: SatPopover;

	tools: IToolMenu[] = [
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
			click: () => this.setToolType( ToolType.Pointer )
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
			click: () => this.setToolType( ToolType.Road )
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
			click: () => this.setToolType( ToolType.RoadCircle )
		},
		{
			id: 'showRoadElevationTool',
			label: 'Elevation',
			class: 'toolbar-button border-right',
			toolType: ToolType.RoadElevation,
			action: 'road-Elevation-tool',
			icon: 'height',
			title: 'ROAD-Elevation-TITLE',
			description: 'ROAD-Elevation-DESCRIPTION',
			track: 'button',
			tooltip: 'Road Elevation Tool',
			click: () => this.setToolType( ToolType.RoadElevation )
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
			click: () => this.setToolType( ToolType.Lane )
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
			click: () => this.setToolType( ToolType.LaneWidth )
		},
		{
			id: 'showLaneOffsetTool',
			label: 'LaneOffset',
			class: 'toolbar-button',
			toolType: ToolType.LaneOffset,
			action: 'lane-offset-tool',
			icon: 'vertical_align_center',
			track: 'button',
			tooltip: 'Lane Offset Tool',
			title: 'Lane Offset Tool',
			description: 'This tool allows for precise adjustment of individual lanes in a 3D road network, without the need to shift the entire road"s reference line. Whether it is to add a new turning lane or to modify an existing one <br/><br/> <img src="assets/Lane-Offset-Tool.gif"/>',
			click: () => this.setToolType( ToolType.LaneOffset )
		},
		{
			id: 'showAddLaneTool',
			label: 'AddLane',
			class: 'toolbar-button',
			toolType: ToolType.LaneAdd,
			action: 'add-lane-tool',
			icon: 'playlist_add',
			title: 'ADD-LANE-TOOL-TITLE',
			description: 'ADD-LANE-TOOL-DESCRIPTION',
			track: 'button',
			tooltip: 'Add Lane Tool',
			click: () => this.setToolType( ToolType.LaneAdd )
		},
		// {
		// 	id: 'showCreateLaneTool',
		// 	label: 'CreateLane',
		// 	class: 'toolbar-button',
		// 	toolType: ToolType.LaneCreate,
		// 	action: 'create-lane-tool',
		// 	icon: 'playlist_add',
		// 	track: 'button',
		// 	tooltip: 'Create Lane Tool',
		// 	click: () => this.setToolType( ToolType.LaneCreate )
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
			click: () => this.setToolType( ToolType.LaneMarking )
		},
		{
			id: 'showMarkingPointTool',
			label: 'MarkingPoint',
			class: 'toolbar-button',
			toolType: ToolType.MarkingPoint,
			action: 'marking-point-tool',
			icon: 'call_split',
			title: 'Marking Point Tool',
			description: 'Tool to create road marking points <br/> Select a roadmarking from ProjectBrowser <br/> Then use SHIFT + LEFT CLICK on road to create a roadmarking point',
			track: 'button',
			tooltip: 'Marking Point Tool',
			click: () => this.setToolType( ToolType.MarkingPoint )
		},
		{
			id: 'showManeueverTool',
			label: 'Maneuver',
			class: 'toolbar-button border-right',
			toolType: ToolType.Maneuver,
			action: 'maneuver-tool',
			icon: 'fullscreen_exit',
			title: 'Maneuver Tool',
			description: 'Tool to create/edit junction maneuvers <br/> Use LEFT CLICK to select junction entry/exit <br/> Merge Entry/Exists from inspector to create a junction maneuver',
			track: 'button',
			tooltip: 'Maneuver Tool',
			click: () => this.setToolType( ToolType.Maneuver )
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
			click: () => this.setToolType( ToolType.PropPoint )
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
			click: () => this.setToolType( ToolType.PropCurve )
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
			click: () => this.setToolType( ToolType.PropPolygon )
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
			click: () => this.setToolType( ToolType.RoadSignalTool )
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
			click: () => this.setToolType( ToolType.Surface )
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
			click: () => this.setToolType( ToolType.Vehicle )
		},
		// add more tools here...
	];

	constructor (
		private threeService: ThreeService,
		private viewContainerRef: ViewContainerRef,
	) {
	}

	ngOnInit () {

		ToolManager.toolChanged.subscribe( ( tool: BaseTool ) => {

			this.currentTool = tool;

		} );

	}

	getClass ( tool ) {

		if ( !this.currentTool ) return tool.class;

		return this.currentTool.toolType == tool.toolType ? 'mat-accent ' + tool.class : tool.class;

	}

	onMouseOver ( tool: any ) {

		if ( tool.description ) {

			const element = document.getElementById( tool.id );

			this.popover.setCustomAnchor( this.viewContainerRef, element );

			// bug fix to avoid auto selection of tool and buttons
			// which makes them appear as selected
			this.popover.open( {
				restoreFocus: false,
				autoFocus: false
			} );

			this.selectedTool = tool;

		} else {

			this.popover.close();

			this.selectedTool = null;

		}

	}

	onMouseOut ( tool: any ) {

		this.popover.anchor = null;

		this.popover.close();

		this.selectedTool = null;

	}

	setToolType ( type: ToolType ) {

		CommandHistory.execute( new SetToolCommand( ToolFactory.createTool( type ) ) );

	}

}
