/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	Component,
	EventEmitter,
	OnInit, Output,
} from '@angular/core';
import { AppConfig } from 'app/app.config';
import { MapEvents } from 'app/events/map-events';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { CameraService } from 'app/renderer/camera.service';
import { TextObjectService } from 'app/services/text-object.service';
import { RoadElevationToolService } from 'app/tools/road-elevation/road-elevation-tool.service';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Scene, Group, OrthographicCamera, Color, Vector3 } from 'three';
import { CanvasConfig, ViewportConfig } from "../viewport-new/viewport-new.component";
import { ViewportEvents } from "../../../events/viewport-events";
import * as THREE from "three";
import { Maths } from "../../../utils/maths";
import { PointerEventData } from "../../../events/pointer-event-data";
import { SelectionService } from "../../../tools/selection.service";
import { ControlPointStrategy } from "../../../core/strategies/select-strategies/control-point-strategy";
import { TvElevationService } from "../../../map/road-elevation/tv-elevation.service";
import { KeyboardEvents } from 'app/events/keyboard-events';
import { CommandHistory } from 'app/services/command-history';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { ToolBarService } from '../tool-bar/tool-bar.service';
import { ToolType } from 'app/tools/tool-types.enum';
import { SetValueCommand } from 'app/commands/set-value-command';
import { DebugDrawService } from "../../../services/debug/debug-draw.service";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { SimpleControlPoint } from "../../../objects/simple-control-point";

@Component( {
	selector: 'app-graph-viewport',
	templateUrl: './graph-viewport.component.html',
	styleUrls: [ './graph-viewport.component.scss' ]
} )
export class GraphViewportComponent implements OnInit, AfterViewInit {

	config: ViewportConfig = new ViewportConfig();

	eventSystem = new ViewportEvents();

	nodes = new Group();

	line: Line2;

	scene = new Scene();

	camera: OrthographicCamera;

	selectionService: SelectionService;

	canvasConfig: CanvasConfig = new CanvasConfig();

	@Output() viewUpdated = new EventEmitter<any>();

	private selectedRoad: TvRoad;

	viewLoaded = false;

	nodeMoved: boolean;

	get selectedObject (): AbstractControlPoint {
		return this.selectionService.getLastSelected<AbstractControlPoint>( SimpleControlPoint.name );
	}

	constructor (
		private previewService: AssetPreviewService,
		private roadElevation: RoadElevationToolService,
		private cameraService: CameraService,
		private textService: TextObjectService,
		private elevationService: TvElevationService,
		private toolBarService: ToolBarService,
		private debugDrawService: DebugDrawService,
	) {
	}

	ngOnInit () {

		this.selectionService = new SelectionService();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.config.showStats = false;

		this.setupGraphScene( this.scene );

		MapEvents.objectSelected.subscribe( obj => {

			if ( obj instanceof TvRoad ) this.onRoadSelected( obj );

		} );

		MapEvents.objectUnselected.subscribe( obj => {

			if ( obj instanceof TvRoad ) this.onRoadUnselected( obj );

		} );

		MapEvents.roadUpdated.subscribe( event => {

			this.onRoadUpdated( event.road );

		} );

		MapEvents.roadRemoved.subscribe( event => {

			this.onRoadRemoved( event.road );

		} );

		this.eventSystem.pointerUp.subscribe( event => this.onPointerUp( event ) );
		this.eventSystem.pointerDown.subscribe( event => this.onPointerDown( event ) );
		this.eventSystem.pointerMoved.subscribe( event => this.onPointerMoved( event ) );
		this.eventSystem.pointerClicked.subscribe( event => this.onPointerClicked( event ) );

	}

	createCamera () {

		const camera = this.cameraService.createOrthographicCamera( -100, 100, 100, -100 );

		camera.up.copy( AppConfig.DEFAULT_UP );

		camera.updateProjectionMatrix();

		return camera;

	}

	onRoadSelected ( road: TvRoad ) {

		this.selectedRoad = road;

		this.updateLine( road );

	}

	onRoadUnselected ( road: TvRoad ) {

		this.selectedRoad = null;

		this.selectionService.clearSelection();

		this.nodes.clear();

		this.line.visible = false;

	}

	onRoadUpdated ( road: TvRoad ) {

		this.updateLine( road );

	}

	onRoadRemoved ( road: TvRoad ) {

		this.selectedRoad = null;

		this.selectionService.clearSelection();

		this.nodes.clear();

	}

	createElevationPoint ( road: TvRoad, elevation: TvElevation ): AbstractControlPoint {

		const point = new SimpleControlPoint( elevation );

		point.position.x = elevation.s;

		point.position.y = elevation.a;

		return point;
	}

	private setupGraphScene ( scene: Scene ) {

		scene.background = new Color( 0x000000 );

		const gridHelper = new THREE.GridHelper( 10000, 1000 );

		gridHelper.material.transparent = true;
		gridHelper.material.opacity = 0.5;
		gridHelper.material.needsUpdate = false;

		// to adjust with up Z
		gridHelper.rotateX( Maths.Deg2Rad * 90 );

		scene.add( gridHelper );

		scene.add( new THREE.AxesHelper( 10000 ) );

		this.camera = this.createCamera();

		this.scene.add( this.nodes );

		this.line = this.debugDrawService.createLine( [ new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 0 ) ], 0xffffff, 4 );

		this.scene.add( this.line );

	}

	private onPointerUp ( event: PointerEventData ) {

		// Debug.log( 'Pointer up', event, this.selectedObject );

		if ( !this.selectedObject ) return;

		if ( !this.nodeMoved ) return;

		this.selectedObject.isSelected = false;

		if ( !this.selectedObject.mainObject ) return;

		if ( this.selectedObject.mainObject instanceof TvElevation ) {

			this.toolBarService.setToolByType( ToolType.RoadElevation );

			CommandHistory.executeMany(
				new SetValueCommand( this.selectedObject.mainObject, 'a', event.point.y ),

				new SetValueCommand( this.selectedObject.mainObject, 's', event.point.x )
			);

		}

		this.nodeMoved = false;
	}

	private onPointerDown ( event: PointerEventData ) {

		// Debug.log( 'Pointer down', event );

		if ( KeyboardEvents.isShiftKeyDown ) {

			this.handleCreation( event );

		} else {

			this.selectionService.handleSelection( event );

		}

	}

	private handleCreation ( event: PointerEventData ) {

		if ( !this.selectedRoad ) return;

		this.toolBarService.setToolByType( ToolType.RoadElevation );

		const elevation = new TvElevation( event.point.x, event.point.y, 0, 0, 0 );

		const point = new SimpleControlPoint( elevation, event.point );

		point.isSelected = true;

		this.nodes.add( point );

		CommandHistory.execute( new AddObjectCommand( elevation ) );

		return;

	}

	private onPointerMoved ( event: PointerEventData ) {

		// Debug.log( 'Pointer moved', event );

		if ( !event.pointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.selectedObject ) return;

		if ( !this.selectedObject.isSelected ) return;

		this.selectedObject.position.x = event.point.x;

		this.selectedObject.position.y = event.point.y;

		this.nodeMoved = true;

	}

	onCanvasResized ( $event: CanvasConfig ) {

		this.canvasConfig = $event;

	}

	onViewUpdated ( $event: any ) {

		this.viewUpdated.emit( $event );

	}

	ngAfterViewInit (): void {

		this.viewLoaded = true;

	}

	private onPointerClicked ( event: PointerEventData ) {

		// Debug.log( 'Pointer clicked', event );

	}

	private updateLine ( road: TvRoad ) {

		this.nodes.clear();

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.add( this.createElevationPoint( road, elevation ) );

		} );

		this.nodes.children.forEach( ( point: AbstractControlPoint ) => {

			if ( !this.selectedObject ) return;

			if ( point.mainObject !== this.selectedObject.mainObject ) return;

			point.select();

		} );

		this.line.visible = true;

		let positions: Vector3[] = [];

		for ( let s = 0; s < road.getRoadLength(); s += 0.1 ) {

			positions.push( new Vector3( s, road.getElevationValue( s ), 0 ) );
		}

		this.line.geometry.dispose();

		this.line.geometry = this.debugDrawService.createLineGeometry( positions );

	}
}
