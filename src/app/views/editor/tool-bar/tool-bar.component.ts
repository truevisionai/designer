/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { SetToolCommand } from 'app/core/commands/set-tool-command';
import { LaneOffsetTool } from 'app/core/tools/lane-offset-tool';
import { ManeuverTool } from 'app/core/tools/maneuver-tool';
import { MarkingLineTool } from 'app/core/tools/marking-line-tool';
import { ParkingBoxTool } from 'app/core/tools/parking-box-tool';
import { PropCurveTool } from 'app/core/tools/prop-curve-tool';
import { PropPointTool } from 'app/core/tools/prop-point-tool';
import { PropPolygonTool } from 'app/core/tools/prop-polygon-tool';
import { RoadCircleTool } from 'app/core/tools/road-circle-tool';
import { RoadTool } from 'app/core/tools/road-tool';
import { SurfaceTool } from 'app/core/tools/surface-tool';
import { CommandHistory } from 'app/services/command-history';
import { ModelImporterService } from 'app/services/model-importer.service';
import { ElectronService } from 'ngx-electron';
import { BaseTool } from '../../../core/tools/base-tool';
import { LaneAddTool } from '../../../core/tools/lane-add-tool';
import { LaneMarkingTool } from '../../../core/tools/lane-marking-tool';
import { LaneTool } from '../../../core/tools/lane-tool';
import { LaneWidthTool } from '../../../core/tools/lane-width-tool';
import { MarkingPointTool } from '../../../core/tools/marking-point-tool';
import { ToolManager } from '../../../core/tools/tool-manager';
import { Environment } from '../../../core/utils/environment';
import { ThreeService } from '../../../modules/three-js/three.service';
import { TvMapService } from '../../../modules/tv-map/services/tv-map.service';
import { TvSignService } from '../../../modules/tv-map/services/tv-sign.service';
import { FileService } from '../../../services/file.service';

@Component( {
	selector: 'app-tool-bar',
	templateUrl: './tool-bar.component.html',
} )
export class ToolBarComponent implements OnInit {

	currentTool: BaseTool;
	currentToolName: string;

	constructor (
		private electronService: ElectronService,
		private odService: TvMapService,
		private signService: TvSignService,
		private threeService: ThreeService,
		private fileService: FileService,
		private modelImporter: ModelImporterService
	) {
	}

	get oscEnabled (): boolean {
		return Environment.oscEnabled;
	}

	get showImportButton () {

		return this.electronService.isElectronApp && !Environment.production;

	}

	get isPropToolSelected () {

		return this.currentTool instanceof PropPointTool ||
			this.currentTool instanceof PropCurveTool ||
			this.currentTool instanceof PropPolygonTool;

	}

	get isMarkingToolSelected () {

		return this.currentTool instanceof MarkingLineTool ||
			this.currentTool instanceof MarkingPointTool;

	}

	ngOnInit () {

		ToolManager.toolChanged.subscribe( ( tool: BaseTool ) => {
			this.currentTool = tool;
			this.currentToolName = tool ? tool.name : null;
		} );

	}

	showRoadTool () {

		this.setTool( new RoadTool() );

	}

	showRoadCircleTool () {

		this.setTool( new RoadCircleTool() );

	}

	showManeueverTool () {

		this.setTool( new ManeuverTool() );

	}

	showLaneWidthTool () {

		this.setTool( new LaneWidthTool() );

	}

	showLaneOffsetTool () {

		this.setTool( new LaneOffsetTool() );

	}

	showRoadSignTool () {

		this.setTool( new PropPointTool() );

	}

	showPropPointTool () {

		this.setTool( new PropPointTool() );

	}

	showPropCurveTool () {

		this.setTool( new PropCurveTool() );

	}

	showPropPolygonTool () {

		this.setTool( new PropPolygonTool() );

	}

	showSurfaceTool () {

		this.setTool( new SurfaceTool() );

	}

	showLaneMarkingTool () {

		this.setTool( new LaneMarkingTool() );

	}

	// importOpenDrive () {

	//     new OpenScenarioExporter( this.oscService, this.odService, this.fileService, this.simulation ).exportAndPlay();

	// }

	showAddLaneTool () {

		this.setTool( new LaneAddTool() );

	}

	showLaneTool () {

		this.setTool( new LaneTool() );

	}

	changeCamera () {

		this.threeService.changeCamera();

	}

	setMarkingPointTool () {

		this.setTool( new MarkingPointTool() );

	}

	setMarkingLineTool () {

		this.setTool( new MarkingLineTool() );

	}

	setParkingBoxTool () {

		this.setTool( new ParkingBoxTool() );

	}

	setParkingPolygonTool () {

		this.setTool( new ParkingBoxTool() );

	}

	setMiscShape () {

		// this.setTool( new MiscShapeTool() );

		// AppInspector.setInspector( OscParamatersInspectorComponent, OscSourceFile.scenario.parameterDeclaration );

	}

	private setTool ( tool: BaseTool ) {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}
}
