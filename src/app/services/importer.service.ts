/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';
import { PropPointTool } from 'app/core/tools/prop-point/prop-point-tool';
import { ToolManager } from 'app/core/tools/tool-manager';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';

import { Vector3 } from 'three';
import { AssetLoaderService } from './asset-loader.service';
import { FileService } from './file.service';
import { ModelImporterService } from './model-importer.service';
import { PropManager } from './prop-manager';
import { SceneImporterService } from './scene-importer.service';
import { SnackBar } from './snack-bar.service';

@Injectable( {
	providedIn: 'root'
} )
export class ImporterService {

	/**
	 * This class is responsible for importing all supported files
	 *
	 * @param od
	 * @param osc
	 * @param three
	 * @param assetImporter
	 * @param sceneImporter
	 * @param assetService
	 */
	constructor (
		private od: TvMapService,
		private sceneImporter: SceneImporterService,
		private modelImporter: ModelImporterService,
		private assetService: AssetLoaderService,
		private fileService: FileService
	) {
	}

	importViaPath ( path: string, filename?: string, position?: Vector3 ) {

		const extension = FileService.getExtension( path );

		const metadata = this.assetService.fetchMetaFile( path );

		switch ( extension ) {

			case 'xodr':
				this.importOpenDrive( path );
				break;

			case 'gltf':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'glb':

				PropManager.setProp( metadata );

				if ( ToolManager.currentTool instanceof PropPointTool ) {

					ToolManager.currentTool.shapeEditor.addControlPoint( position );

				} else {

					ToolManager.currentTool = new PropPointTool();

					( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

				}

				// this.modelImporter.import( path, filename, extension, position, metadata );

				break;

			case 'obj':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'fbx':
				this.modelImporter.import( path, filename, extension, position, metadata );
				break;

			case 'prop':
				// alert( 'import prop ' + path );
				break;

			case 'scene':
				this.importScene( path );
				break;

			case 'roadstyle':
				console.error( 'method not implemented' );
				break;

			default:
				console.error( `unknown file type: ${ extension }`, path );
				SnackBar.warn( 'Unknown file! Not able to import' );
				break;
		}

	}

	onFileDropped ( file: File, folderPath: string ): any {

		if ( !file ) SnackBar.error( 'Incorrect file. Cannot import' );
		if ( !file ) return;

		const extension = FileService.getExtension( file.name );

		const destinationPath = this.fileService.join( folderPath, file.name );

		let copied = false;

		switch ( extension ) {

			case 'gltf':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			case 'glb':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			case 'obj':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			// case 'fbx': copied = this.copyFileInFolder( file.path, destinationPath, extension ); break;

			case 'jpg':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			case 'jpeg':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			case 'png':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			case 'svg':
				copied = this.copyFileInFolder( file.path, destinationPath, extension );
				break;

			default:
				SnackBar.error( `${ extension } file cannot be imported` );
				break;
		}

		if ( copied ) {

			MetadataFactory.createMetadata( file.name, extension, destinationPath );

		}
	}

	copyFileInFolder ( sourcePath: string, destinationPath: string, ext?: string ): boolean {

		if ( !destinationPath ) SnackBar.error( 'folderPath incorrect' );
		if ( !destinationPath ) return;

		try {

			// console.log( 'import as texture in ', this.selectedFolder );
			// const extension = ext || FileService.getExtension( file.name );

			// const source = sourcePath.path;
			// const destination = destinationPath + '\\' + sourcePath.name;

			// const newFilePath = this.fileService.join( destinationPath, sourcePath.name );

			this.fileService.fs.copyFileSync( sourcePath, destinationPath );

			// this.fileService.fs.copyFile( source, destination, ( err ) => {

			//     if ( err ) SnackBar.error( err );

			//     this.reimport( { path: destination, name: file.name }, extension );

			// } );

			return true;

		} catch ( error ) {

			SnackBar.error( error );

		}
	}


	importScene ( path: string ) {

		this.sceneImporter.importFromPath( path );

	}

	importOpenDrive ( filepath: string ) {

		this.od.importFromPath( filepath );

	}


}
