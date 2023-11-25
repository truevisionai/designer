import { AssetFactoryNew } from "app/core/asset/asset-factory.service";
import { MapEvents } from "app/events/map-events";
import { Manager } from "app/managers/manager";
import { TvMaterial } from "app/modules/three-js/objects/tv-material.model";
import { BaseTool } from "app/tools/base-tool";
import { ToolManager } from "app/tools/tool-manager";
import { AssetType } from "app/views/editor/project-browser/file-node.model";

export class ObjectEventListener extends Manager {

	debug: boolean;

	constructor (
		private assetFactory: AssetFactoryNew
	) {

		super();

	}

	init () {

		MapEvents.objectSelected.subscribe( e => this.onObjectSelected( e ) );
		MapEvents.objectUnselected.subscribe( e => this.onObjectUnselected( e ) );
		MapEvents.objectAdded.subscribe( e => this.onObjectAdded( e ) );
		MapEvents.objectUpdated.subscribe( e => this.onObjectUpdated( e ) );
		MapEvents.objectRemoved.subscribe( e => this.onObjectRemoved( e ) );

	}

	onObjectUpdated ( object: Object ): void {

		if ( this.debug ) console.debug( 'onObjectUpdated', object );

		if ( object instanceof TvMaterial ) {

			this.assetFactory.saveAssetByGuid( AssetType.MATERIAL, object.guid, object );

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

