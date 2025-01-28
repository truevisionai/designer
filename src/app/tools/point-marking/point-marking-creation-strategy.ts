/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ValidationFailed, ValidationPassed, ValidationResult } from "../../core/interfaces/creation-strategy";
import { SelectionService } from "../selection.service";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadObjectFactory } from "app/services/road-object/road-object.factory";
import { TvRoadObject, TvRoadObjectType } from "app/map/models/objects/tv-road-object";
import { Injectable } from "@angular/core";
import { AssetManager } from "app/assets/asset.manager";
import { Asset, AssetType } from "app/assets/asset.model";
import { TvTextureService } from "app/assets/texture/tv-texture.service";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvOrientation } from "app/map/models/tv-common";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { Vector2, Vector3 } from "three";
import { Commands } from "app/commands/commands";
import { TvMapQueries } from "app/map/queries/tv-map-queries";
import { AssetHandler } from "app/core/interfaces/asset-handler";
import { Log } from "app/core/utils/log";
import { BaseCreationStrategy } from "app/core/interfaces/base-creation-strategy";
import { RoadObjectViewModel } from "./road-object-view.model";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingCreationStrategy extends BaseCreationStrategy<RoadObjectViewModel> implements AssetHandler {

	constructor (
		private selectionService: SelectionService,
		private assetManager: AssetManager,
		private textureService: TvTextureService,
		private roadObjectService: RoadObjectService,
	) {
		super();
	}

	onAssetDragOver ( asset: Asset, event: PointerEventData ): void {


	}

	onAssetDropped ( asset: Asset, event: PointerEventData ): void {

		this.importAsset( asset, event.point );

	}

	isLocationValid ( asset: Asset, event: PointerEventData ): boolean {

		const coord = TvMapQueries.findRoadCoord( event.point );

		if ( !coord ) return false;

		return true;

	}

	importAsset ( asset: Asset, position: Vector3 ): void {

		const created = this.createFromAsset( asset, position );

		const oldObjects = this.selectionService.getObjectLike( created );

		Commands.AddSelect( created, oldObjects );

	}

	isAssetSupported ( asset: Asset ): boolean {

		return asset.type == AssetType.MATERIAL || asset.type == AssetType.TEXTURE;

	}

	validate ( event: PointerEventData ): ValidationResult {

		const asset = this.assetManager.getTextureAsset() || this.assetManager.getMaterialAsset();

		if ( !asset ) {
			return new ValidationFailed( 'Select a texture or material asset from the project browser' );
		}

		const hasRoad = this.selectionService.executeSelection( event ) instanceof TvRoad;

		if ( !hasRoad ) {
			return new ValidationFailed( 'Select a road to add point marking' );
		}

		return new ValidationPassed();
	}

	createObject ( event: PointerEventData ): RoadObjectViewModel {

		const asset = this.assetManager.getTextureAsset() || this.assetManager.getMaterialAsset();

		return this.createFromAsset( asset, event.point );

	}

	createFromAsset ( asset: Asset, position: Vector3 ): RoadObjectViewModel {

		const coord = TvMapQueries.findRoadCoord( position );

		if ( !coord ) return;

		const roadObject = this.createRoadObjectFromAsset( asset, coord );

		const point = new RoadObjectViewModel( roadObject );

		return point;

	}

	private createRoadObjectFromAsset ( asset: Asset, coord: TvRoadCoord ): TvRoadObject {

		const id = this.roadObjectService.getRoadObjectId( coord.road );

		const roadObject = RoadObjectFactory.createRoadObjectWithId( id, TvRoadObjectType.roadMark, coord );

		const dimensions = this.getDimensions( asset );

		roadObject.width = dimensions.x;

		roadObject.length = dimensions.y;

		roadObject.height = 0.01;

		roadObject.assetGuid = asset.guid;

		roadObject.zOffset = 0.005;

		roadObject.orientation = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;

		return roadObject;
	}

	private getDimensions ( asset: Asset ): Vector2 {

		if ( asset.type == AssetType.MATERIAL ) {

			return new Vector2( 1, 1 );

		} else if ( asset.type == AssetType.TEXTURE ) {

			return this.getDimensionsFromTexture( asset );

		}

	}

	private getDimensionsFromTexture ( asset: Asset ): Vector2 {

		try {

			const textureAsset = this.textureService.getTexture( asset.guid );

			// maintain aspect ratio
			const width = textureAsset.texture.image.width || 1;
			const height = textureAsset.texture.image.height || 1;

			const aspectRatio = width / height;

			return new Vector2( 1, 1 / aspectRatio );

		} catch ( error ) {

			Log.error( 'Error getting texture dimensions', error );

			return new Vector2( 1, 1 );

		}
	}
}
