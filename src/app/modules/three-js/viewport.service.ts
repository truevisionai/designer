/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DragDropService } from 'app/core/services/drag-drop.service';
import { Vector3 } from 'three';
import { ViewportImporterService } from './viewport-importer.service';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportService {

	constructor (
		private dragDropService: DragDropService,
		private viewportImporter: ViewportImporterService,
	) {
	}

	onDragOver ( $event: DragEvent ) {

		// console.log( this.dragDropService.getData() );
		// console.log( $event.dataTransfer.getData( 'path' ), $event.dataTransfer.getData( 'guid' ) );

	}

	onDragLeave ( $event: DragEvent ) {

		// console.log( $event );

	}

	async onDrop ( $event: DragEvent, position: Vector3 ) {

		const data = this.dragDropService.getData();

		this.viewportImporter.import( data, position );

		this.dragDropService.clear();

	}

}
