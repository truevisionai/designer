/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvViewHelper } from "../../../objects/tv-view-helper";
import { SnackBar } from "../../../services/snack-bar.service";
import { WebGLRenderer } from "three";
import { CameraService } from "../../../renderer/camera.service";
import { CanvasService } from '../../../renderer/canvas.service';

@Injectable( {
	providedIn: 'root'
} )
export class ViewHelperService {

	private viewHelper: TvViewHelper;

	private viewHelperCanavs: HTMLCanvasElement;

	constructor (
		private cameraService: CameraService,
		private canvasService: CanvasService,
		private snackBar: SnackBar
	) {
	}

	init ( viewHelperCanvas: HTMLCanvasElement ) {

		this.viewHelperCanavs = viewHelperCanvas;

		this.viewHelper?.dispose();

		delete this.viewHelper;

		try {

			this.viewHelper = new TvViewHelper( this.cameraService.camera as any, this.viewHelperCanavs );

			const container = this.viewHelper.domElement.parentElement;

			const box = container.getBoundingClientRect();

			const height = 128;

			const left = box.left;
			const top = box.top + box.height - height;

			this.viewHelperCanavs.style.left = `${ left }px`;
			this.viewHelperCanavs.style.top = `${ top }px`;

		} catch ( error ) {

			this.snackBar.error( 'Error in creating in ViewHelper' );
			this.snackBar.error( error );

		}
	}

	update ( delta: number ) {

		if ( !this.viewHelper ) return;

		if ( !this.viewHelper.animating ) return;

		this.viewHelper.update( delta );

	}

	render ( renderer: WebGLRenderer ) {

		if ( !this.viewHelper ) return;

		if ( !this.viewHelper.animating ) return;

		this.viewHelper.render( renderer );

	}

	handleClick ( $event: PointerEvent ) {

		this.viewHelper?.handleClick( $event );

	}
}
