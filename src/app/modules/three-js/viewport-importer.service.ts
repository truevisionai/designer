/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { Metadata } from 'app/core/asset/metadata.model';
import { DragDropData } from 'app/services/drag-drop.service';
import { SceneService } from 'app/services/scene.service';
import { PropPointTool } from 'app/tools/prop-point/prop-point-tool';
import { ToolManager } from 'app/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ImporterService } from 'app/importers/importer.service';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Texture, Vector3 } from 'three';
import { TvMapQueries } from '../tv-map/queries/tv-map-queries';
import { TvMesh } from './objects/TvMesh';
import { ToolFactory } from 'app/factories/tool-factory';
import { ToolType } from 'app/tools/tool-types.enum';
import { CommandHistory } from 'app/services/command-history';
import { SetValueCommand } from '../../commands/set-value-command';
import { RoadStyle } from "../../core/asset/road.style";
import { RoadService } from 'app/services/road/road.service';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportImporterService {

	constructor (
		private importerService: ImporterService,
		private mainFileService: TvSceneFileService,
	) {
	}

	import ( asset: DragDropData, position: Vector3 ) {

		if ( !asset ) SnackBar.error( 'No data to import!' );
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
				break;

			case AssetType.SCENE:
				this.importerService.importScene( asset.path );
				break;

			case AssetType.ROAD_STYLE:
				this.importRoadStyle( asset, position );
				break;

			default:
				TvConsole.warn( `unknown file type: ${ asset.extension } ` + asset.path );
				SnackBar.warn( 'Unknown file! Not able to import' );
				break;
		}

	}

	importTexture ( path: string, filename: string, extension: string, position: Vector3, metadata: Metadata ) {

		// const surface = SurfaceToolService.createFromTextureGuid( metadata.guid, position );

		// if ( !surface ) return;

		// ToolManager.currentTool = ToolFactory.createTool( ToolType.Surface );

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

	importRoadStyle ( asset: AssetNode, position: Vector3) {

		const road = TvMapQueries.getRoadByCoords( position.x, position.y );

		if ( !road ) return;

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) return;

		CommandHistory.execute( new SetValueCommand( road, 'roadStyle', roadStyle.clone( null ), road.roadStyle.clone( null ) ) );

	}

	importModel ( asset: AssetNode, position: Vector3 ) {

		// PropManager.setProp( metadata );

		if ( ToolManager.currentTool instanceof PropPointTool ) {

			// ToolManager.currentTool.shapeEditor.addControlPoint( position );

		} else {

			// ToolManager.currentTool = ToolFactory.createTool( ToolType.PropPoint );

			// ( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

		}

	}


}
