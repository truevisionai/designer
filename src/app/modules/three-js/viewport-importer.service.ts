/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Metadata } from 'app/core/models/metadata.model';
import { DragDropData } from 'app/core/services/drag-drop.service';
import { PropPointTool } from 'app/core/tools/prop-point/prop-point-tool';
import { ToolManager } from 'app/core/tools/tool-manager';
import { TvConsole } from 'app/core/utils/console';
import { AssetDatabase } from 'app/services/asset-database';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { FileUtils } from 'app/services/file-utils';
import { FileExtension } from 'app/services/file.service';
import { ImporterService } from 'app/services/importer.service';
import { MainFileService } from 'app/services/main-file.service';
import { PropManager } from 'app/services/prop-manager';
import { RoadStyle } from 'app/services/road-style.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { Box3, BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { TvMapQueries } from '../tv-map/queries/tv-map-queries';
import { TvMesh } from './objects/tv-prefab.model';
import { SceneService } from 'app/core/services/scene.service';
import { ThreeJsUtils } from 'app/core/utils/threejs-utils';
import { CoordinateSystem } from 'app/services/exporter.service';
import { COLOR } from 'app/shared/utils/colors.service';

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

	importGeometry ( path: string, filename: string, position: Vector3, metadata: Metadata ) {

		const geometry = AssetDatabase.getInstance<BufferGeometry>( metadata.guid );

		const model = new Mesh( geometry, new MeshBasicMaterial( { color: COLOR.MAGENTA } ) );

		model.position.copy( position );

		// const box = new Box3().setFromObject( model );

		// const size = box.getSize( new Vector3() );

		// const center = box.getCenter( new Vector3() );

		// clone.position.sub( center );

		// clone.position.z = position.z + ( size.z / 2 );

		SceneService.add( model );

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

		SceneService.add( clone );
	}

	importOpenDrive ( path: string ) {

		this.mainFileService.newScene();

		this.importerService.importOpenDrive( path );

	}

	importRoadStyle ( path: string, filename: string, position: Vector3, metadata: Metadata ) {

		const road = TvMapQueries.getRoadByCoords( position.x, position.y );

		if ( !road ) return;

		const roadStyle = AssetDatabase.getInstance<RoadStyle>( metadata.guid );

		road.applyRoadStyle( roadStyle );

	}

	importProp ( path: string, filename: string, extension: string, position: Vector3, metadata: Metadata ) {

		PropManager.setProp( metadata );

		if ( ToolManager.currentTool instanceof PropPointTool ) {

			ToolManager.currentTool.shapeEditor.addControlPoint( position );

		} else {

			ToolManager.currentTool = new PropPointTool();

			( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

		}

		// not needed because the prop is already loaded in the prop manager

		// this.modelImporter.import( path, filename, extension, position, metadata );

	}


}
