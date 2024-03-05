import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { Object3DMap } from 'app/core/models/object3d-map';
import { MapEvents } from 'app/events/map-events';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { ElevationControlPoint } from 'app/map/road-elevation/tv-elevation.object';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { IViewportController } from 'app/objects/i-viewport-controller';
import { TvOrbitControls } from 'app/objects/tv-orbit-controls';
import { RoadElevationToolService } from 'app/tools/road-elevation/road-elevation-tool.service';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Scene, PerspectiveCamera, Object3D, Mesh, Group } from 'three';

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

	public camera: PerspectiveCamera;

	public controls: IViewportController;

	constructor ( private previewService: AssetPreviewService, private roadElevation: RoadElevationToolService ) {
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

		this.previewService.setupGraphScene( this.scene );

		this.camera = new PerspectiveCamera( 75, 200 / 100, 0.5, 1000 );

		this.camera.position.set( 0, 0, 10 );

		this.camera.up.copy( AppConfig.DEFAULT_UP );

		this.camera.updateProjectionMatrix();

		this.scene.add( this.nodes );

		MapEvents.objectSelected.subscribe( obj => {

			if ( obj instanceof TvRoad ) this.onRoadSelected( obj );

		} );
	}

	onRoadSelected ( road: TvRoad ) {

		this.nodes.clear();

		road.getElevationProfile().getElevations().forEach( elevation => {

			this.nodes.add( this.createElevationPoint( road, elevation ) );

		} );

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

}
