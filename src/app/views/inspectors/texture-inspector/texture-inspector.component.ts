/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { Asset } from 'app/assets/asset.model';
import { Commands } from 'app/commands/commands';
import { TvTexture } from "../../../assets/texture/tv-texture.model";
import { TvTextureService } from "../../../assets/texture/tv-texture.service";

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
		private textureService: TvTextureService,
	) {
	}

	ngOnInit () {

		this.texture = this.textureService.getTexture( this.data.guid )?.texture;

		if ( !this.texture ) return;

		this.preview = this.texture?.image?.src;

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

		Commands.SetValue( this.texture, property, $newValue );

		this.texture.needsUpdate = true;

		this.save();

	}

}
