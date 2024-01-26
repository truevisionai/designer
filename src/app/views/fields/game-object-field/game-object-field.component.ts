/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Object3D } from 'three';

@Component( {
	selector: 'app-game-object-field',
	templateUrl: './game-object-field.component.html',
	styleUrls: [ './game-object-field.component.scss' ]
} )
export class GameObjectFieldComponent implements OnInit {

	@Output() changed = new EventEmitter<string>();

	/**
	 * @type {string} guid of the game object
	 */
	@Input() value: string;

	@Input() label: string;

	constructor ( private previewService: AssetPreviewService ) {
	}

	public get preview () {
		return this.metadata ? this.metadata.preview : null;
	}

	public get metadata () {
		return AssetDatabase.getMetadata( this.value );
	}

	public get object () {
		return AssetDatabase.getInstance<Object3D>( this.value );
	}

	public get filename () {
		return AssetDatabase.getAssetNameByGuid( this.value );
	}

	ngOnInit () {

		if ( this.metadata && !this.preview ) this.metadata.preview = this.previewService.getModelPreview( this.object );

	}

	@HostListener( 'click', [ '$event' ] )
	onClick ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dblclick', [ '$event' ] )
	onDoubleClick ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragover', [ '$event' ] )
	onDragOver ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'drop', [ '$event' ] )
	onDrop ( $event: DragEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		const guid = $event.dataTransfer.getData( 'guid' );

		if ( guid ) {

			const metadata = AssetDatabase.getMetadata( guid );

			if ( metadata && metadata.importer === MetaImporter.MODEL ) {

				this.changed.emit( guid );

			}
		}
	}
}
