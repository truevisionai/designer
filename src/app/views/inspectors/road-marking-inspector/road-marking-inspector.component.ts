/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { SetRoadmarkTextureCommand } from 'app/commands/set-roadmark-texture-command';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/asset/metadata.model';
import { TvRoadMarkingManager, TvRoadMarking } from 'app/modules/tv-map/services/marking-manager';
import { CommandHistory } from 'app/services/command-history';
import { PreviewService } from '../object-preview/object-preview.service';

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

	constructor ( private previewService: PreviewService ) {
	}

	get thumbnail () {
		return this.metadata?.preview;
	}

	ngOnInit () {

		TvRoadMarkingManager.currentMarking = this.data.roadMarking;

		this.metadata = AssetDatabase.getMetadata( this.data.guid );

	}

	ngOnDestroy (): void {

		this.updateAssetFile();

	}

	updateAssetFile () {

		if ( !this.metadata ) return;

	}


	onTextureChanged ( $guid: string ) {

		CommandHistory.execute( new SetRoadmarkTextureCommand( this.previewService, this.metadata, this.data.roadMarking, $guid ) );

	}
}
