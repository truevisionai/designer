/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { TvMaterial } from 'app/graphics/material/tv-material';
import { AssetPreviewService } from '../../inspectors/asset-preview/asset-preview.service';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';

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

	constructor ( private previewService: AssetPreviewService ) {
		super();
	}

	public get preview () {
		return this.metadata ? this.metadata.preview : null;
	}

	public get metadata () {
		return AssetDatabase.getMetadata( this.guid || this.value );
	}

	public get material () {
		return AssetDatabase.getInstance<TvMaterial>( this.guid || this.value );
	}

	public get filename () {
		return AssetDatabase.getAssetNameByGuid( this.guid || this.value );
	}

	ngOnInit () {

		if ( this.metadata && !this.preview ) {
			this.metadata.preview = this.previewService.getMaterialPreview( this.material );
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

		// Debug.log( "dragover", $event )

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event ) {

		// Debug.log( "dragleave", $event )

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'drop', [ '$event' ] )
	onDrop ( $event: DragEvent ) {

		// Debug.log( "drop", $event )
		// Debug.log( "guid", $event.dataTransfer.getData( "guid" ) );

		$event.preventDefault();
		$event.stopPropagation();

		const guid = $event.dataTransfer.getData( 'guid' );

		if ( guid ) {

			const metadata = AssetDatabase.getMetadata( guid );

			if ( metadata && metadata.importer === MetaImporter.MATERIAL ) {

				this.changed.emit( guid );

				// update preview
				// metadata.preview = this.previewService.getMaterialPreview( AssetDatabase.getInstance( guid ) );
			}
		}
	}

}
