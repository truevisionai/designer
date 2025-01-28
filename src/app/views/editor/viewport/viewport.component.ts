/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	Component,
	ElementRef,
	HostListener,
	Injectable,
	Input,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ViewportEvents } from 'app/events/viewport-events';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ThreeService } from 'app/renderer/three.service';

// import * as Stats from 'stats.js';
import * as THREE from "three";
import { Intersection, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { SceneService } from '../../../services/scene.service';
import { CanvasService } from '../../../renderer/canvas.service';
import { Environment } from 'app/core/utils/environment';
import { RendererService } from "../../../renderer/renderer.service";
import { ViewHelperService } from "./view-helper.service";
import { DragDropService } from "../../../services/editor/drag-drop.service";
import { ViewportService } from "./viewport.service";
import { ViewControllerService } from "./view-controller.service";
import { CameraService } from "../../../renderer/camera.service";
import { MapService } from 'app/services/map/map.service';
import { ToolManager } from 'app/managers/tool-manager';
import { AssetType } from 'app/assets/asset.model';
import { isView, IView } from 'app/tools/lane/visualizers/i-view';
import { Vector2 } from 'app/core/maths';
import { Commands } from 'app/commands/commands';
import { SelectionService } from 'app/tools/selection.service';
import { KeyboardEvents } from "../../../events/keyboard-events";

@Component( {
	selector: 'app-viewport',
	templateUrl: './viewport.component.html',
} )
export class ViewportComponent implements OnInit, AfterViewInit, OnDestroy {

	public beginTime;

	public prevTime;

	public frames = 0;

	public fps: number;

	selected: Object3D;

	intersections: THREE.Intersection[] = [];

	lastIntersection: THREE.Intersection;

	@ViewChild( 'viewport' ) elementRef: ElementRef;

	@ViewChild( 'viewHelper' ) viewHelperRef: ElementRef;

	raycaster = new THREE.Raycaster;

	currentMousePosition: Vector2 = new Vector2();

	prevMousePosition: Vector2 = new Vector2();

	mouseDelta: Vector2 = new Vector2();

	clock = new THREE.Clock();

	private animationId: number;

	private lastTime: number = Date.now();

	private minTime: number = 100;

	private onCanvas: boolean;

	private showWireframe = false;

	get isProduction () {
		return Environment.production;
	}

	get canvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.elementRef.nativeElement;
	}

	get viewHelperCanvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.viewHelperRef.nativeElement;
	}

	get cameraType (): string {
		return this.threeService.camera?.type || 'OrthographicCamera';
	}

	get renderer (): WebGLRenderer {
		return this.rendererService.renderer;
	}

	constructor (
		private threeService: ThreeService,
		private eventSystem: ViewportEvents,
		private canvasService: CanvasService,
		private rendererService: RendererService,
		private viewHelperService: ViewHelperService,
		private dragDropService: DragDropService,
		private viewportService: ViewportService,
		private viewControllerService: ViewControllerService,
		private cameraService: CameraService,
		private mapService: MapService,
		private sceneService: SceneService,
		private selectionService: SelectionService,
		private dragManager: ViewportDragManager,
	) {
		this.render = this.render.bind( this );
	}

	ngOnInit (): void {

		this.prevTime = ( performance || Date ).now();
		this.beginTime = ( performance || Date ).now();

	}

	ngAfterViewInit (): void {

		if ( !this.detectWebgl() ) {

			alert( 'Your Browser does not support WebGL. Please visit from a browser which supports WebGL.' );

			return;
		}

		this.rendererService.init( this.canvas );

		this.threeService.setupScene();

		this.cameraService.init();

		this.viewControllerService.init( this.cameraService.camera, this.canvas );

		this.viewControllerService.updated.subscribe( () => this.adjustRaycasterThreshold() );

		this.initRaycaster();

		this.render();

		setTimeout( () => {

			this.viewHelperService.init( this.viewHelperCanvas );

			this.onWindowResized();

		}, 10 );

	}

	initRaycaster (): void {

		this.raycaster = new THREE.Raycaster();

		this.raycaster.params.Points.threshold = 0.5;

		this.raycaster.params.Line.threshold = 0.5;

		this.raycaster.params.Line2 = {

			threshold: 0.5
		}

		this.raycaster.far = 10000;

	}

	// was used when multiple canvas instances were use
	ngOnDestroy (): void {

		this.canvas.remove();

		this.renderer.dispose();

		cancelAnimationFrame( this.animationId );
	}

	render (): void {

		// this seems a faster want to call render function
		requestAnimationFrame( this.render );

		const delta = this.clock.getDelta();

		this.frameBegin();

		this.viewControllerService.updateCameraPosition();

		this.renderer.clear();

		this.viewHelperService.update( delta );

		this.renderer.render( this.sceneService.scene, this.threeService.camera );

		this.viewHelperService.render( this.renderer );

		this.viewControllerService.update( delta );

		this.frameEnd();
	}

	frameBegin (): void {

		this.beginTime = ( performance || Date ).now();

	}

	frameEnd (): void {

		this.frames++;

		const time = ( performance || Date ).now();

		if ( time >= this.prevTime + 1000 ) {

			this.fps = Math.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

			this.prevTime = time;

			this.frames = 0;
		}

	}

	private lastObject?: IView;

	onMouseMove ( event: MouseEvent ): void {

		// TODO: implement GPU picking
		// https://threejs.org/examples/webgl_interactive_cubes_gpu.html
		// https://stackoverflow.com/questions/48691642/three-js-raycaster-find-intersections-as-mouse-moves
		// https://github.com/brianxu/GPUPicker

		this.updateMousePosition( event );

		// Limit the frequency of raycasting operations.
		if ( ( Date.now() - this.lastTime ) < this.minTime ) {
			return;
		}

		this.lastTime = Date.now();

		if ( !this.onCanvas ) return;

		this.intersections = this.getIntersections( event, true );

		const intersection = this.intersections?.length > 0 ? this.intersections[ 0 ] : null;

		if ( !intersection ) {
			this.lastObject?.onMouseOut();
			this.lastObject = null;
			return;
		}

		if ( this.isPointerDown ) {

			if ( !this.dragManager.isDragging ) {
				this.dragManager.onDragStart( intersection.object, this.preparePointerData( event, intersection ) );
			}

			this.dragManager.onDrag( intersection.object, this.preparePointerData( event, intersection ) );

			this.eventSystem.pointerMoved.emit( this.preparePointerData( event, intersection ) );

			return;
		}

		if ( isView( intersection.object ) ) {

			if ( this.lastObject === intersection.object ) return;

			this.lastObject?.onMouseOut();
			this.lastObject = null;

			this.lastObject = intersection.object;
			this.lastObject.onMouseOver();

		} else {

			this.lastObject?.onMouseOut();
			this.lastObject = null;

			this.eventSystem.pointerMoved.emit( this.preparePointerData( event, intersection ) );

		}

	}

	onMouseClick ( event: MouseEvent ): void {

		if ( !this.onCanvas ) return;

		switch ( event.button ) {

			// left
			case 0:
				this.fireSelectionEvents();
				this.fireClickedEvent( event );
				break;

			// middle click
			case 1:
				break;

			// right
			case 2:
				break;

		}

	}

	private isPointerDown: boolean;

	onMouseDown ( $event: MouseEvent ): void {

		if ( !this.onCanvas ) return;

		this.isPointerDown = true;

		this.intersections = this.getIntersections( $event, true );

		$event.preventDefault();

		const intersection = this.intersections?.length > 0 ? this.intersections[ 0 ] : null;

		if ( $event.button === MouseButton.LEFT && KeyboardEvents.isShiftKeyDown ) {

			if ( !intersection ) return;

			this.handleLeftClick( $event, intersection );

		} else if ( $event.button === MouseButton.LEFT && !KeyboardEvents.isShiftKeyDown ) {

			if ( !intersection ) {

				Commands.Unselect( this.selectionService.getSelectedObjects() );

			} else {

				this.handleLeftClick( $event, intersection );

			}

		} else if ( $event.button === MouseButton.MIDDLE ) {

			this.handleMiddleClick( $event, intersection );

		} else if ( $event.button === MouseButton.RIGHT ) {

			this.handleRightClick( $event, intersection );

		}

	}

	handleRightClick ( event: MouseEvent, intersection: Intersection ): void {

		this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );

	}

	handleMiddleClick ( event: MouseEvent, intersection: Intersection ): void {

		// do nothing

	}

	handleLeftClick ( event: MouseEvent, intersection: Intersection ): void {

		this.fireSelectionEvents();

		if ( intersection?.object?.type === 'Points' ) {

			this.viewControllerService.disableControls();

		} else {

			this.viewControllerService.enableControls();

		}

		if ( intersection?.object.id == SceneService.bgForClicks.id && !KeyboardEvents.isShiftKeyDown ) {

			Commands.Unselect( this.selectionService.getSelectedObjects() );

		}

		if ( isView( intersection.object ) ) {

			if ( this.selectionService.isObjectSelected( intersection.object.getViewModel() ) ) {
				console.log( 'object already selected' );
				return;
			}

			// NOTE: this is a temporary solution to select objects
			// const previousSelections = this.selectionService.getSelectedObjects();

			Commands.Select( intersection.object.getViewModel() );

		} else {

			console.log( 'no view object found' );

			this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );

		}

	}

	onMouseUp ( event: MouseEvent ): void {

		this.isPointerDown = false;

		this.viewControllerService.enableControls();

		this.updateMousePosition( event );

		this.raycaster.setFromCamera( this.currentMousePosition, this.threeService.camera );

		this.intersections = this.raycaster.intersectObjects( SceneService.raycastableObjects(), true );

		// if not intersection found then check for background intersection
		if ( this.intersections.length < 1 ) {

			this.intersections = this.raycaster.intersectObjects( [ SceneService.bgForClicks ], false );

		}

		if ( this.intersections.length > 0 ) {

			this.eventSystem.pointerUp.emit( this.preparePointerData( event, this.intersections[ 0 ] ) );

			this.dragManager.onDragEnd( this.preparePointerData( event, this.intersections[ 0 ] ) );


		} else {

			// dont fire if no interaction
			// this.eventSystem.pointerUp.emit( this.preparePointerData( event, null ) );

		}

	}

	/**
	 *
	 * @param $event
	 */
	onMouseEnter ( $event: Event ): void {

		this.onCanvas = true;
		this.eventSystem.pointerEnter.emit( new PointerEventData );

	}

	/**
	 * mouseleave event is only triggered when the mouse pointer
	 * leaves the selected element.
	 *
	 * @param $event
	 */
	onMouseLeave ( $event: Event ): void {

		this.onCanvas = false;
		this.eventSystem.pointerLeave.emit( new PointerEventData );

	}

	/**
	 * mouseout event triggers when the mouse pointer leaves
	 * any child elements as well the selected element.
	 *
	 * @param $event
	 * @deprecated dont use use this event, as it triggers when mouse leaves any child elements
	 */
	onMouseOut ( $event: MouseEvent ): void {

		this.onCanvas = false;
		this.eventSystem.pointerOut.emit( new PointerEventData );

	}

	@HostListener( 'dragenter', [ '$event' ] )
	onDragEnter ( $event: DragEvent ): void {
		$event.preventDefault();
		$event.stopPropagation();
	}

	@HostListener( 'dragover', [ '$event' ] )
	onDragOver ( $event: DragEvent ): void {

		$event.preventDefault();
		$event.stopPropagation();

		this.updateMousePosition( $event );

		// Limit the frequency of operations to avoid performance issues.
		if ( ( Date.now() - this.lastTime ) < this.minTime ) {
			return;
		}

		this.lastTime = Date.now();

		this.intersections = this.getIntersections( $event );

		const event = this.preparePointerData( $event, this.intersections[ 0 ] );

		const data = this.dragDropService.getData();

		if ( !data ) return;

		// dont allow dragging of scene or opendrive files
		if ( data.type == AssetType.SCENE || data.type == AssetType.OPENDRIVE ) {
			return;
		}

		ToolManager.onAssetDragOver( data, event );

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event: DragEvent ): void {
		$event.preventDefault();
		$event.stopPropagation();
	}

	@HostListener( 'drop', [ '$event' ] )
	async onDrop ( $event: DragEvent ): Promise<void> {

		$event.preventDefault();
		$event.stopPropagation();

		this.updateMousePosition( $event );

		this.intersections = this.getIntersections( $event );

		const event = this.preparePointerData( $event, this.intersections[ 0 ] )

		this.eventSystem.drop.emit( event );

		const data = this.dragDropService.getData();

		await this.viewportService.handleAssetDropped( data, event );

		this.dragDropService.clear();
	}

	@HostListener( 'window: resize', [ '$event' ] )
	onWindowResized (): void {

		const container = this.renderer.domElement.parentElement.parentElement;

		this.canvasService.resizeViewport( container );

		this.rendererService.onCanvasResized();

	}

	@HostListener( 'document:keydown', [ '$event' ] )
	onKeyDown ( e: KeyboardEvent ): void {

		if ( !this.onCanvas ) return;

		this.eventSystem.keyDown.emit( e );

	}

	fireSelectionEvents (): void {

		if ( this.intersections.length > 0 ) {

			let object = null;

			this.intersections.forEach( ( i: Intersection ) => {

				if ( i.object != null && i.object.userData.is_selectable == true ) {

					object = i.object;

					return false;
				}

			} );

			// NO SELECTION EVENTS ON OUR ANNOTATION IMAGE
			// if ( object.userData.is_image ) return;

			// new object is selected, so first deselect
			if ( this.selected != null && object != this.selected ) {

				this.eventSystem.deSelect.emit( { object: this.selected } );

				this.eventSystem.select.emit( { object: object } );

				this.selected = object;

			} else if ( this.selected == null ) {

				this.eventSystem.select.emit( { object: object } );

				this.selected = object;

			} else if ( object == this.selected ) {

				// do nothing

			}

			// no object is selected
		} else {

			this.eventSystem.deSelect.emit( { object: this.selected } );

		}

	}

	fireClickedEvent ( event: MouseEvent ): any {

		if ( this.intersections.length > 0 ) {

			this.eventSystem.pointerClicked.emit(
				this.preparePointerData( event, this.intersections[ 0 ] )
			);

		}

	}

	preparePointerData ( $event: MouseEvent, i: THREE.Intersection ): PointerEventData {

		let p = new PointerEventData();

		if ( i != null ) {

			p.distance = i.distance;
			p.distanceToRay = i.distanceToRay;
			p.index = i.index;
			p.face = i.face;
			p.faceIndex = i.faceIndex;
			p.object = i.object;
			p.point = i.point;
			p.uv = i.uv;
			p.intersections = this.intersections;
			p.camera = this.threeService.camera;
			p.mouse = this.currentMousePosition;
			p.mouseDelta = this.mouseDelta;
			p.mouseEvent = $event;

			p.approxCameraDistance = this.calculateCameraDistance( i );

		} else {

			p.intersections = [];												// intersection are empty
			p.camera = this.threeService.camera;
			p.mouse = this.currentMousePosition;
			p.mouseDelta = this.mouseDelta;
			p.approxCameraDistance = 100;

		}

		// ADDITIONAL
		if ( $event.button == 0 ) {
			p.button = MouseButton.LEFT;
		} else if ( $event.button == 1 ) {
			p.button = MouseButton.MIDDLE;
		} else if ( $event.button == 2 ) {
			p.button = MouseButton.RIGHT;
		}

		return p;
	}

	calculateCameraDistance ( i: Intersection ): number {

		if ( this.threeService.camera instanceof OrthographicCamera ) {

			// Calculate the camera's dimensions
			const cameraWidth = this.threeService.camera.right - this.threeService.camera.left;
			const cameraHeight = this.threeService.camera.top - this.threeService.camera.bottom;

			// Calculate the diagonal size of the camera's visible area
			const cameraDiagonalSize = Math.sqrt( cameraWidth * cameraWidth + cameraHeight * cameraHeight );

			// Calculate the approximate camera distance using the zoom and the diagonal size
			return ( cameraDiagonalSize / ( 2 * this.threeService.camera.zoom ) );

		} else if ( this.threeService.camera instanceof PerspectiveCamera ) {

			return i.distance;

		}
	}

	detectWebgl (): boolean {

		try {

			// Create canvas element. The canvas is not added to the
			// document itself, so it is never displayed in the
			// browser window.
			const canvas = document.createElement( 'canvas' );

			// Get WebGLRenderingContext from canvas element.
			const gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );

			// Report the result.
			if ( gl && gl instanceof WebGLRenderingContext ) {

				return true;

			} else {

				return false;
			}

		} catch ( e ) {

			return false;

		}
	}

	onContextMenu ( $event: MouseEvent ): void {

	}

	updateMousePosition ( $event: MouseEvent ): void {

		this.currentMousePosition.x = ( ( $event.clientX - this.canvasService.left ) / this.canvasService.width ) * 2 - 1;
		this.currentMousePosition.y = -( ( $event.clientY - this.canvasService.top ) / this.canvasService.height ) * 2 + 1;

		this.mouseDelta.x = this.currentMousePosition.x - this.prevMousePosition.x;
		this.mouseDelta.y = this.currentMousePosition.y - this.prevMousePosition.y;

		this.prevMousePosition.x = this.currentMousePosition.x;
		this.prevMousePosition.y = this.currentMousePosition.y;

	}

	getIntersections ( event: MouseEvent, recursive: boolean = true ): THREE.Intersection[] {

		this.raycaster.setFromCamera( this.currentMousePosition, this.threeService.camera );

		this.raycaster.layers.set( 0 );  // default layer

		let intersections = this.raycaster.intersectObjects( this.sceneService.toolLayer.children, recursive );

		if ( intersections.length > 0 ) {

			// if object is found then fire move event
			return intersections;

		}

		intersections = this.raycaster.intersectObjects( this.sceneService.scene.children, recursive );

		if ( intersections.length > 0 ) {

			// if object is found then fire move event
			return intersections;

		}

		// check for background intersection
		return this.raycaster.intersectObjects( [ this.sceneService.bgForClicks ], false );
	}

	changeCamera (): void {

		this.cameraService.changeCamera();

	}

	resetCamera (): void {

		this.cameraService.resetCamera();

		// NOTE: view controller reset & update  is very important
		this.viewControllerService.setFocusTarget( new Vector3( 0, 0, 0 ) );
		this.viewControllerService.update( 1 );

	}

	wireframeMode (): void {

		this.showWireframe = !this.showWireframe;

		this.threeService.wireframeMode( this.showWireframe );

	}

	clearDebugElements (): void {

		this.sceneService.toolLayer?.clear();

	}

	handleViewHelperClick ( $event: MouseEvent ): void {

		$event.stopPropagation();

		this.viewHelperService.handleClick( $event as PointerEvent );

	}

	adjustRaycasterThreshold (): void {

		const target = this.viewControllerService.getTarget() || new Vector3();

		const cameraDistance = this.cameraService.computeDistance( target );

		// Adjust the threshold based on camera distance
		const min = 0.1; // minimum threshold
		const minDistance = 1; // distance at which the threshold is minimum

		const maxDistance = 2500; // distance at which the threshold is maximum
		const max = 10.0; // maximum threshold

		const normalizedDistance = Math.min( Math.max( ( cameraDistance - minDistance ) / ( maxDistance - minDistance ), 0 ), 1 );

		const threshold = max + ( min - max ) * ( 1 - normalizedDistance );

		this.raycaster.params.Points.threshold = threshold;

	}
}


@Injectable( {
	providedIn: 'root'
} )
class ViewportDragManager {

	private dragStartPosition: Vector3;

	private selectedObject: IView | undefined;

	isDragging: boolean;

	constructor () {

	}

	onDragStart ( selectedObject: object, event: PointerEventData ): void {

		if ( !isView( selectedObject ) ) return;

		this.selectedObject = selectedObject;

		this.isDragging = true;

		this.dragStartPosition = event.point.clone();

	}

	onDragEnd ( event: PointerEventData ): void {

		this.isDragging = false;

		if ( !isView( this.selectedObject ) ) return;

		Commands.SetPosition( this.selectedObject, event.point, this.dragStartPosition );

		this.selectedObject = undefined;

		this.dragStartPosition = undefined;

	}

	onDrag ( object: object, event: PointerEventData ): void {

		if ( !isView( this.selectedObject ) ) return;

		this.selectedObject.emit( 'drag', event );

	}


}
