/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { AssetDatabase } from 'app/services/asset-database';
import { PreviewService } from 'app/views/inspectors/object-preview/object-preview.service';
import { Texture } from 'three';
import { Metadata } from '../models/metadata.model';
import { BaseCommand } from './base-command';

export class UpdateMaterialMapCommand extends BaseCommand {

	private oldGuid: string;

	constructor (
		private previewService: PreviewService,
		private material: TvMaterial,
		private metadata: Metadata,
		private mapName: 'map' | 'roughnessMap' | 'normalMap',
		private newGuid: string,
		oldGuid?: string
	) {

		super();

		this.oldGuid = oldGuid || this.material[ `${ mapName }Guid` ];

	}

	execute (): void {

		this.changeGuid( this.newGuid );

	}

	undo (): void {

		this.changeGuid( this.oldGuid );

	}

	redo (): void {

		this.execute();

	}

	changeGuid ( guid: string ) {

		const texture = guid ? AssetDatabase.getInstance<Texture>( guid ) : null;

		if ( this.mapName === 'map' ) {

			this.material.mapGuid = guid;
			this.material.map = texture || null;

			// if ( this.material.map ) this.material.map.needsUpdate = true;

		} else if ( this.mapName === 'roughnessMap' ) {

			this.material.roughnessMapGuid = guid;
			this.material.roughnessMap = texture || null;

			// if ( this.material.roughnessMap ) this.material.roughnessMap.needsUpdate = true;

		} else if ( this.mapName === 'normalMap' ) {

			this.material.normalMapGuid = guid;
			this.material.normalMap = texture || null;

			// if ( this.material.normalMap ) this.material.normalMap.needsUpdate = true;

		}

		this.material.needsUpdate = true;

		this.metadata.preview = this.previewService.getMaterialPreview( this.material );
	}

}
