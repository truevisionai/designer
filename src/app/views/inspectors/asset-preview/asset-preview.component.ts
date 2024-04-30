/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { TvOrbitControls } from 'app/objects/tv-orbit-controls';
import { Object3D, PerspectiveCamera, Scene, } from 'three';
import { AssetPreviewService } from './asset-preview.service';
import { Asset, AssetType } from "../../../core/asset/asset.model";
import { IViewportController } from 'app/objects/i-viewport-controller';
import { AssetService } from 'app/core/asset/asset.service';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';

@Component( {
	selector: 'app-asset-preview',
	templateUrl: './asset-preview.component.html',
	styleUrls: [ './asset-preview.component.css' ]
} )
export class AssetPreviewComponent implements OnInit, AfterViewInit, OnDestroy {

	@Input() asset: Asset;

	@ViewChild( 'viewport' ) viewportRef: ElementRef;

	public frameId: number;

	public scene: Scene = new Scene;

	public camera: PerspectiveCamera;

	public controls: IViewportController;

	@Input() object3d: Object3D;

	constructor ( private previewService: AssetPreviewService, private assetService: AssetService ) {

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

		if ( !this.object3d ) {

			this.object3d = this.getObject3d( this.asset );

		}

		if ( !this.object3d ) return;

		this.previewService.setupScene( this.asset.type, this.object3d, this.scene );

		this.camera = new PerspectiveCamera( 75, 200 / 100, 0.5, 1000 );

		this.camera.position.set( 0, 5, 10 );

		this.camera.up.copy( AppConfig.DEFAULT_UP );

		this.camera.updateProjectionMatrix();

		this.previewService.createLights( this.scene );

		this.previewService.setupCamera( this.asset.type, this.object3d, this.camera );

	}

	ngAfterViewInit (): void {

		if ( !this.object3d ) {
			console.error( 'Object3d not found' );
			return;
		}

		this.controls = TvOrbitControls.getNew( this.camera, this.canvas );

		this.controls.setRotateEnabled( true );

		this.canvas.appendChild( this.previewService.renderer.domElement );

		setTimeout( () => {

			this.resize();

		}, 0 );

		this.render();
	}

	ngOnDestroy (): void {

		if ( this.frameId ) cancelAnimationFrame( this.frameId );

	}

	render () {

		// this seems a faster want to call render function
		this.frameId = requestAnimationFrame( this.render );

		this.previewService.renderer.render( this.scene, this.camera );

		this.controls.update();
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

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

	}

	getObject3d ( asset: Asset ): Object3D {

		if ( asset.type === AssetType.MODEL ) {

			return this.assetService.getModelAsset( this.asset.guid );

		} else if ( asset.type === AssetType.OBJECT ) {

			return this.assetService.getObjectAsset( this.asset.guid )?.instance;

		} else if ( asset.type === AssetType.ROAD_STYLE ) {

			const instance = this.assetService.getInstance<RoadStyle>( this.asset.guid );

			return this.previewService.getRoadStyleObject( instance );

		}

	}

}
