/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MetaImporter } from 'app/core/models/metadata.model';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { SnackBar } from 'app/services/snack-bar.service';
import { Texture } from 'three';

@Component( {
	selector: 'app-texture-field',
	templateUrl: './texture-field.component.html',
	styleUrls: [ './texture-field.component.css' ]
} )
export class TextureFieldComponent implements OnInit {

	@Output() changed = new EventEmitter<string>();

	@Input() guid: string;

	@Input() label: string = 'Map';

	constructor () { }

	get instance () {
		return this.guid ? AssetDatabase.getInstance<Texture>( this.guid ) : null;
	}

	get image () {
		return this.instance ? this.instance.image : null;
	}

	get thumbnail () {
		return this.image ? this.image.currentSrc : '';
	}

	get filename () {
		return AssetDatabase.getAssetNameByGuid( this.guid );
	}

	get metadata () {
		return AssetDatabase.getMetadata( this.guid );
	}

	ngOnInit () { }

	onRemoveClicked () {

		this.guid = null;

		this.changed.emit( null );

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

		if ( !guid ) return;

		const metadata = AssetDatabase.getMetadata( guid );

		if ( !metadata ) {

			SnackBar.warn( 'Metadata not found' );

			return;
		}

		if ( metadata.importer === MetaImporter.TEXTURE ) {

			this.guid = guid;

			this.changed.emit( guid );

		} else {

			SnackBar.warn( 'Not a texture' );

		}
	}
}
