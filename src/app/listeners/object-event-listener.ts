/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AssetManager } from "app/core/asset/asset.manager";
import { AssetService } from "app/core/asset/asset.service";
import { RoadStyle } from "app/core/asset/road.style";
import { Environment } from "app/core/utils/environment";
import { MapEvents } from "app/events/map-events";
import { PropManager } from "app/managers/prop-manager";
import { RoadStyleManager } from "app/managers/road-style.manager";
import { TvMaterial } from "app/graphics/material/tv-material";
import { BaseTool } from "app/tools/base-tool";
import { ToolManager } from "app/managers/tool-manager";
import { AssetNode, AssetType } from "app/views/editor/project-browser/file-node.model";

@Injectable( {
	providedIn: 'root'
} )
export class ObjectEventListener {

	private debug: boolean = false; //!Environment.production;

	constructor (
		private assetService: AssetService,
		private assetManager: AssetManager,
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

	onAssetSelected ( asset: AssetNode ): void {

		const instance = this.assetService.getAssetInstance( asset );

		switch ( asset.type ) {

			case AssetType.ROAD_STYLE:
				RoadStyleManager.setCurrentStyle( instance as RoadStyle );
				break;

			case AssetType.MODEL:
				PropManager.setProp( asset as any );
				break;

			case AssetType.TEXTURE:
				this.assetManager.setTextureAsset( asset );
				break;

			case AssetType.MATERIAL:
				this.assetManager.setMaterialAsset( asset );
				break;

		}

	}

	onObjectUpdated ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectUpdated', object );

		if ( object instanceof TvMaterial ) {

			this.assetService.saveAssetByGuid( AssetType.MATERIAL, object.guid, object );

		} else {

			ToolManager.getTool<BaseTool>()?.onObjectUpdated( object );

		}

	}

	onObjectRemoved ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectRemoved', object );

		ToolManager.getTool<BaseTool>()?.onObjectRemoved( object );

	}

	onObjectAdded ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectAdded', object );

		ToolManager.getTool<BaseTool>()?.onObjectAdded( object );

	}

	onObjectUnselected ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectUnselected', object );

		ToolManager.getTool<BaseTool>()?.onObjectUnselected( object );

	}

	onObjectSelected ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectSelected', object );

		ToolManager.getTool<BaseTool>()?.onObjectSelected( object );

	}

}

