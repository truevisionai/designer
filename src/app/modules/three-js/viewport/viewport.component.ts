/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventSystem } from 'app/events/event-system.service';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ThreeService } from 'app/modules/three-js/three.service';

// import * as Stats from 'stats.js';
import * as THREE from 'three';
import { Intersection, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { SceneService } from '../../../core/services/scene.service';
import { ViewportService } from '../viewport.service';

@Component( {
	selector: 'app-viewport',
	templateUrl: './viewport.component.html',
} )
export class ViewportComponent implements OnInit, AfterViewInit, OnDestroy {

	@Input( 'directionalLight' ) directionalLightEnabled: boolean = false;
	@Input( 'showPointerCoordinates' ) showPointerCoordinates: boolean = false;

	public beginTime;
	public prevTime;
	public frames = 0;
	public fps;

	CANVAS_WIDTH = 600;
	CANVAS_HEIGHT = 600;

	OFFSET_LEFT: number = 0;
	OFFSET_TOP: number = 0;

	selected: Object3D;
	intersections: THREE.Intersection[] = [];
	lastIntersection: THREE.Intersection;

	@ViewChild( 'viewport' ) elementRef: ElementRef;
	@ViewChild( 'viewHelper' ) viewHelperRef: ElementRef;

	raycaster = new THREE.Raycaster;
	mouse: THREE.Vector2 = new THREE.Vector2();

	private animationId: number;
	private renderer: WebGLRenderer;

	private lastTime: number = Date.now();
	private minTime: number = 100;
	private onCanvas: boolean;

	constructor (
		private threeService: ThreeService,
		private eventSystem: EventSystem,
		private viewportService: ViewportService,
	) {
		this.render = this.render.bind( this );
	}

	get canvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.elementRef.nativeElement;
	}

	get viewHelperCanavs (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.viewHelperRef.nativeElement;
	}

	get cameraType (): string {
		return this.threeService.camera?.type || 'OrthographicCamera';
	}

	ngOnInit () {

		this.prevTime = ( performance || Date ).now();
		this.beginTime = ( performance || Date ).now();

	}

	// was used when multiple canvas instances were used
	ngOnDestroy (): void {

		this.canvas.remove();

		this.renderer.dispose();

		cancelAnimationFrame( this.animationId );
	}

	ngAfterViewInit (): void {

		if ( this.detectWebgl() ) {

			this.setupRenderer();

			setTimeout( () => {

				this.resizeCanvas();

			}, 0 );

		} else {

			alert( 'Your Browser does not support WebGL. Please visit from a browser which supports WebGL.' );
		}

	}

	setupRenderer () {

		this.renderer = new THREE.WebGLRenderer( { alpha: false, antialias: true, precision: 'highp', stencil: false } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setClearColor( 0xffffff, 1 );
		this.renderer.autoClear = false;

		this.raycaster = new THREE.Raycaster();
		// this.raycaster.linePrecision = 0.25;
		this.raycaster.far = 10000;

		this.renderer.setSize( this.CANVAS_WIDTH, this.CANVAS_HEIGHT );

		this.canvas.appendChild( this.renderer.domElement );

		this.threeService.setupScene( this.canvas, this.renderer );

		this.render();

		if ( this.directionalLightEnabled ) {
			this.threeService.addDirectionalLight();
		}

	}

	clock = new THREE.Clock();

	render () {

		// this seems a faster want to call render function
		requestAnimationFrame( this.render );

		const delta = this.clock.getDelta();

		this.frameBegin();

		this.threeService.updateCameraPosition();

		this.renderer.clear();

		if ( this.threeService.viewHelper?.animating ) {
			this.threeService.viewHelper.update( delta );
		}

		this.renderer.render( SceneService.scene, this.threeService.camera );

		this.threeService.viewHelper?.render( this.renderer );

		this.threeService.controls.update();

		this.frameEnd();
	}

	frameBegin () {

		this.beginTime = ( performance || Date ).now();

	}

	frameEnd () {

		this.frames++;

		const time = ( performance || Date ).now();

		if ( time >= this.prevTime + 1000 ) {

			this.fps = Math.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

			this.prevTime = time;

			this.frames = 0;
		}

	}

	onMouseMove ( event: MouseEvent ) {

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

		if ( !intersection ) return;

		this.eventSystem.pointerMoved.emit( this.preparePointerData( event, intersection ) );

	}

	onMouseClick ( event: MouseEvent ) {

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

	onMouseDown ( $event: MouseEvent ) {

		if ( !this.onCanvas ) return;

		this.intersections = this.getIntersections( $event, true );

		$event.preventDefault();

		const intersection = this.intersections?.length > 0 ? this.intersections[ 0 ] : null;

		if ( !intersection ) return;

		switch ( $event.button ) {

			case MouseButton.LEFT: this.handleLeftClick( $event, intersection ); break;

			case MouseButton.MIDDLE: this.handleMiddleClick( $event, intersection ); break;

			case MouseButton.RIGHT: this.handleRightClick( $event, intersection ); break;

		}

	}

	handleRightClick ( event: MouseEvent, intersection: THREE.Intersection<THREE.Object3D<THREE.Event>> ) {

		this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );

	}

	handleMiddleClick ( event: MouseEvent, intersection: THREE.Intersection<THREE.Object3D<THREE.Event>> ) {

		// do nothing

	}

	handleLeftClick ( event: MouseEvent, intersection: THREE.Intersection<THREE.Object3D<THREE.Event>> ) {

		this.fireSelectionEvents();

		if ( intersection?.object?.type === 'Points' ) {

			this.threeService.disableControls();

		} else {

			this.threeService.enableControls();

		}

		this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );
	}

	onMouseUp ( event: MouseEvent ) {

		this.threeService.enableControls();

		this.updateMousePosition( event );

		this.raycaster.setFromCamera( this.mouse, this.threeService.camera );

		this.intersections = this.raycaster.intersectObjects( SceneService.objects, true );

		// if not intersection found then check for background intersection
		if ( this.intersections.length < 1 ) {

			this.intersections = this.raycaster.intersectObjects( [ ThreeService.bgForClicks ], false );

		}

		if ( this.intersections.length > 0 ) {

			this.eventSystem.pointerUp.emit( this.preparePointerData( event, this.intersections[ 0 ] ) );

		} else {

			// dont fire if no interaction
			// this.eventSystem.pointerUp.emit( this.preparePointerData( event, null ) );

		}

	}

	/**
	 *
	 * @param $event
	 */
	onMouseEnter ( $event: Event ) {

		this.onCanvas = true;
		this.eventSystem.pointerEnter.emit( new PointerEventData );

	}

	/**
	 * mouseleave event is only triggered when the mouse pointer
	 * leaves the selected element.
	 *
	 * @param $event
	 */
	onMouseLeave ( $event: Event ) {

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
	onMouseOut ( $event: MouseEvent ) {

		this.onCanvas = false;
		this.eventSystem.pointerOut.emit( new PointerEventData );

	}

	@HostListener( 'dragenter', [ '$event' ] )
	onDragEnter ( $event: DragEvent ) {
		$event.preventDefault();
		$event.stopPropagation();
	}

	@HostListener( 'dragover', [ '$event' ] )
	onDragOver ( $event: DragEvent ) {
		$event.preventDefault();
		$event.stopPropagation();
	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event: DragEvent ) {
		$event.preventDefault();
		$event.stopPropagation();
	}

	@HostListener( 'drop', [ '$event' ] )
	async onDrop ( $event: DragEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.updateMousePosition( $event );

		this.intersections = this.getIntersections( $event );

		this.eventSystem.drop.emit( this.preparePointerData( $event, this.intersections[ 0 ] ) );

		const intersection = this.intersections?.length > 0 ? this.intersections[ 0 ] : null;

		const position = intersection?.point || new Vector3();

		await this.viewportService.onDrop( $event, position );
	}

	@HostListener( 'window: resize', [ '$event' ] )
	resize () {

		this.resizeCanvas();

	}

	fireSelectionEvents () {

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
			p.mouse = this.mouse;
			p.mouseEvent = $event;

			p.approxCameraDistance = this.calculateCameraDistance( i );

		} else {

			p.intersections = [];												// intersection are empty
			p.camera = this.threeService.camera;
			p.mouse = this.mouse;
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

	detectWebgl () {

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

	onContextMenu ( $event: MouseEvent ) {


	}

	updateMousePosition ( $event: MouseEvent ) {

		this.mouse.x = ( ( $event.clientX - this.OFFSET_LEFT ) / this.CANVAS_WIDTH ) * 2 - 1;
		this.mouse.y = -( ( $event.clientY - this.OFFSET_TOP ) / this.CANVAS_HEIGHT ) * 2 + 1;

	}

	getIntersections ( event: MouseEvent, recursive: boolean = true ): THREE.Intersection[] {

		this.raycaster.setFromCamera( this.mouse, this.threeService.camera );

		let intersections = this.raycaster.intersectObjects( SceneService.objects, recursive );

		if ( intersections.length > 0 ) {

			// if object is found then fire move event
			return intersections;

		}

		// check for background intersection
		return this.raycaster.intersectObjects( [ ThreeService.bgForClicks ], false );
	}

	resizeCanvas () {

		this.threeService.viewHelperCanavs = this.viewHelperCanavs;

		const container = this.renderer.domElement.parentElement.parentElement;

		const box = container.getBoundingClientRect();

		const width = this.threeService.canvasWidth = this.CANVAS_WIDTH = container.clientWidth;
		const height = this.threeService.canvasHeight = this.CANVAS_HEIGHT = container.clientHeight;

		this.OFFSET_LEFT = this.threeService.leftOffset = box.left;
		this.OFFSET_TOP = this.threeService.topOffset = box.top;

		this.renderer.setViewport( -box.left, -box.top, width, height );
		this.renderer.setSize( width, height );

		this.threeService.onWindowResized();

	}

	changeCamera () {

		this.threeService.changeCamera();

	}

	resetCamera () {

		this.threeService.resetCamera();

	}

	handleViewHelperClick ( $event: MouseEvent ) {

		$event.stopPropagation();

		this.threeService.viewHelper?.handleClick( $event as PointerEvent );

	}
}


class Animator {
	private startTime: number | null = null;
	private intervalId: any | null = null;
	private duration: number;
	private updateRate: number;

	constructor ( duration: number, updateRate: number ) {
		this.duration = duration;
		this.updateRate = updateRate;
	}

	start ( callback: ( value: number ) => void ) {
		if ( this.intervalId !== null ) {
			this.stop();
		}

		this.startTime = performance.now();

		this.intervalId = setInterval( () => {
			const elapsedTime = performance.now() - ( this.startTime as number );

			if ( elapsedTime >= this.duration ) {
				callback( 1 );  // Ensure final value is 1
				this.stop();
				return;
			}

			const progress = elapsedTime / this.duration;
			callback( progress );

		}, this.updateRate );
	}

	stop () {
		if ( this.intervalId !== null ) {
			clearInterval( this.intervalId );
			this.intervalId = null;
			this.startTime = null;
		}
	}
}

