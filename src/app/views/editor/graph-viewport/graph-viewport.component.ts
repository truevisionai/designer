import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnInit, Output,
	ViewChild
} from '@angular/core';
import { AppConfig } from 'app/app.config';
import { MapEvents } from 'app/events/map-events';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { CameraService } from 'app/renderer/camera.service';
import { TextObjectService } from 'app/services/text-object.service';
import { RoadElevationToolService } from 'app/tools/road-elevation/road-elevation-tool.service';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Scene, Group, OrthographicCamera, Color, Material, Vector3, Camera } from 'three';
import { CanvasConfig, ViewportConfig } from "../viewport-new/viewport-new.component";
import { ViewportEvents } from "../../../events/viewport-events";
import * as THREE from "three";
import { Maths } from "../../../utils/maths";
import { PointerEventData } from "../../../events/pointer-event-data";
import { SelectionService } from "../../../tools/selection.service";
import { ControlPointStrategy } from "../../../core/strategies/select-strategies/control-point-strategy";
import { IViewportController } from "../../../objects/i-viewport-controller";
import { TvOrbitControls } from "../../../objects/tv-orbit-controls";

interface Label {
	value: number,
	top: string,
	left: string,
	isVisible: boolean
}

@Component( {
	selector: 'app-graph-viewport',
	templateUrl: './graph-viewport.component.html',
	styleUrls: [ './graph-viewport.component.scss' ]
} )
export class GraphViewportComponent implements OnInit {

	config: ViewportConfig = new ViewportConfig();

	eventSystem = new ViewportEvents();

	nodes = new Group();

	scene = new Scene();

	camera: OrthographicCamera;

	selectionService: SelectionService;

	canvasConfig: CanvasConfig = new CanvasConfig();

	@Output() viewUpdated = new EventEmitter<any>();

	constructor (
		private previewService: AssetPreviewService,
		private roadElevation: RoadElevationToolService,
		private cameraService: CameraService,
		private textService: TextObjectService,
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

		MapEvents.roadUpdated.subscribe( event => {

			this.onRoadUpdated( event.road );

		} );

		MapEvents.roadRemoved.subscribe( event => {

			this.onRoadRemoved( event.road );

		} );

		this.eventSystem.pointerUp.subscribe( event => this.onPointerUp( event ) );

		this.eventSystem.pointerDown.subscribe( event => this.onPointerDown( event ) );

		this.eventSystem.pointerMoved.subscribe( event => this.onPointerMoved( event ) );

	}

	createCamera () {

		const camera = this.cameraService.createOrthographicCamera( -100, 100, 100, -100 );

		camera.up.copy( AppConfig.DEFAULT_UP );

		camera.updateProjectionMatrix();

		return camera;

	}

	onRoadSelected ( road: TvRoad ) {

		this.nodes.clear();

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.add( this.createElevationPoint( road, elevation ) );

		} );

	}

	onRoadUpdated ( road: TvRoad ) {

		this.nodes.clear();

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.add( this.createElevationPoint( road, elevation ) );

		} );

	}

	onRoadRemoved ( road: TvRoad ) {

		//

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

		( gridHelper.material as Material ).transparent = true;
		( gridHelper.material as Material ).opacity = 0.5;
		( gridHelper.material as Material ).needsUpdate = false;

		// to adjust with up Z
		gridHelper.rotateX( Maths.Deg2Rad * 90 );

		scene.add( gridHelper );

		scene.add( new THREE.AxesHelper( 10000 ) );

		this.camera = this.createCamera();

		this.scene.add( this.nodes );

	}

	private onPointerUp ( event: PointerEventData ) {

		console.log( 'Pointer up', event );

	}

	private onPointerDown ( event: PointerEventData ) {

		this.selectionService.handleSelection( event );

	}

	private onPointerMoved ( event: PointerEventData ) {

		// this.selectionService.handleHighlight( event );

	}

	onCanvasResized ( $event: CanvasConfig ) {

		this.canvasConfig = $event;

	}

	onViewUpdated ( $event: any ) {

		this.viewUpdated.emit( $event );

	}

}
