/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SetToolCommand } from 'app/core/commands/set-tool-command';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from '../../../core/tools/base-tool';
import { ToolManager } from '../../../core/tools/tool-manager';
import { ThreeService } from '../../../modules/three-js/three.service';
import { ToolType } from 'app/core/models/tool-types.enum';
import { ToolFactory } from 'app/core/factories/tool-factory';
import { SatPopover } from '@ncstate/sat-popover';

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
			label: 'RoadCircle',
			class: 'toolbar-button border-right',
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
		{
			id: 'showLaneMarkingTool',
			label: 'LaneMarking',
			class: 'toolbar-button border-right',
			toolType: ToolType.LaneMarking,
			action: 'lane-marking-tool',
			icon: 'format_align_center',
			title: 'Lane Marking Tool',
			description: 'Tool to add/edit Lane Markings. <br/> '
				+ 'Select the road and move your cursor over the Lane Reference Line <br/>'
				+ 'Use `SHIFT` + `LEFT CLICK` to add a new `Lane Marking Node` <br/>'
				+ 'Modify the properties of the new `Lane Marking Node` from the inspector as needed.',
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
			click: () => this.setToolType( ToolType.PropPoint )
		},
		{
			id: 'showPropPointTool',
			label: 'PropCurve',
			class: 'toolbar-button',
			toolType: ToolType.PropCurve,
			action: 'prop-point-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Point Tool',
			click: () => this.setToolType( ToolType.PropCurve )
		},
		{
			id: 'showPropPointTool',
			label: 'PropPolygon',
			class: 'toolbar-button border-right',
			toolType: ToolType.PropPolygon,
			action: 'prop-point-tool',
			icon: 'category',
			track: 'button',
			tooltip: 'Prop Point Tool',
			click: () => this.setToolType( ToolType.PropPolygon )
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
			click: () => this.setToolType( ToolType.Surface )
		},
		{
			id: 'changeCamera',
			label: 'Camera',
			class: 'toolbar-button',
			toolType: null,
			action: 'change-camera',
			icon: 'camera',
			track: 'menu',
			tooltip: 'Change Camera',
			click: () => this.changeCamera()
		}
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

	changeCamera () {

		this.threeService.changeCamera();

	}

	onMouseOver ( tool: any ) {

		if ( tool.description ) {

			const element = document.getElementById( tool.id );

			this.popover.setCustomAnchor( this.viewContainerRef, element );

			// bug fix to avoid auto selection of tool and buttons
			// which makes them appear as selected
			this.popover.open({
				restoreFocus: false,
				autoFocus: false
			});

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
