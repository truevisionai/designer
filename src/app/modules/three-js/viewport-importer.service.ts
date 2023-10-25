/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { FileUtils } from 'app/io/file-utils';
import { FileExtension } from 'app/io/file.service';
import { Metadata } from 'app/core/asset/metadata.model';
import { DragDropData } from 'app/services/drag-drop.service';
import { SceneService } from 'app/services/scene.service';
import { PropPointTool } from 'app/tools/prop-point/prop-point-tool';
import { ToolManager } from 'app/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { ImporterService } from 'app/services/importer.service';
import { MainFileService } from 'app/services/main-file.service';
import { PropManager } from 'app/managers/prop-manager';
import { RoadStyle } from 'app/services/road-style.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { BufferGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Texture, Vector3 } from 'three';
import { TvMapQueries } from '../tv-map/queries/tv-map-queries';
import { TvMesh } from './objects/tv-prefab.model';
import { SurfaceFactory, TvSurface } from '../tv-map/models/tv-surface.model';
import { SurfaceTool } from 'app/tools/surface/surface-tool';
import { ToolFactory } from 'app/factories/tool-factory';
import { ToolType } from 'app/tools/tool-types.enum';
import { CommandHistory } from 'app/services/command-history';
import { SetValueCommand } from './commands/set-value-command';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportImporterService {

	constructor (
		private assetService: AssetLoaderService,
		private importerService: ImporterService,
		private mainFileService: MainFileService,
	) {
	}

	async import ( data: DragDropData, position: Vector3 ) {

		if ( !data ) SnackBar.error( 'No data to import!' );
		if ( !data ) return;

		const filename = FileUtils.getFilenameFromPath( data.path );

		const metadata = this.assetService.fetchMetaFile( data.path );

		switch ( data.extension ) {

			case FileExtension.OPENDRIVE:
				this.importOpenDrive( data.path );
				break;

			case FileExtension.OPENSCENARIO:
				this.importerService.importOpenScenario( data.path );
				break;

			case FileExtension.PREFAB:
				this.importPrefab( data.path, filename, position, metadata );
				break;

			case 'geometry':
				this.importGeometry( data.path, filename, position, metadata );
				break;

			case 'gltf':
				this.importProp( data.path, filename, data.extension, position, metadata );
				break;

			case 'glb':
				this.importProp( data.path, filename, data.extension, position, metadata );
				break;

			case 'obj':
				this.importProp( data.path, filename, data.extension, position, metadata );
				break;

			case 'fbx':
				this.importProp( data.path, filename, data.extension, position, metadata );
				break;

			case 'prop':
				// alert( 'import prop ' + path );
				break;

			// case 'jpg':
			// 	this.importTexture( data.path, filename, data.extension, position, metadata );
			// 	break;

			// case 'png':
			// 	this.importTexture( data.path, filename, data.extension, position, metadata );
			// 	break;

			case 'scene':
				this.importerService.importScene( data.path );
				break;

			case 'roadstyle':
				this.importRoadStyle( data.path, filename, position, metadata );
				break;

			default:
				TvConsole.warn( `unknown file type: ${ data.extension } ` + data.path );
				SnackBar.warn( 'Unknown file! Not able to import' );
				break;
		}

	}

	// importTexture ( path: string, filename: string, extension: string, position: Vector3, metadata: Metadata ) {

	// const surface = SurfaceFactory.createFromTextureGuid( metadata.guid, position );

	// if ( !surface ) return;

	// ToolManager.currentTool = ToolFactory.createTool( ToolType.Surface );

	// }

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

	importRoadStyle ( path: string, filename: string, position: Vector3, metadata: Metadata ) {

		const road = TvMapQueries.getRoadByCoords( position.x, position.y );

		if ( !road ) return;

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( metadata.guid );

		CommandHistory.execute( new SetValueCommand( road, 'roadStyle', roadStyle.clone( null ), road.roadStyle.clone( null ) ) );

	}

	importProp ( path: string, filename: string, extension: string, position: Vector3, metadata: Metadata ) {

		PropManager.setProp( metadata );

		if ( ToolManager.currentTool instanceof PropPointTool ) {

			// ToolManager.currentTool.shapeEditor.addControlPoint( position );

		} else {

			ToolManager.currentTool = ToolFactory.createTool( ToolType.PropPoint );

			// ( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

		}

		// not needed because the prop is already loaded in the prop manager

		// this.modelImporter.import( path, filename, extension, position, metadata );

	}


}
