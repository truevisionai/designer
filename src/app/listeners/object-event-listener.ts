/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AssetManager } from "app/assets/asset.manager";
import { AssetService } from "app/assets/asset.service";
import { MapEvents } from "app/events/map-events";
import { PropManager } from "app/managers/prop-manager";
import { ToolManager } from "app/managers/tool-manager";
import { Asset, AssetType } from "app/assets/asset.model";
import { AppInspector } from "../core/inspector";
import { DynamicInspectorComponent } from "../views/inspectors/dynamic-inspector/dynamic-inspector.component";
import { AssetInspectorComponent } from "../views/inspectors/asset-inspector/asset-inspector.component";
import { TvStandardMaterial } from "../assets/material/tv-standard-material";
import { RoadStyleManager } from "../assets/road-style/road-style.manager";
import { RoadStyle } from "../assets/road-style/road-style.model";
import { MaterialAsset } from "../assets/material/tv-material.asset";

@Injectable( {
	providedIn: 'root'
} )
export class ObjectEventListener {

	private debug: boolean = false; //!Environment.production;

	constructor (
		private assetService: AssetService,
		private assetManager: AssetManager,
		private roadStyleManager: RoadStyleManager,
	) {

	}

	init () {

		MapEvents.assetSelected.subscribe( e => this.onAssetSelected( e ) );
		MapEvents.assetDragged.subscribe( e => this.onAssetSelected( e ) );

		MapEvents.objectSelected.subscribe( e => this.onObjectSelected( e ) );
		MapEvents.objectUnselected.subscribe( e => this.onObjectUnselected( e ) );
		MapEvents.objectAdded.subscribe( e => this.onObjectAdded( e ) );
		MapEvents.objectUpdated.subscribe( e => this.onObjectUpdated( e ) );
		MapEvents.objectRemoved.subscribe( e => this.onObjectRemoved( e ) );

	}

	onAssetSelected ( asset: Asset ): void {

		const instance = this.assetService.getInstance( asset.guid );

		switch ( asset.type ) {

			case AssetType.ROAD_STYLE:
				this.roadStyleManager.setCurrentStyle( instance as RoadStyle );
				break;

			case AssetType.MODEL:
				PropManager.setProp( asset as any );
				this.assetManager.modelAsset = asset;
				break;

			case AssetType.OBJECT:
				PropManager.setProp( asset as any );
				this.assetManager.modelAsset = asset;
				break;

			case AssetType.TEXTURE:
				this.assetManager.setTextureAsset( asset );
				break;

			case AssetType.MATERIAL:
				this.assetManager.setMaterialAsset( asset );
				break;

		}

	}

	onObjectUpdated ( object: object ): void {

		if ( this.debug ) console.debug( 'onObjectUpdated', object );

		if ( object instanceof TvStandardMaterial ) {

			this.assetService.saveAssetByGuid( AssetType.MATERIAL, object.guid, object );

		} else {

			ToolManager.getTool()?.onObjectUpdated( object );

		}

		this.updateInspector();

		this.updateAsset( object );

	}

	onObjectRemoved ( object: object ): void {

		if ( this.debug ) console.debug( 'onObjectRemoved', object );

		ToolManager.getTool()?.onObjectRemoved( object );

	}

	onObjectAdded ( object: object ): void {

		if ( this.debug ) console.debug( 'onObjectAdded', object );

		ToolManager.getTool()?.onObjectAdded( object );

	}

	onObjectUnselected ( object: object ): void {

		if ( this.debug ) console.debug( 'onObjectUnselected', object );

		ToolManager.getTool()?.onObjectUnselected( object );

	}

	onObjectSelected ( object: object ): void {

		if ( this.debug ) console.debug( 'onObjectSelected', object );

		ToolManager.getTool()?.onObjectSelected( object );

	}

	private updateInspector () {

		const inspector = AppInspector.lastInspectorCreated;

		if ( inspector instanceof DynamicInspectorComponent ) {
			inspector.reload();
		}

		if ( inspector instanceof AssetInspectorComponent ) {
			inspector.reload();
		}
	}

	private updateAsset ( object: object ) {

		if ( object instanceof MaterialAsset ) {

			// do nothing

		}

	}
}

