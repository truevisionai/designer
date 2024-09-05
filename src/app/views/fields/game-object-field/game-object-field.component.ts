/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { Asset, AssetType } from "../../../assets/asset.model";
import { AssetService } from "../../../assets/asset.service";
import { SnackBar } from "../../../services/snack-bar.service";

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

	private asset: Asset;

	constructor (
		private previewService: AssetPreviewService,
		private assetService: AssetService,
		private snackBar: SnackBar,
	) {
	}

	get preview () {
		return this.asset?.preview;
	}

	ngOnInit () {

		this.asset = this.assetService.getAsset( this.value );

		if ( !this.asset ) return;

		if ( this.preview ) return;

		if ( this.asset.type === AssetType.MODEL ) {

			const object = this.assetService.getModelAsset( this.asset.guid );

			this.asset.preview = this.previewService.getModelPreview( object );

		} else if ( this.asset.type === AssetType.OBJECT ) {

			const object = this.assetService.getObjectAsset( this.asset.guid );

			this.asset.preview = this.previewService.getModelPreview( object.instance );

		}


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

		if ( !guid ) {
			this.snackBar.warn( 'Invalid guid' );
			return;
		}

		const asset = this.assetService.getAsset( guid );

		if ( !asset ) {
			this.snackBar.warn( 'Invalid assets. Asset not found' );
			return;
		}

		if ( asset.type === AssetType.OBJECT || asset.type === AssetType.MODEL ) {

			this.changed.emit( guid );

		} else {

			this.snackBar.warn( 'Invalid assets type' );

		}
	}
}
