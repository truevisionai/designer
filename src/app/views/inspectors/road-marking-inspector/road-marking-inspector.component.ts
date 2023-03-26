/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetFactory } from 'app/core/factories/asset-factory.service';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/models/metadata.model';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { TvMarkingService, TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { AssetDatabase } from 'app/services/asset-database';
import { CommandHistory } from 'app/services/command-history';
import { Texture } from 'three';

@Component( {
	selector: 'app-road-marking-inspector',
	templateUrl: './road-marking-inspector.component.html',
	styleUrls: [ './road-marking-inspector.component.css' ]
} )
export class RoadMarkingInspector implements OnInit, IComponent, OnDestroy {

	data: {
		roadMarking: TvRoadMarking,
		guid: string
	};

	metadata: Metadata;

	texture: Texture;

	constructor () {
	}

	// get thumbnail () { return this.metadata.preview; }

	get thumbnail () {
		return this.texture && this.texture.image ? this.texture.image.currentSrc : '';
	}

	ngOnInit () {

		TvMarkingService.currentMarking = this.data.roadMarking;

		this.metadata = AssetDatabase.getMetadata( this.data.guid );

		this.texture = AssetDatabase.getInstance( this.data.roadMarking.textureGuid );

	}

	ngOnDestroy (): void {

		this.updateAssetFile();

	}

	updateAssetFile () {

		if ( !this.metadata ) return;

		AssetFactory.updateRoadMarking( this.metadata.path, this.data.roadMarking );

	}


	onTextureChanged ( $guid: string ) {

		CommandHistory.execute( new SetValueCommand( this.data.roadMarking, 'textureGuid', $guid ) );

	}
}
