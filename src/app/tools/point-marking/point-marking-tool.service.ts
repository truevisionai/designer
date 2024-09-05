/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
import { Vector3 } from 'three';
import { Asset, AssetType } from 'app/assets/asset.model';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { AssetManager } from 'app/assets/asset.manager';
import { TvOrientation } from 'app/map/models/tv-common';
import { TvConsole } from 'app/core/utils/console';
import { PointMarkingToolDebugger } from "./point-marking-tool.debugger";
import { AssetService } from "../../assets/asset.service";
import { TvTextureService } from "../../assets/texture/tv-texture.service";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolService {

	constructor (
		public base: BaseToolService,
		public roadService: RoadService,
		public roadObjectService: RoadObjectService,
		public assetManager: AssetManager,
		public assetService: AssetService,
		public textureService: TvTextureService,
		public toolDebugger: PointMarkingToolDebugger,
	) {
	}

	getSelectedAsset (): Asset {

		return this.assetManager.getTextureAsset() || this.assetManager.getMaterialAsset();

	}

	createPointMarking ( asset: Asset, position: Vector3 ): TvRoadObject {

		const lane = this.roadService.findLaneAtPosition( position );

		if ( !lane ) {
			TvConsole.error( 'Could not find lane at position' );
			return;
		}

		const roodCoord = this.roadService.findRoadCoordAtPosition( position );

		if ( !roodCoord ) {
			TvConsole.error( 'Could not find road coord at position' );
			return;
		}

		const posTheta = roodCoord.road.getLaneCenterPosition( lane, roodCoord.s );

		if ( !posTheta ) {
			TvConsole.error( 'Could not find lane coord at position' );
			return;
		}

		const roadObject = this.roadObjectService.createRoadObject(
			lane.laneSection.road,
			TvRoadObjectType.roadMark,
			posTheta.s,
			posTheta.t
		);

		if ( asset.type == AssetType.MATERIAL ) {

			roadObject.width = roadObject.height = roadObject.length = 1;

		} else if ( asset.type == AssetType.TEXTURE ) {

			const textureAsset = this.textureService.getTexture( asset.guid );

			// maintain aspect ratio
			const width = textureAsset.texture.image.width || 1;
			const height = textureAsset.texture.image.height || 1;

			const aspectRatio = width / height;

			roadObject.width = 1;
			roadObject.height = 0;
			roadObject.length = 1 / aspectRatio;

		}

		roadObject.assetGuid = asset.guid;

		roadObject.zOffset = 0.005;

		roadObject.orientation = roodCoord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;

		return roadObject;
	}
}
