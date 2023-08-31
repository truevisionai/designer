import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MetaImporter } from 'app/core/models/metadata.model';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { AssetDatabase } from 'app/services/asset-database';
import { PreviewService } from 'app/views/inspectors/object-preview/object-preview.service';
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

	constructor ( private previewService: PreviewService ) { }

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

		console.log( this );

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
