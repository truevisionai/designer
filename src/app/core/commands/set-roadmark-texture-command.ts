/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { AssetDatabase } from 'app/services/asset-database';
import { PreviewService } from 'app/views/inspectors/object-preview/object-preview.service';
import { MeshBasicMaterial, Texture } from 'three';
import { Metadata } from '../models/metadata.model';
import { BaseCommand } from './base-command';

export class SetRoadmarkTextureCommand extends BaseCommand {

	private oldGuid: string;

	constructor (
		private previewService: PreviewService,
		private metadata: Metadata,
		private roadmark: TvRoadMarking,
		private newTextureGuid: string
	) {

		super();

		this.oldGuid = this.roadmark.textureGuid;

	}

	execute (): void {

		this.changeGuid( this.newTextureGuid );

	}

	undo (): void {

		this.changeGuid( this.oldGuid );

	}

	redo (): void {

		this.execute();

	}

	changeGuid ( $guid ) {

		this.roadmark.textureGuid = $guid;

		if ( $guid ) {

			const texture = AssetDatabase.getInstance<Texture>( $guid );

			( this.roadmark.mesh.material as MeshBasicMaterial ).map = texture;
			( this.roadmark.mesh.material as MeshBasicMaterial ).needsUpdate = true;

		} else {

			( this.roadmark.mesh.material as MeshBasicMaterial ).map = null;
			( this.roadmark.mesh.material as MeshBasicMaterial ).needsUpdate = true;

		}

		this.metadata.preview = this.previewService.getRoadMarkingPreview( this.roadmark );

	}

}
