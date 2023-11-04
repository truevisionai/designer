/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { MetadataFactory } from 'app/factories/metadata-factory.service';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/asset/metadata.model';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { Texture } from 'three';
import { PreviewService } from '../object-preview/object-preview.service';
import { AssetFactory } from 'app/core/asset/asset-factory.service';

@Component( {
	selector: 'app-texture-inspector',
	templateUrl: './texture-inspector.component.html',
	styleUrls: [ './texture-inspector.component.css' ]
} )
export class TextureInspector implements OnInit, IComponent, OnDestroy {

	// @Input() texture: Texture;

	public data: {
		texture: Texture,
		guid: string
	};

	public metadata: Metadata;

	public preview: string;

	constructor ( private previewService: PreviewService ) {
	}

	get texture (): Texture {
		return this.data.texture;
	}

	ngOnInit () {

		this.metadata = AssetDatabase.getMetadata( this.data.guid );

		this.preview = this.previewService.getTexturePreview( this.texture );

		// console.log( this.previewService.getTexturePreview( this.texture ) );
		// console.log( this.data );
		// console.log( this.texture.image );
		// console.log( this.texture.source.data );
		// console.log( this.texture );
		// console.log( this.texture.image );

	}

	ngOnDestroy () {

		this.save();

	}

	save () {

		if ( !this.texture ) return;

		this.preview = this.previewService.getTexturePreview( this.texture );

		AssetFactory.updateTexture( this.metadata.guid, this.texture );

	}

	onChange ( $newValue: any, property: keyof Texture ) {

		if ( !this.texture ) return;

		CommandHistory.execute( new SetValueCommand( this.texture, property, $newValue ) );

		this.texture.needsUpdate = true;

		this.save();

	}


}
