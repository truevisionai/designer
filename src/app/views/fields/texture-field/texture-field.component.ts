/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter, Metadata } from 'app/core/asset/metadata.model';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';
import { SnackBar } from 'app/services/snack-bar.service';
import { Texture } from 'three';

@Component( {
	selector: 'app-texture-field',
	templateUrl: './texture-field.component.html',
	styleUrls: [ './texture-field.component.css' ]
} )
export class TextureFieldComponent extends AbstractFieldComponent implements OnInit {

	@Output() changed = new EventEmitter<string>();

	@Input() value: string;
	@Input() guid: string;

	@Input() label: string = 'Map';

	instance: Texture;

	image: any;

	thumbnail: string;

	filename: string;

	metadata: Metadata;

	constructor ( private snackBar: SnackBar ) {

		super();

	}

	get id () {
		return this.guid || this.value;
	}

	ngOnInit () {

		this.instance = this.id ? AssetDatabase.getInstance<Texture>( this.id ) : null;

		this.image = this.instance ? this.instance.image : null;

		this.thumbnail = this.image ? this.image.currentSrc : '';

		this.filename = this.id ? AssetDatabase.getAssetNameByGuid( this.id ) : '';

		this.metadata = this.id ? AssetDatabase.getMetadata( this.id ) : null;

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

			this.snackBar.warn( 'Metadata not found' );

			return;
		}

		if ( metadata.importer === MetaImporter.TEXTURE ) {

			this.guid = guid;

			this.changed.emit( guid );

		} else {

			this.snackBar.warn( 'Not a texture' );

		}
	}
}
