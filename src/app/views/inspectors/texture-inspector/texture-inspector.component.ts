/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { IComponent } from 'app/objects/game-object';
import { Metadata } from 'app/core/asset/metadata.model';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { Texture } from 'three';
import { AssetPreviewService } from '../asset-preview/asset-preview.service';
import { AssetService } from 'app/core/asset/asset.service';
import { AssetType } from 'app/views/editor/project-browser/file-node.model';
import { TvTextureExporter } from 'app/graphics/texture/tv-texture.exporter';

@Component( {
	selector: 'app-texture-inspector',
	templateUrl: './texture-inspector.component.html',
	styleUrls: [ './texture-inspector.component.css' ]
} )
export class TextureInspector implements OnInit, IComponent, OnDestroy {

	public data: {
		texture: Texture,
		guid: string
	};

	public metadata: Metadata;

	public preview: string;

	constructor (
		private previewService: AssetPreviewService,
		private assetService: AssetService,
		private textureExporter: TvTextureExporter,
	) {
	}

	get texture (): Texture {
		return this.data.texture;
	}

	ngOnInit () {

		this.metadata = AssetDatabase.getMetadata( this.data.guid );

		this.preview = this.previewService.getTexturePreview( this.texture );

	}

	ngOnDestroy () {

		this.save();

	}

	save () {

		if ( !this.texture ) return;

		if ( !this.metadata ) return;

		this.preview = this.previewService.getTexturePreview( this.texture );

		const metadata = this.textureExporter.createMetadata( this.metadata.guid, this.metadata.path, this.texture );

		AssetDatabase.setMetadata( this.metadata.guid, metadata );

		this.assetService.saveAssetByGuid( AssetType.TEXTURE, this.metadata.guid, this.texture );

	}

	onChange ( $newValue: any, property: keyof Texture ) {

		if ( !this.texture ) return;

		CommandHistory.execute( new SetValueCommand( this.texture, property, $newValue ) );

		this.texture.needsUpdate = true;

		this.save();

	}


}
