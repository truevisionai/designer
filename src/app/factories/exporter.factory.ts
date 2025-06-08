/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Asset, AssetType } from "../assets/asset.model";
import { AssetExporter } from "../core/interfaces/asset-exporter";
import { SceneExporter } from "../map/scene/scene.exporter";
import { TvMap } from 'app/map/models/tv-map.model';
import { OpenDriveExporter } from 'app/map/services/open-drive-exporter';
import { TvConsole } from 'app/core/utils/console';
import { TvMaterialExporter } from "../assets/material/tv-material.exporter";
import { TvObjectExporter } from "../assets/object/tv-object.exporter";
import { TvGeometryExporter } from "../assets/geometry/tv-geometry.exporter";
import { RoadExporterService } from "../assets/road-style/road-style.exporter";
import { TvMeshExporter } from "../assets/mesh/tv-mesh.exporter";

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
		private openDriveExporter: OpenDriveExporter,
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
				TvConsole.error( 'Unknown assets type:' + Asset.getTypeAsString( type ) );
				return;
		}

	}

	getMapExporter ( major: number, minor: number ): AssetExporter<TvMap> {

		return new OpenDriveExporter();

	}
}
