/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InputService } from 'app/core/services/input.service';
import { EventSystem } from 'app/events/event-system.service';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ThreeService } from 'app/modules/three-js/three.service';
import { ImporterService } from 'app/services/importer.service';

// import * as Stats from 'stats.js';
import * as THREE from 'three';
import { Intersection, Object3D, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';
import { SceneService } from '../../../core/services/scene.service';

@Component( {
    selector: 'app-viewport',
    templateUrl: './viewport.component.html',
    styles: [
        `.app-viewport-stats {
			top: 12px;
			right: 10px;
			color: white;
			height: 38px;
			padding: 0px 8px !important;
			position: absolute;
			width: auto !important;
		}`
    ]
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

    raycaster = new THREE.Raycaster;
    mouse: THREE.Vector2 = new THREE.Vector2();

    private animationId;
    private renderer: WebGLRenderer;
    private ORTHO_DRIVER = 4;
    // private stats: Stats;
    private lastTime: number = Date.now();
    private minTime: number = 100;

    constructor (
        private threeService: ThreeService,
        private inputService: InputService,
        private eventSystem: EventSystem,
        private importer: ImporterService,
    ) {
        this.render = this.render.bind( this );
    }

    get canvas (): HTMLCanvasElement {
        return <HTMLCanvasElement> this.elementRef.nativeElement;
    }

    ngOnInit () {


    }

    // was used when multiple canvas instances were used
    ngOnDestroy (): void {

        this.canvas.remove();

        this.renderer.dispose();

        cancelAnimationFrame( this.animationId );
    }

    ngAfterViewInit (): void {

        this.prevTime = ( performance || Date ).now();
        this.beginTime = ( performance || Date ).now();

        if ( this.detectWebgl() ) {

            this.setupRenderer();

            setTimeout( () => {

                this.setCanvasSize();

            }, 300 );

        } else {

            alert( 'Your Browser does not support WebGL. Please visit from a browser which supports WebGL.' );
        }

    }

    setupRenderer () {

        this.renderer = new THREE.WebGLRenderer( { alpha: false, antialias: true, precision: 'highp', stencil: false } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor( 0xffffff, 1 );
        this.renderer.autoClear = true;

        this.raycaster = new THREE.Raycaster();
        // this.raycaster.linePrecision = 0.25;
        this.raycaster.far = 10000;

        ////////////////////////////////////

        this.renderer.setSize( this.CANVAS_WIDTH, this.CANVAS_HEIGHT );

        this.canvas.appendChild( this.renderer.domElement );

        ////////////////////////////////////

        this.threeService.setupScene( this.canvas, this.renderer );

        this.render();

        // const self: ViewportComponent = this;

		/**
		 * Commented the below as this was causing slow rendering
		 */
        // ( function render () {

        //     self.animationId = requestAnimationFrame( render );

        //     self.render();

        // }() );

        // self.render();

        this.handleEditorEvents();
        this.handlePointerEvents();

        if ( this.directionalLightEnabled ) this.threeService.addDirectionalLight();

    }

    handleEditorEvents (): any {

        // this.editorService.onZoomIn.subscribe( e => {
        //     if ( this.threeService.camera.zoom >= 2.0 ) return;
        //     this.threeService.camera.zoom += 0.1;
        //     this.threeService.camera.updateProjectionMatrix();
        // } );
        //
        // this.editorService.onZoomOut.subscribe( e => {
        //     if ( this.threeService.camera.zoom <= 0.20 ) return;
        //     this.threeService.camera.zoom -= 0.1;
        //     this.threeService.camera.updateProjectionMatrix();
        // } );
        //
        // this.editorService.onZoomReset.subscribe( e => {
        //     this.threeService.camera.zoom = 1;
        //     this.threeService.camera.updateProjectionMatrix();
        // } );

    }

    render () {

        // this seems a faster want to call render function
        requestAnimationFrame( this.render );

        this.frameBegin();

        this.renderer.render( SceneService.scene, this.threeService.camera );

        ThreeService.controls.update();

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

    findIntersections ( recursive: boolean = true ): void {

        this.raycaster.setFromCamera( this.mouse, this.threeService.camera );

        this.intersections = this.raycaster.intersectObjects( SceneService.objects, recursive );

        if ( this.intersections.length > 0 ) {

            // if new object then fire enter event
            if (
                this.lastIntersection != null &&
                this.lastIntersection.object.id != this.intersections[ 0 ].object.id &&
                this.intersections[ 0 ].object[ 'detectRaycast' ] == true
            ) {

                this.eventSystem.pointerExit.emit( this.convertToPointerData( 0, this.lastIntersection ) );
                this.eventSystem.pointerEnter.emit( this.convertToPointerData( 0, this.intersections[ 0 ] ) );

            }

            if ( this.intersections[ 0 ].object[ 'detectRaycast' ] == true ) {

                this.lastIntersection = this.intersections[ 0 ];

            }

            // if ( this.threeIntersection.object.userData.is_annotation ) {
            //   this.editorService.mouseOverAnnotationObject.emit( this.threeIntersection );
            // }

            // if ( this.threeIntersection.object.userData.is_button ) {
            //   this.editorService.mouseOverButton.emit( this.threeIntersection );
            // }


        } else {

            if ( this.lastIntersection != null ) {

                this.eventSystem.pointerExit.emit( this.convertToPointerData( 0, this.lastIntersection ) );

            }

            this.lastIntersection = null;

        }
    }

    onMouseMove ( event: MouseEvent ) {

        // TODO: implement GPU picking
        // https://threejs.org/examples/webgl_interactive_cubes_gpu.html
        // https://stackoverflow.com/questions/48691642/three-js-raycaster-find-intersections-as-mouse-moves
        // https://github.com/brianxu/GPUPicker

        this.mouse.x = ( ( event.clientX - this.OFFSET_LEFT ) / this.CANVAS_WIDTH ) * 2 - 1;
        this.mouse.y = -( ( event.clientY - this.OFFSET_TOP ) / this.CANVAS_HEIGHT ) * 2 + 1;

        this.raycaster.setFromCamera( this.mouse, this.threeService.camera );

        // logic to limit the number of time raycasting will be done
        // return if less time has passed
        if ( ( Date.now() - this.lastTime ) < this.minTime ) return;

        this.lastTime = Date.now();


        // this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // this.editorService.move.emit( this.mouse );

        // this.eventSystem.pointerMoved.emit( { this.INTERSECTIONS[0] } );

        this.intersections = this.raycaster.intersectObjects( [ ThreeService.bgForClicks ], false );

        if ( this.intersections.length > 0 ) {
            this.eventSystem.pointerMoved.emit( this.convertToPointerData( 0, this.intersections[ 0 ] ) );
        }

        // TODO: no need to find intersections on mouse move
        return;

        this.findIntersections( false );

        if ( this.intersections.length > 0 ) {
            this.eventSystem.pointerMoved.emit( this.convertToPointerData( 0, this.intersections[ 0 ] ) );
        } else {
            // this.eventSystem.pointerMoved.emit( { point: new THREE.Vector3 } );
        }

    }

    onMouseClick ( event: MouseEvent ) {

        // this.findIntersections();

        switch ( event.button ) {

            // left
            case 0:
                this.fireSelectionEvents();
                this.fireClickedEvent( event.button );
                break;

            // middle click
            case 1:
                break;

            // right
            case 2:
                break;

        }

    }

    onMouseDown ( event: MouseEvent ) {

        this.findIntersections( true );

        event.preventDefault();

        // this.eventSystem.pointerDown.emit( new PointerEventData );

        switch ( event.button ) {

            // left
            case 0:
                this.fireSelectionEvents();
                if ( this.intersections.length > 0 ) {
                    this.eventSystem.pointerDown.emit(
                        this.convertToPointerData( event.button, this.intersections[ 0 ] )
                    );
                } else {
                    this.eventSystem.pointerDown.emit( this.convertToPointerData( event.button, null ) );
                }
                break;

            // middle
            case 1:
                // this.eventSystem.pointerDown.emit( this.convertToPointerData( event.button, null ) );
                break;

            // right
            case 2:
                this.eventSystem.pointerDown.emit( this.convertToPointerData( event.button, null ) );
                break;

        }

    }

    onMouseUp ( event: MouseEvent ) {

        this.eventSystem.pointerUp.emit( this.convertToPointerData( event.button, null ) );

    }

    onMouseEnter ( event: Event ) {

        this.eventSystem.pointerEnter.emit( new PointerEventData );

    }

    onMouseExit ( event: MouseEvent ) {

        this.eventSystem.pointerExit.emit( new PointerEventData );

    }

    onMouseLeave ( $event: Event ) {

        this.eventSystem.pointerLeave.emit( new PointerEventData );

    }

    onMouseOut ( e: MouseEvent ) {

        this.eventSystem.pointerOut.emit( new PointerEventData );

    }

    //Dragover listener
    @HostListener( 'dragover', [ '$event' ] )
    onDragOver ( evt ) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    //Dragleave listener
    @HostListener( 'dragleave', [ '$event' ] )
    onDragLeave ( evt ) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    //Drop listener
    @HostListener( 'drop', [ '$event' ] )
    onDrop ( $event: DragEvent ) {

        $event.preventDefault();
        $event.stopPropagation();

        this.mouse.x = ( ( $event.clientX - this.OFFSET_LEFT ) / this.CANVAS_WIDTH ) * 2 - 1;
        this.mouse.y = -( ( $event.clientY - this.OFFSET_TOP ) / this.CANVAS_HEIGHT ) * 2 + 1;

        this.findIntersections();

        this.eventSystem.drop.emit( this.convertToPointerData( 0, this.intersections[ 0 ] ) );

        let position = null;

        if ( this.intersections.length > 0 ) {

            this.eventSystem.pointerMoved.emit( this.convertToPointerData( 0, this.intersections[ 0 ] ) );

            position = this.intersections[ 0 ].point;

        }


        this.importer.importViaPath( $event.dataTransfer.getData( 'path' ), '', position );
    }

    @HostListener( 'window: resize', [ '$event' ] )
    resize () {

        this.setCanvasSize();

        // let width = this.CANVAS_WIDTH;
        // let height = this.CANVAS_HEIGHT;
        //
        // // const box = this.threeService.getCanvasBounds();
        //
        // // this.CANVAS_WIDTH = width = box.width;
        // // this.CANVAS_HEIGHT = height = box.height;
        //
        // this.renderingService.renderer.setSize( width, height );
        //
        // // this.renderer.setViewport( box.left, -box.top, width, height );
        // this.renderingService.renderer.setViewport( 0, -64, width, height );
        //
        // this.threeService.oCamera.left = width / -2;
        // this.threeService.oCamera.right = width / 2;
        // this.threeService.oCamera.top = height / 2;
        // this.threeService.oCamera.bottom = height / -2;
        //
        // this.threeService.oCamera.updateProjectionMatrix();

    }

    handlePointerEvents (): any {


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

    fireClickedEvent ( button: number ): any {

        if ( this.intersections.length > 0 ) {

            this.eventSystem.pointerClicked.emit(
                this.convertToPointerData( button, this.intersections[ 0 ] )
            );

        }

    }

    convertToPointerData ( button: number, i: THREE.Intersection ): PointerEventData {

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

            if ( this.threeService.camera instanceof OrthographicCamera ) {

                // approximation, not accurate
                p.approxCameraDistance = ( 1 / this.threeService.camera.zoom ) * this.ORTHO_DRIVER * this.threeService.camera.position.z;

            } else if ( this.threeService.camera instanceof PerspectiveCamera ) {

                p.approxCameraDistance = i.distance;

            }

        } else {

            p.intersections = [];

        }

        // ADDITIONAL
        if ( button == 0 ) {
            p.button = MouseButton.LEFT;
        } else if ( button == 1 ) {
            p.button = MouseButton.MIDDLE;
        } else if ( button == 2 ) {
            p.button = MouseButton.RIGHT;
        }

        return p;
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

    private setCanvasSize () {

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
}
