import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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

	yAxisLabels: Label[] = []; // Replace 'any' with an interface for the labels

	xAxisLabels: Label[] = []; // Replace 'any' with an interface for the labels

	canvasConfig: CanvasConfig = new CanvasConfig();

	private yAxisInterval: number = 10;

	private xAxisInterval: number = 10;

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

		this.createLabels()
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

	// Assuming 'camera' is your Three.js camera and 'renderer' is your Three.js renderer
	toScreenPosition ( obj: Vector3, camera: Camera, width: number, height: number ) {

		const vector = new THREE.Vector3();
		const widthHalf = 0.5 * width;
		const heightHalf = 0.5 * height;

		vector.copy( obj ).project( camera );

		vector.x = ( vector.x * widthHalf ) + widthHalf;
		vector.y = -( vector.y * heightHalf ) + heightHalf;

		return { x: vector.x, y: vector.y };
	}

	onViewUpdated ( $event: any ) {

		this.createLabels();
		this.updateLabels();

	}

	private createLabels () {

		// Clear existing labels
		this.yAxisLabels = [];
		this.xAxisLabels = [];

		// Determine the increment based on the camera's zoom level
		this.xAxisInterval = this.calculateLabelInterval( this.camera.zoom );
		this.yAxisInterval = this.calculateLabelInterval( this.camera.zoom );

		// Determine the range of visible values for the y-axis and x-axis
		const xAxisRange = this.calculateAxisRange( this.camera, 'x' );
		const yAxisRange = this.calculateAxisRange( this.camera, 'y' );

		// Create labels within the visible range for the x-axis
		for ( let x = xAxisRange.min; x <= xAxisRange.max; x += this.xAxisInterval ) {
			this.xAxisLabels.push( {
				value: x,
				top: '0px',
				left: '0px',
				isVisible: true // Assume initially visible; adjust during update
			} );
		}

		// Create labels within the visible range for the y-axis
		for ( let y = yAxisRange.min; y <= yAxisRange.max; y += this.yAxisInterval ) {
			this.yAxisLabels.push( {
				value: y,
				top: '0px',
				left: '0px',
				isVisible: true // Assume initially visible; adjust during update
			} );
		}

	}

	private calculateAxisRange ( camera: OrthographicCamera, axis: 'x' | 'y' ) {
		// You would implement the logic here to determine the min and max
		// visible values along the specified axis based on the camera's
		// position, zoom level, and aspect ratio.
		// This is a placeholder implementation:
		const size = axis === 'y' ? camera.top - camera.bottom : camera.right - camera.left;

		let min = camera.position[ axis ] - ( size / 2 ) / camera.zoom;
		let max = camera.position[ axis ] + ( size / 2 ) / camera.zoom;

		// Round to nearest multiple of 10
		min = Math.floor( min / 10 ) * 10;
		max = Math.ceil( max / 10 ) * 10;

		return { min, max };
	}

	private updateLabels () {

		const labelHeight = 20; // Replace with your label height. You might need to measure this dynamically.
		const labelWidth = 30; // Estimate or dynamically measure the width of your labels.

		// Calculate the vertical boundaries of the camera view
		const camTop = this.camera.position.y + ( this.camera.top / this.camera.zoom );
		const camBottom = this.camera.position.y + ( this.camera.bottom / this.camera.zoom );

		// Calculate the horizontal boundaries of the camera view
		const camLeft = this.camera.position.x + ( this.camera.left / this.camera.zoom );
		const camRight = this.camera.position.x + ( this.camera.right / this.camera.zoom );

		this.yAxisLabels.forEach( ( label ) => {

			// Use the label's xValue to determine its 3D position
			const labelPosition = new THREE.Vector3( 0, label.value, 0 ); // Change y and z if needed

			// Calculate the 2D position
			const pos2D = this.toScreenPosition( labelPosition, this.camera, this.canvasConfig.width, this.canvasConfig.height );

			// Update the label's style properties
			label.top = ( this.canvasConfig.top + pos2D.y - labelHeight / 2 ) + 'px';

			// Check if the label's yValue is within the camera's vertical boundaries
			label.isVisible = ( label.value <= camTop && label.value >= camBottom );

		} );

		this.xAxisLabels.forEach( ( label ) => {

			// Use the label's xValue to determine its 3D position
			const labelPosition = new THREE.Vector3( label.value, 0, 0 ); // Change y and z if needed

			// Calculate the 2D position
			const pos2D = this.toScreenPosition( labelPosition, this.camera, this.canvasConfig.width, this.canvasConfig.height );

			// Update the label's style properties
			label.left = ( pos2D.x - labelWidth / 2 ) + 'px';

			// Check if the label's yValue is within the camera's vertical boundaries
			label.isVisible = ( label.value <= camRight && label.value >= camLeft );

		} );
	}

	private calculateLabelInterval ( zoomLevel: number ): number {

		// Define zoom levels and corresponding intervals
		const zoomIntervals = [
			{ zoom: 0.5, interval: 100 },
			{ zoom: 1, interval: 50 },
			{ zoom: 2, interval: 20 },
			// ...add as many levels as needed
		];

		// Find the largest interval for the current zoom level
		const interval = zoomIntervals.reduce( ( currentInterval, zoomInterval ) => {
			if ( zoomLevel <= zoomInterval.zoom ) {
				return zoomInterval.interval;
			}
			return currentInterval;
		}, 10 ); // Default to 10 if no zoom level matches

		return interval;
	}
}
