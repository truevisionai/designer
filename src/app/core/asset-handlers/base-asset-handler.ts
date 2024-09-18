/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AssetHandler } from "../interfaces/asset-handler";
import { Asset } from "app/assets/asset.model";
import { PointerEventData } from "app/events/pointer-event-data";

@Injectable( {
	providedIn: 'root'
} )
export abstract class BaseAssetHandler implements AssetHandler {

	abstract isAssetSupported ( asset: Asset ): boolean;

	abstract isLocationValid ( asset: Asset, event: PointerEventData ): boolean;

	abstract onAssetDropped ( asset: Asset, event: PointerEventData ): void;

	abstract onAssetDragOver ( asset: Asset, event: PointerEventData ): void;

}


@Injectable( {
	providedIn: 'root'
} )
export abstract class DropAnywhereAssetHandler implements AssetHandler {

	abstract isAssetSupported ( asset: Asset ): boolean;

	abstract onAssetDropped ( asset: Asset, event: PointerEventData ): void;

	isLocationValid ( asset: Asset, event: PointerEventData ): boolean {
		return true
	}

	onAssetDragOver ( asset: Asset, event: PointerEventData ): void {
		//
	}

}
