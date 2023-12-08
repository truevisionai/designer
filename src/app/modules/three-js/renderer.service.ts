import { Injectable } from '@angular/core';
import { WebGLRenderer } from "three";
import { SceneService } from "../../services/scene.service";
import { CanvasService } from "./canvas.service";

@Injectable( {
	providedIn: 'root'
} )
export class RendererService {

	public renderer: WebGLRenderer;

	constructor (
		private canvasService: CanvasService,
	) {
	}

	init ( canvas: HTMLCanvasElement ) {

		this.renderer = new WebGLRenderer( {
			alpha: false,
			antialias: true,
			precision: 'highp',
			stencil: false
		} );

		this.renderer.setPixelRatio( window.devicePixelRatio );

		this.renderer.setClearColor( 0xffffff, 1 );

		this.renderer.autoClear = false;

		SceneService.renderer = this.renderer;

		this.renderer.setViewport( -this.canvasService.left, -this.canvasService.top, this.canvasService.width, this.canvasService.height );

		this.renderer.setSize( this.canvasService.width, this.canvasService.height );

		canvas.appendChild( this.renderer.domElement );

	}

	onCanvasResized () {

		this.renderer.setViewport( -this.canvasService.left, -this.canvasService.top, this.canvasService.width, this.canvasService.height );

		this.renderer.setSize( this.canvasService.width, this.canvasService.height );

	}
}
