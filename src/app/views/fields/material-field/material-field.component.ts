/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetaImporter } from 'app/core/asset/metadata.model';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { PreviewService } from '../../inspectors/object-preview/object-preview.service';

@Component( {
	selector: 'app-material-field',
	templateUrl: './material-field.component.html',
	styleUrls: [ './material-field.component.css' ]
} )
export class MaterialFieldComponent implements OnInit {

	@Output() changed = new EventEmitter<string>();

	@Input() guid: string;

	@Input() label: string;

	constructor ( private previewService: PreviewService ) {
	}

	public get preview () {
		return this.metadata ? this.metadata.preview : null;
	}

	public get metadata () {
		return AssetDatabase.getMetadata( this.guid );
	}

	public get material () {
		return AssetDatabase.getInstance<TvMaterial>( this.guid );
	}

	public get filename () {
		return AssetDatabase.getAssetNameByGuid( this.guid );
	}

	ngOnInit () {

		if ( this.metadata && !this.preview ) this.metadata.preview = this.previewService.getMaterialPreview( this.material );

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

		// console.log( "dragover", $event )

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( $event ) {

		// console.log( "dragleave", $event )

		$event.preventDefault();
		$event.stopPropagation();

	}

	@HostListener( 'drop', [ '$event' ] )
	onDrop ( $event: DragEvent ) {

		// console.log( "drop", $event )
		// console.log( "guid", $event.dataTransfer.getData( "guid" ) );

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
