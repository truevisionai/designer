/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Metadata } from 'app/assets/metadata.model';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';
import { SnackBar } from 'app/services/snack-bar.service';
import { AssetService } from "../../../assets/asset.service";
import { AssetType } from "../../../assets/asset.model";
import { TvTextureService } from "../../../assets/texture/tv-texture.service";
import { TvTexture } from "../../../assets/texture/tv-texture.model";

@Component( {
	selector: 'app-texture-field',
	templateUrl: './texture-field.component.html',
	styleUrls: [ './texture-field.component.css' ]
} )
export class TextureFieldComponent extends AbstractFieldComponent<string> implements OnInit {

	@Input() value: string;

	@Input() guid: string;

	@Input() label: string = 'Map';

	texture: TvTexture;

	image: any;

	thumbnail: string;

	filename: string;

	metadata: Metadata;

	constructor (
		private snackBar: SnackBar,
		private textureService: TvTextureService,
		private assetService: AssetService
	) {

		super();

	}

	get id () {
		return this.guid || this.value;
	}

	ngOnInit (): void {

		this.texture = this.id ? this.textureService.getTexture( this.id )?.texture : null;

		this.image = this.texture ? this.texture.image : null;

		this.thumbnail = this.image ? this.image.currentSrc : '';

		this.filename = this.id ? this.assetService.getAssetName( this.id ) : '';

		this.metadata = this.id ? this.assetService.getMetadata( this.id ) : null;

	}

	onRemoveClicked (): void {

		this.guid = null;
		this.changed.emit( null );

	}

	@HostListener( 'click', [ '$event' ] )
	onClick ( $event: any ): void {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dblclick', [ '$event' ] )
	onDoubleClick ( $event: any ): void {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragover', [ '$event' ] )
	onDragOver ( $event: any ): void {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event: any ): void {

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'drop', [ '$event' ] )
	onDrop ( $event: DragEvent ): void {

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

		if ( asset.type !== AssetType.TEXTURE ) {
			this.snackBar.warn( 'Not a texture' );
			return;
		}

		this.guid = guid;

		this.changed.emit( guid );

	}
}
