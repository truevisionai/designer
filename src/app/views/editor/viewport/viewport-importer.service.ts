/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { Metadata } from 'app/core/asset/metadata.model';
import { DragDropData } from 'app/services/editor/drag-drop.service';
import { SceneService } from 'app/services/scene.service';
import { ToolManager } from 'app/managers/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ImporterService } from 'app/importers/importer.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Texture, Vector3 } from 'three';
import { TvMapQueries } from '../../../map/queries/tv-map-queries';
import { TvMesh } from '../../../graphics/mesh/tv-mesh';
import { CommandHistory } from 'app/services/command-history';
import { SetValueCommand } from '../../../commands/set-value-command';
import { RoadStyle } from "../../../core/asset/road.style";
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { SelectObjectCommand } from 'app/commands/select-object-command';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { ToolType } from 'app/tools/tool-types.enum';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportImporterService {

	constructor (
		private importerService: ImporterService,
		private mainFileService: TvSceneFileService,
		private snackBar: SnackBar
	) {
	}

	import ( asset: DragDropData, position: Vector3 ) {

		if ( !asset ) this.snackBar.error( 'No data to import!' );
		if ( !asset ) return;

		const filename = asset.assetName;

		const metadata = asset.metadata;

		switch ( asset.type ) {

			case AssetType.OPENDRIVE:
				this.importOpenDrive( asset.path );
				break;

			case AssetType.OPENSCENARIO:
				this.importerService.importOpenScenario( asset.path );
				break;

			case AssetType.PREFAB:
				this.importPrefab( asset.path, filename, position, metadata );
				break;

			case AssetType.GEOMETRY:
				this.importGeometry( asset.path, filename, position, metadata );
				break;

			case AssetType.MODEL:
				this.importModel( asset, position );
				break;

			case AssetType.TEXTURE:
				this.importTexture( asset, position );
				break;

			case AssetType.SCENE:
				this.importerService.importScene( asset.path );
				break;

			case AssetType.ROAD_STYLE:
				this.importRoadStyle( asset, position );
				break;

			case AssetType.MATERIAL:
				this.importMaterial( asset, position );
				break;

			default:
				TvConsole.warn( `File not supported for viewport extension: ${ asset.extension } ` + asset.path );
				break;
		}

	}

	importMaterial ( asset: AssetNode, position: Vector3 ) {

		ToolManager.currentTool?.onAssetDropped( asset, position );

	}

	importTexture ( asset: AssetNode, position: Vector3 ) {

		ToolManager.currentTool?.onAssetDropped( asset, position );

	}

	importGeometry ( path: string, filename: string, position: Vector3, metadata: Metadata ) {

		const geometry = AssetDatabase.getInstance<BufferGeometry>( metadata.guid );

		const model = new Mesh( geometry, new MeshBasicMaterial( { color: COLOR.MAGENTA } ) );

		model.position.copy( position );

		// const box = new Box3().setFromObject( model );

		// const size = box.getSize( new Vector3() );

		// const center = box.getCenter( new Vector3() );

		// clone.position.sub( center );

		// clone.position.z = position.z + ( size.z / 2 );

		SceneService.addToMain( model );

	}

	importPrefab ( path: string, filename: string, position: Vector3, metadata: Metadata ) {

		const prefab = AssetDatabase.getInstance<TvMesh>( metadata.guid );

		if ( !prefab ) return;

		const clone = prefab.clone();

		clone.position.copy( position );

		// const box = new Box3().setFromObject( clone );

		// const size = box.getSize( new Vector3() );

		// const center = box.getCenter( new Vector3() );

		// clone.position.sub( center );

		// clone.position.z = position.z + ( size.z / 2 );

		SceneService.addToMain( clone );
	}

	importOpenDrive ( path: string ) {

		this.mainFileService.newScene();

		this.importerService.importOpenDrive( path );

	}

	importRoadStyle ( asset: AssetNode, position: Vector3 ) {

		ToolManager.currentTool?.onAssetDropped( asset, position );

	}

	importModel ( asset: AssetNode, position: Vector3 ) {

		const tool = ToolManager.currentTool;

		if ( tool.toolType == ToolType.PropPoint ) {

			PropManager.setProp( asset as any );

			const object = AssetDatabase.getInstance<Object3D>( asset.guid );

			if ( !object ) return;

			const prop = new PropInstance( asset.guid, object.clone() )

			prop.copyPosition( position );

			const addCommand = new AddObjectCommand( prop );

			const selectCommand = new SelectObjectCommand( prop );

			CommandHistory.executeMany( addCommand, selectCommand );

		}

	}


}
