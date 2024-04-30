/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { AssetPreviewService } from '../asset-preview/asset-preview.service';
import { Asset } from 'app/core/asset/asset.model';
import { TvTexture } from "../../../graphics/texture/tv-texture.model";
import { TvTextureService } from "../../../graphics/texture/tv-texture.service";

@Component( {
	selector: 'app-texture-inspector',
	templateUrl: './texture-inspector.component.html',
	styleUrls: [ './texture-inspector.component.css' ]
} )
export class TextureInspector implements OnInit, IComponent, OnDestroy {

	public data: Asset;

	public preview: string;

	public texture: TvTexture;

	constructor (
		private previewService: AssetPreviewService,
		private textureService: TvTextureService,
	) {
	}

	ngOnInit () {

		this.texture = this.textureService.getTexture( this.data.guid )?.texture;

		if ( !this.texture ) return;

		this.preview = this.previewService.getTexturePreview( this.texture );

	}

	ngOnDestroy () {

		this.save();

	}

	save () {

		if ( !this.data ) return;

		this.textureService.update( this.data );

	}

	onChange ( $newValue: any, property: keyof TvTexture ) {

		if ( !this.texture ) return;

		CommandHistory.execute( new SetValueCommand( this.texture, property, $newValue ) );

		this.texture.needsUpdate = true;

		this.save();

	}

}
