/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset, AssetType } from "../core/asset/asset.model";
import { TvMaterialExporter } from "../graphics/material/tv-material.exporter";
import { AssetExporter } from "../core/interfaces/asset-exporter";
import { TvGeometryExporter } from "../graphics/geometry/tv-geometry.exporter";
import { RoadExporterService } from "../graphics/road-style/road-style.exporter";
import { TvMeshExporter } from "../graphics/mesh/tv-mesh.exporter";
import { TvObjectExporter } from "../graphics/object/tv-object.exporter";
import { SceneExporter } from "../map/scene/scene.exporter";
import { TvMap } from 'app/map/models/tv-map.model';
import { OpenDriveExporter } from 'app/map/services/open-drive-exporter';
import { TvConsole } from 'app/core/utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class ExporterFactory {

	constructor (
		private materialExporter: TvMaterialExporter,
		private objectExporter: TvObjectExporter,
		private geometryExporter: TvGeometryExporter,
		private roadStyleExporter: RoadExporterService,
		private meshExporter: TvMeshExporter,
		private sceneExporter: SceneExporter,
	) {
	}

	getExporter ( type: AssetType ): AssetExporter<any> | null {

		switch ( type ) {

			case AssetType.MATERIAL:
				return this.materialExporter;

			case AssetType.GEOMETRY:
				return this.geometryExporter;

			case AssetType.OBJECT:
				return this.objectExporter;

			case AssetType.PREFAB:
				return this.objectExporter;

			case AssetType.ROAD_STYLE:
				return this.roadStyleExporter;

			case AssetType.MESH:
				return this.meshExporter;

			case AssetType.SCENE:
				return this.sceneExporter;

			default:
				TvConsole.error( 'Unknown asset type:' + Asset.getTypeAsString( type ) );
				return;
		}

	}

	getMapExporter ( major: number, minor: number ): AssetExporter<TvMap> {

		return new OpenDriveExporter();

	}
}
