/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetPreviewService } from '../../inspectors/asset-preview/asset-preview.service';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';
import { AssetService } from "../../../core/asset/asset.service";
import { TvMaterialService } from "../../../graphics/material/tv-material.service";
import { MaterialAsset } from "../../../graphics/material/tv-material.asset";
import { Asset, AssetType } from "../../../core/asset/asset.model";
import { SnackBar } from "../../../services/snack-bar.service";
import { TvConsole } from 'app/core/utils/console';

@Component( {
	selector: 'app-material-field',
	templateUrl: './material-field.component.html',
	styleUrls: [ './material-field.component.css' ]
} )
export class MaterialFieldComponent extends AbstractFieldComponent implements OnInit {

	// we will either receieve a guid or a value
	// value is also a guid
	@Input() value: string;

	@Input() guid: string;

	@Output() changed = new EventEmitter<string>();

	@Input() label: string;

	preview: string;

	materialAsset: MaterialAsset;

	asset: Asset;

	constructor (
		private previewService: AssetPreviewService,
		private assetService: AssetService,
		private materialService: TvMaterialService,
		private snackBar: SnackBar
	) {
		super();
	}

	public get metadata () {
		return this.assetService.getMetadata( this.guid || this.value );
	}

	public get filename () {
		return this.assetService.getAssetName( this.guid || this.value );
	}

	ngOnInit () {

		if ( !this.guid && !this.value ) {
			return;
		}

		this.asset = this.assetService.getAsset( this.guid || this.value );

		if ( !this.asset ) {
			TvConsole.warn( `Asset with guid: ${this.guid} not found` );
			return;
		}

		this.materialAsset = this.materialService.getMaterial( this.guid || this.value );

		this.preview = this.previewService.getPreview( this.asset );

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

		// DONT REMOVE THIS

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event ) {

		// DONT REMOVE THIS

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
			this.snackBar.warn( 'Invalid asset. Asset not found' );
			return;
		}

		if ( asset.type != AssetType.MATERIAL ) {
			this.snackBar.warn( 'Invalid asset. Not a material' );
			return;
		}

		this.changed.emit( guid );
	}

}
