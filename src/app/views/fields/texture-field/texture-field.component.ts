/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter, Metadata } from 'app/core/asset/metadata.model';
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

	instance: Texture;

	image: any;

	thumbnail: string;

	filename: string;

	metadata: Metadata;

	constructor () { }

	ngOnInit () {

		this.instance = this.guid ? AssetDatabase.getInstance<Texture>( this.guid ) : null;

		this.image = this.instance ? this.instance.image : null;

		this.thumbnail = this.image ? this.image.currentSrc : '';

		this.filename = this.guid ? AssetDatabase.getAssetNameByGuid( this.guid ) : '';

		this.metadata = this.guid ? AssetDatabase.getMetadata( this.guid ) : null;

	}

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
