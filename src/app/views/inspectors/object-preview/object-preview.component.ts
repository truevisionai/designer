/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { TvOrbitControls } from 'app/modules/three-js/objects/tv-orbit-controls';
import { RoadStyle } from 'app/services/road-style.service';
import { COLOR } from 'app/shared/utils/colors.service';
import {
	BoxGeometry,
	Color,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
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

		this.camera = new PerspectiveCamera( 75, 200 / 100, 0.1, 1000 );

		this.camera.position.set( 0, 5, 10 );

		this.camera.up.copy( AppConfig.DEFAULT_UP );

		this.camera.updateProjectionMatrix();

		this.previewService.createLights( this.scene );

	}

	ngAfterViewInit (): void {

		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		this.canvas.appendChild( this.previewService.renderer.domElement );

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

	}


	render () {

		// this seems a faster want to call render function
		this.frameId = requestAnimationFrame( this.render );

		this.previewService.renderer.render( this.scene, this.camera );

		this.controls.update();
	}

	@HostListener( 'window: resize', [ '$event' ] )
	resize () {

		this.setCanvasSize();

	}

	setCanvasSize () {

		const container = this.previewService.renderer.domElement.parentElement;

		const box = container.getBoundingClientRect();

		const width = container.clientWidth || 300;

		// take 75% of the width to maintain 4:3 aspect ratio
		const height = width ? width * 0.75 : 300; // container.clientHeight;

		this.previewService.renderer.setViewport( -box.left, -box.top, width, height );
		this.previewService.renderer.setSize( width, height );

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

	}

}
