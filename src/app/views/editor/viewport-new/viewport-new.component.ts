import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit, Output,
	ViewChild
} from '@angular/core';
import { Environment } from 'app/core/utils/environment';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ViewportEvents } from 'app/events/viewport-events';
import * as THREE from 'three';
import { Object3D, WebGLRenderer, Intersection, OrthographicCamera, PerspectiveCamera, Camera } from 'three';
import { IViewportController } from "../../../objects/i-viewport-controller";
import { TvOrbitControls } from "../../../objects/tv-orbit-controls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class CanvasConfig {
	width: number = 600;

	height: number = 600;

	left: number = 0;

	top: number = 0;
}

export class ViewportConfig {

	enableControls: boolean = true;

	showGrid: boolean = true;

	showAxes: boolean = true;

	showFps: boolean = true;

	showStats: boolean = true;
}

@Component( {
	selector: 'app-viewport-new',
	templateUrl: './viewport-new.component.html',
	styleUrls: [ './viewport-new.component.scss' ]
} )
export class ViewportNewComponent implements OnInit, AfterViewInit, OnDestroy {

	@Output() updated = new EventEmitter<any>();

	@Output() resized = new EventEmitter<any>();

	@Input() config: ViewportConfig = new ViewportConfig();

	@Input() eventSystem: ViewportEvents;

	@Input() canvasConfig: CanvasConfig = new CanvasConfig();

	@Input() controls: IViewportController;

	@Input() scene: THREE.Scene = new THREE.Scene();

	@Input() camera: THREE.Camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 1000 );

	public beginTime: number;

	public prevTime: number;

	public frames = 0;

	public fps: number;

	selected: Object3D;

	intersections: THREE.Intersection[] = [];

	@ViewChild( 'viewport' ) viewportRef: ElementRef;

	raycaster = new THREE.Raycaster;

	currentMousePosition: THREE.Vector2 = new THREE.Vector2();

	prevMousePosition: THREE.Vector2 = new THREE.Vector2();

	mouseDelta: THREE.Vector2 = new THREE.Vector2();

	private animationId: number;

	private lastTime: number = Date.now();

	private minTime: number = 100;

	private onCanvas: boolean;

	private isPointerDown: boolean;

	private showWireframe = false;

	private background = new THREE.Mesh( new THREE.PlaneGeometry( 10000, 10000 ), new THREE.MeshBasicMaterial( {
		color: 0xFFFFFF,
		transparent: true,
		opacity: 0
	} ) );

	get isProduction () {
		return Environment.production;
	}

	get canvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.viewportRef.nativeElement;
	}

	get cameraType (): string {
		return this.camera?.type || 'OrthographicCamera';
	}

	public renderer: WebGLRenderer;

	constructor () {
		this.render = this.render.bind( this );
	}

	ngOnInit () {

		this.prevTime = ( performance || Date ).now();
		this.beginTime = ( performance || Date ).now();

	}

	ngAfterViewInit (): void {

		if ( !this.detectWebgl() ) {

			alert( 'Your Browser does not support WebGL. Please visit from a browser which supports WebGL.' );

			return;
		}

		this.initRenderer( this.canvas );

		const controls = this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		// Listen for the 'change' event on OrbitControls
		( controls as unknown as OrbitControls ).addEventListener( 'change', () => {

			this.updated.emit( this.camera );

		} );

		this.raycaster = new THREE.Raycaster();
		this.raycaster.params.Line.threshold = 0.5;
		this.raycaster.params.Line2 = {
			threshold: 0.5
		}
		this.raycaster.far = 10000;

		this.render();

		setTimeout( () => {

			this.onWindowResized();

		}, 10 );

	}

	// was used when multiple canvas instances were use
	ngOnDestroy (): void {

		this.canvas.remove();

		this.renderer.dispose();

		cancelAnimationFrame( this.animationId );
	}

	render () {

		// this seems a faster want to call render function
		requestAnimationFrame( this.render );

		this.frameBegin();

		this.renderer.clear();

		this.renderer.render( this.scene, this.camera );

		this.controls.update();

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

		this.isPointerDown = true;

		this.intersections = this.getIntersections( $event, true );

		$event.preventDefault();

		const intersection = this.intersections?.length > 0 ? this.intersections[ 0 ] : null;

		if ( !intersection ) return;

		switch ( $event.button ) {

			case MouseButton.LEFT:
				this.handleLeftClick( $event, intersection );
				break;

			case MouseButton.MIDDLE:
				this.handleMiddleClick( $event, intersection );
				break;

			case MouseButton.RIGHT:
				this.handleRightClick( $event, intersection );
				break;

		}

	}

	handleRightClick ( event: MouseEvent, intersection: Intersection ) {

		this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );

	}

	handleMiddleClick ( event: MouseEvent, intersection: Intersection ) {

		// do nothing

	}

	handleLeftClick ( event: MouseEvent, intersection: Intersection ) {

		this.fireSelectionEvents();

		if ( intersection?.object?.type === 'Points' ) {

			this.controls.enabled = false;

		} else {

			this.controls.enabled = true;

		}

		this.eventSystem.pointerDown.emit( this.preparePointerData( event, intersection ) );
	}

	onMouseUp ( event: MouseEvent ) {

		this.isPointerDown = false;

		this.controls.enabled = true;

		this.updateMousePosition( event );

		this.raycaster.setFromCamera( this.currentMousePosition, this.camera );

		this.intersections = this.raycaster.intersectObjects( this.scene.children, true );

		// if not intersection found then check for background intersection
		if ( this.intersections.length < 1 ) {

			this.intersections = this.raycaster.intersectObjects( [ this.background ], false );

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

	@HostListener( 'window: resize', [ '$event' ] )
	onWindowResized () {

		const container = this.renderer.domElement.parentElement.parentElement;

		const box = container.getBoundingClientRect();

		this.canvasConfig.width = container.clientWidth;

		this.canvasConfig.height = container.clientHeight;

		this.canvasConfig.left = box.left;

		this.canvasConfig.top = box.top;

		this.resized.emit( this.canvasConfig );

		this.renderer.setViewport( -this.canvasConfig.left, -this.canvasConfig.top, this.canvasConfig.width, this.canvasConfig.height );

		this.renderer.setSize( this.canvasConfig.width, this.canvasConfig.height );

		this.resizeCamera( this.camera, this.canvasConfig.width / this.canvasConfig.height );

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
			p.camera = this.camera;
			p.mouse = this.currentMousePosition;
			p.mouseDelta = this.mouseDelta;
			p.mouseEvent = $event;
			p.pointerDown = this.isPointerDown;

			p.approxCameraDistance = this.calculateCameraDistance( i );

		} else {

			p.intersections = [];												// intersection are empty
			p.camera = this.camera;
			p.mouse = this.currentMousePosition;
			p.mouseDelta = this.mouseDelta;
			p.pointerDown = this.isPointerDown;
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

		if ( this.camera instanceof OrthographicCamera ) {

			// Calculate the camera's dimensions
			const cameraWidth = this.camera.right - this.camera.left;
			const cameraHeight = this.camera.top - this.camera.bottom;

			// Calculate the diagonal size of the camera's visible area
			const cameraDiagonalSize = Math.sqrt( cameraWidth * cameraWidth + cameraHeight * cameraHeight );

			// Calculate the approximate camera distance using the zoom and the diagonal size
			return ( cameraDiagonalSize / ( 2 * this.camera.zoom ) );

		} else if ( this.camera instanceof PerspectiveCamera ) {

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

		this.currentMousePosition.x = ( ( $event.clientX - this.canvasConfig.left ) / this.canvasConfig.width ) * 2 - 1;
		this.currentMousePosition.y = -( ( $event.clientY - this.canvasConfig.top ) / this.canvasConfig.height ) * 2 + 1;

		this.mouseDelta.x = this.currentMousePosition.x - this.prevMousePosition.x;
		this.mouseDelta.y = this.currentMousePosition.y - this.prevMousePosition.y;

		this.prevMousePosition.x = this.currentMousePosition.x;
		this.prevMousePosition.y = this.currentMousePosition.y;

	}

	getIntersections ( event: MouseEvent, recursive: boolean = true ): THREE.Intersection[] {

		this.raycaster.setFromCamera( this.currentMousePosition, this.camera );

		this.raycaster.layers.set( 0 );  // default layer

		let intersections = this.raycaster.intersectObjects( this.scene.children, recursive );

		if ( intersections.length > 0 ) {

			// if object is found then fire move event
			return intersections;

		}

		// check for background intersection
		return this.raycaster.intersectObjects( [ this.background ], false );
	}

	private initRenderer ( canvas: HTMLCanvasElement ) {

		this.renderer = new WebGLRenderer( {
			alpha: false,
			antialias: true,
			precision: 'highp',
			stencil: false
		} );

		this.renderer.setPixelRatio( window.devicePixelRatio );

		this.renderer.setClearColor( 0xffffff, 1 );

		this.renderer.autoClear = false;

		this.renderer.setViewport( -this.canvasConfig.left, -this.canvasConfig.top, this.canvasConfig.width, this.canvasConfig.height );

		this.renderer.setSize( this.canvasConfig.width, this.canvasConfig.height );

		canvas.appendChild( this.renderer.domElement );

	}

	private resizeCamera ( camera: Camera, aspect: number ) {

		if ( camera instanceof OrthographicCamera ) {

			camera.left = camera.bottom * aspect;

			camera.right = camera.top * aspect;

			camera.updateProjectionMatrix();

		} else if ( camera instanceof PerspectiveCamera ) {

			camera.aspect = aspect;

			camera.updateProjectionMatrix();
		}

	}
}
