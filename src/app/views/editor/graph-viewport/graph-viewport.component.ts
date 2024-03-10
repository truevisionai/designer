import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { Object3DMap } from 'app/core/models/object3d-map';
import { MapEvents } from 'app/events/map-events';
import { MouseButton } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { ElevationControlPoint } from 'app/map/road-elevation/tv-elevation.object';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { IViewportController } from 'app/objects/i-viewport-controller';
import { TvOrbitControls } from 'app/objects/tv-orbit-controls';
import { CameraService } from 'app/renderer/camera.service';
import { TextObjectService } from 'app/services/text-object.service';
import { RoadElevationToolService } from 'app/tools/road-elevation/road-elevation-tool.service';
import { SelectionService } from 'app/tools/selection.service';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Scene, Group, OrthographicCamera } from 'three';

@Component( {
	selector: 'app-graph-viewport',
	templateUrl: './graph-viewport.component.html',
	styleUrls: [ './graph-viewport.component.scss' ]
} )
export class GraphViewportComponent implements OnInit, AfterViewInit {

	private nodes = new Group();

	@ViewChild( 'graph' ) viewportRef: ElementRef;

	public frameId: number;

	public scene: Scene = new Scene;

	public camera: OrthographicCamera;

	public controls: IViewportController;

	public selection: SelectionService;

	constructor (
		private previewService: AssetPreviewService,
		private roadElevation: RoadElevationToolService,
		private cameraService: CameraService,
		private textService: TextObjectService,
	) {
		this.render = this.render.bind( this );
	}

	get canvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.viewportRef.nativeElement;
	}

	get width (): number {
		return this.canvas.clientWidth;
	}

	get height () {
		return this.canvas.clientHeight;
	}

	ngOnInit () {

		this.previewService.setupGraphScene( this.scene );

		this.camera = this.createCamera();

		this.scene.add( this.nodes );

		MapEvents.objectSelected.subscribe( obj => {

			if ( obj instanceof TvRoad ) this.onRoadSelected( obj );

		} );

		MapEvents.roadUpdated.subscribe( event => {

			this.onRoadUpdated( event.road );

		} );

		MapEvents.roadRemoved.subscribe( event => {

			this.onRoadRemoved( event.road );

		} );
	}

	createCamera () {

		const camera = this.cameraService.createOrthographicCamera( -100, 100, 100, -100 );

		// camera.position.set( 0, 0, 10 );

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

	ngAfterViewInit (): void {

		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		this.canvas.appendChild( this.previewService.renderer.domElement );

		setTimeout( () => {

			this.resize();

		}, 0 );

		this.render();

		this.updateAxisLabels();
	}

	ngOnDestroy (): void {

		if ( this.frameId ) cancelAnimationFrame( this.frameId );

	}

	render () {

		// this seems a faster want to call render function
		this.frameId = requestAnimationFrame( this.render );

		this.previewService.renderer.render( this.scene, this.camera );

		this.controls.update();

		this.updateAxisLabels();

	}

	@HostListener( 'window: resize', [ '$event' ] )
	resize () {

		const container = this.previewService.renderer.domElement.parentElement;

		const box = container.getBoundingClientRect();

		const width = container.clientWidth || 300;

		// take 75% of the width to maintain 4:3 aspect ratio
		const height = width ? width * 0.75 : 300; // container.clientHeight;

		this.previewService.renderer.setViewport( -box.left, -box.top, width, height );

		this.previewService.renderer.setSize( width, height );

		const aspect = width / height;

		this.camera.left = this.camera.bottom * aspect;

		this.camera.right = this.camera.top * aspect;

		this.camera.updateProjectionMatrix();

		this.updateAxisLabels();
	}

	@HostListener( 'mousedown', [ '$event' ] )
	onMouseDown ( event: MouseEvent ) {

		event.preventDefault();

		const container = this.previewService.renderer.domElement.parentElement;

		const rect = container.getBoundingClientRect();

		const x = ( ( event.clientX - rect.left ) / this.width ) * 2 - 1;
		const y = -( ( event.clientY - rect.top ) / this.height ) * 2 + 1;

		// this.previewService.raycaster.setFromCamera( { x, y }, this.camera );

		// console.log( x, y );

		switch ( event.button ) {

			case MouseButton.LEFT:
				// this.handleLeftClick( $event, intersection );
				break;

			case MouseButton.MIDDLE:
				// this.handleMiddleClick( $event, intersection );
				break;

			case MouseButton.RIGHT:
				// this.handleRightClick( $event, intersection );
				break;

		}
	}

	// public xAxisLabelGroup = new Group();;
	// public yAxisLabelGroup: Group;

	public xAxisLabels: number[] = [];

	public yAxisLabels: number[] = [];

	updateAxisLabels () {

		// this.xAxisLabelGroup.clear();

		// this.scene.remove( this.xAxisLabelGroup );

		// // Calculate visible range based on the camera position and field of view
		// const visibleRange = {
		// 	x: [ this.camera.position.x - this.camera.left, this.camera.position.x + this.camera.right ],
		// 	y: [ this.camera.position.y - this.camera.bottom, this.camera.position.y + this.camera.top ]
		// };

		// // Update your axis labels here using the visibleRange values
		// // You would need to have a way to update the labels in your HTML or canvas element that is displaying them.

		const cameraBounds = this.calculateVisibleBounds();

		// this.xAxisLabels = this.calculateAxisLabels( cameraBounds.xMin, cameraBounds.xMax );
		this.yAxisLabels = this.calculateAxisLabels( cameraBounds.yMin, cameraBounds.yMax );

		//// Update your axis labels
		//this.yAxisLabels.forEach( label => {
		//	// Calculate the screen position for each label
		//	const labelScreenPosition = this.calculateLabelScreenPosition( label );
		//	// Set the top style property for the label element to align it with the Y position on the screen
		//	//labelElement.style.top = `${ labelScreenPosition }px`;
		//} );

		// for ( let x = cameraBounds.xMin; x < cameraBounds.xMax; x += 10 ) {

		// 	const label = this.textService.createFromText( x.toString() );

		// 	label.position.x = x;

		// 	this.xAxisLabelGroup.add( label );

		// }

		// this.scene.add( this.xAxisLabelGroup );
	}

	calculateVisibleBounds () {

		// Assuming this.camera is your OrthographicCamera instance
		const zoom = this.camera.zoom;
		const aspect = this.camera.right / this.camera.top; // Assumes camera.right is the aspect ratio width component

		// Calculate the half size of the visible area (we need to divide by zoom level)
		const halfHeight = ( this.camera.top - this.camera.bottom ) / 2 / zoom;
		const halfWidth = halfHeight * aspect;

		// Now calculate the bounds
		const xMin = this.camera.position.x - halfWidth;
		const xMax = this.camera.position.x + halfWidth;
		const yMin = this.camera.position.y - halfHeight;
		const yMax = this.camera.position.y + halfHeight;

		return { xMin, xMax, yMin, yMax };
	}

	calculateAxisLabels ( min: number, max: number ): number[] {
		const labels = [];
		// Start from the next lowest multiple of 10 if min is not a multiple of 10
		let start = Math.ceil( min / 10 ) * 10;
		for ( let i = start; i <= max; i += 10 ) {
			labels.push( i );
		}
		return labels;
	}

	//getLabelStyle ( labelValue ) {
	//
	//	const position = this.calculateLabelScreenPosition( labelValue );
	//	return {
	//		top: `${ position }px`
	//		// any other dynamic styles you need
	//	};
	//}

	//// This function converts a Y value in your scene's coordinate system to a Y position in pixels on the screen.
	//calculateLabelScreenPosition ( yValueInScene ) {
	//	// conversion logic here, you'll need to replace this with your actual conversion code
	//	const pixelPosition = ( yValueInScene - this.camera.position.y ) * scaleFactor + centerY;
	//	return pixelPosition;
	//}

}
