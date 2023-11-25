import { Component, OnInit } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { IComponent } from 'app/core/game-object';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { PreviewService } from '../object-preview/object-preview.service';

@Component( {
	selector: 'app-asset-inspector',
	templateUrl: './asset-inspector.component.html',
	styleUrls: [ './asset-inspector.component.scss' ]
} )
/**
 * @deprecated
 */
export class AssetInspectorComponent implements IComponent, OnInit {

	instance: any;

	data: AssetNode;

	preview: string;

	constructor (
		private previewService: PreviewService
	) { }

	ngOnInit () {

		this.instance = AssetDatabase.getInstance( this.data.metadata.guid );

		// this.preview = this.previewService.getTexturePreview( this.texture );

		console.log( this.instance );

	}


	ngOnDestroy () {

		this.save();

	}

	save () {

		// if ( !this.texture ) return;

		// this.preview = this.previewService.getTexturePreview( this.instance );

		// AssetFactory.updateTexture( this.metadata.guid, this.texture );

	}

	onChange () {

		// if ( !this.texture ) return;

		// CommandHistory.execute( new SetValueCommand( this.texture, property, $newValue ) );

		// this.texture.needsUpdate = true;

		// this.save();

	}

}
