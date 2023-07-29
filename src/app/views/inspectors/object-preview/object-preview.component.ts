/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TvOrbitControls } from 'app/modules/three-js/objects/tv-orbit-controls';
import { AssetDatabase } from 'app/services/asset-database';
import { RoadStyle } from 'app/services/road-style.service';
import { COLOR } from 'app/shared/utils/colors.service';
import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three';
import { PreviewService } from './object-preview.service';

@Component( {
	selector: 'app-object-preview',
	templateUrl: './object-preview.component.html',
	styleUrls: [ './object-preview.component.css' ]
} )
export class ObjectPreviewComponent implements OnInit, AfterViewInit, OnDestroy {

	@Input() path: string;

	@Input() guid: string;

	@Input() object: Object3D;

	@Input() objectType: 'default' | 'model' | 'material' | 'roadstyle' = 'default';

	@ViewChild( 'viewport' ) viewportRef: ElementRef;

	public static renderer: WebGLRenderer;
	public frameId: number;

	public scene: Scene = new Scene;
	public camera: PerspectiveCamera;
	public controls: TvOrbitControls;

	cube: Mesh;

	constructor ( private previewService: PreviewService ) {

		this.render = this.render.bind( this );

	}

	get canvas (): HTMLCanvasElement {
		return <HTMLCanvasElement>this.viewportRef.nativeElement;
	}

	get width (): number {
		return this.canvas.width;
	}

	get height () {
		return this.canvas.height;
	}

	ngOnInit () {

		if ( !ObjectPreviewComponent.renderer ) {

			const options = {
				alpha: false,
				antialias: true,
				precision: 'highp',
				stencil: false
			};

			ObjectPreviewComponent.renderer = new WebGLRenderer( options );
			ObjectPreviewComponent.renderer.setPixelRatio( window.devicePixelRatio );
			ObjectPreviewComponent.renderer.setClearColor( 0xffffff, 1 );
			ObjectPreviewComponent.renderer.autoClear = true;

		}

		this.camera = new PerspectiveCamera( 75, 200 / 100, 0.1, 1000 );

		this.camera.position.set( 0, 5, 10 );

		this.camera.up.set( 0, 0, 1 );

		this.camera.updateProjectionMatrix();

		this.addDirectionLight();

	}

	ngAfterViewInit (): void {

		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		this.canvas.appendChild( ObjectPreviewComponent.renderer.domElement );

		switch ( this.objectType ) {

			case 'model':
				this.modelPreviewSetup();
				break;

			case 'material':
				this.materialPreviewSetup();
				break;

			case 'roadstyle':
				this.roadStylePreviewSetup();
				break;

			default:
				this.defaultObjectSetup();
				break;
		}

		setTimeout( () => {

			this.setCanvasSize();

		}, 0 );

		this.render();
	}

	ngOnDestroy (): void {

		if ( this.frameId ) cancelAnimationFrame( this.frameId );

		// no need to dispose if renderer is static
		// if ( ObjectPreviewComponent.renderer ) ObjectPreviewComponent.renderer.dispose();

	}

	modelPreviewSetup () {

		this.previewService.modelPreviewSetup( this.scene, this.camera, this.object );

		this.scene.add( this.previewService.ground );

		this.controls.setRotateEnabled( true );
	}

	materialPreviewSetup () {

	}

	roadStylePreviewSetup () {

		if ( !this.guid ) return;

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( this.guid );

		// this.camera.position.z = roadStyle.

	}

	defaultObjectSetup () {

		this.scene.background = new Color( COLOR.BLACK );

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = this.cube = new Mesh( geometry, material );

		if ( this.object ) {

			this.scene.add( this.object );

		} else {

			this.scene.add( cube );

		}

		this.camera = new PerspectiveCamera( 75, 200 / 100, 0.1, 1000 );
		this.camera.position.z = 5;

		// this.controls = new EditorControls( this.camera, ObjectPreviewComponent.renderer.domElement );
		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		// console.log( this.width, this.height, this.canvas.clientWidth, this.canvas.clientHeight );
	}


	render () {

		// this seems a faster want to call render function
		this.frameId = requestAnimationFrame( this.render );

		// this.frameId = requestAnimationFrame( () => {
		//     this.render();
		// } );

		ObjectPreviewComponent.renderer.render( this.scene, this.camera );

		this.controls.update();
	}

	@HostListener( 'window: resize', [ '$event' ] )
	resize () {

		this.setCanvasSize();

	}

	setCanvasSize () {

		const container = ObjectPreviewComponent.renderer.domElement.parentElement;

		const box = container.getBoundingClientRect();

		const width = container.clientWidth || 300;

		// take 75% of the width to maintain 4:3 aspect ratio
		const height = width ? width * 0.75 : 300; // container.clientHeight;

		ObjectPreviewComponent.renderer.setViewport( -box.left, -box.top, width, height );
		ObjectPreviewComponent.renderer.setSize( width, height );

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

	}

	addDirectionLight () {

		const directionaLight = new DirectionalLight( 0xffffff, 1 );

		directionaLight.position.set( 5, 10, 7.5 );

		this.scene.add( directionaLight );

		this.scene.add( directionaLight.target );

		const ambientLight = new AmbientLight( 0xE6E6E6, 1 );

		this.scene.add( ambientLight );

	}
}
