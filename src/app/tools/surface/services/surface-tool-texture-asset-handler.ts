/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Asset, AssetType } from "app/assets/asset.model";
import { AssetService } from "app/assets/asset.service";
import { Commands } from "app/commands/commands";
import { PointerEventData } from "app/events/pointer-event-data";
import { SurfaceFactory } from "app/map/surface/surface.factory";
import { Surface } from "app/map/surface/surface.model";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Vector3 } from "three";
import { SelectionService } from "../../selection.service";
import { Injectable } from "@angular/core";
import { DropAnywhereAssetHandler } from "app/core/asset-handlers/base-asset-handler";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolTextureAssetHandler extends DropAnywhereAssetHandler {

	constructor (
		private selectionService: SelectionService,
		private assetService: AssetService,
		private surfaceFactory: SurfaceFactory
	) {
		super();
	}

	isAssetSupported ( asset: Asset ): boolean {

		return asset.type === AssetType.TEXTURE;

	}

	onAssetDropped ( asset: Asset, event: PointerEventData ): void {

		const texture = this.assetService.getTexture( asset.guid ).texture;

		const surfaceWidth = texture.image.width;

		const surfaceHeight = texture.image.height;

		const surface = this.surfaceFactory.createSurface();

		surface.textureGuid = asset.guid;

		surface.spline.addControlPoint( this.createControlPoint( surface, event.point ) );
		surface.spline.addControlPoint( this.createControlPoint( surface, event.point ) );
		surface.spline.addControlPoint( this.createControlPoint( surface, event.point ) );
		surface.spline.addControlPoint( this.createControlPoint( surface, event.point ) );

		surface.setDimensions( surfaceWidth, surfaceHeight );

		const oldObjects = this.selectionService.getObjectLike( surface );

		Commands.AddSelect( surface, oldObjects );

	}

	private createControlPoint ( surface: Surface, position: Vector3 ): AbstractControlPoint {

		return SurfaceFactory.createSurfacePoint( position, surface );

	}

}
