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
import { Vector3 } from 'three';
import { TvMapQueries } from '../tv-map/queries/tv-map-queries';

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

		const filename = FileUtils.getFilenameFromPath( data.path );

		const metadata = this.assetService.fetchMetaFile( data.path );

		switch ( data.extension ) {

			case FileExtension.OPENDRIVE:
				this.importOpenDrive( data.path );
				break;

			case FileExtension.OPENSCENARIO:
				this.importerService.importOpenScenario( data.path );
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

	importOpenDrive ( path: string ) {

		this.mainFileService.newFile();

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
