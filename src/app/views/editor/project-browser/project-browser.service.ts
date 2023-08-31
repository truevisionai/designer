/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { InspectorFactoryService } from 'app/core/factories/inspector-factory.service';
import { AppInspector } from 'app/core/inspector';
import { Metadata, MetaImporter } from 'app/core/models/metadata.model';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { FileNode } from './file-node.model';

@Injectable( {
	providedIn: 'root'
} )
export class ProjectBrowserService {

	public static lastFile: FileNode;
	public static lastAsset: Metadata;
	public static lastMetadata: Metadata;

	/**
	 * @deprecated not in use
	 */
	public fileClicked = new EventEmitter<FileNode>();
	public fileDoubleClicked = new EventEmitter<FileNode>();

	public folderChanged = new EventEmitter<FileNode>();

	constructor ( private assets: AssetLoaderService ) {

		// this.fileClicked.subscribe( file => this.onFileClicked( file ) )

	}

	/**
	 *
	 * @param file
	 * @deprecated not in used
	 */
	onFileClicked ( file: FileNode ) {

		try {

			const meta = this.assets.fetchMetaFile( file );

			// console.log( meta.importer );

			const data = this.assets.find( meta.guid );

			// let instance = null;

			// if ( this.assets.assetInstances.has( meta.guid ) ) {
			//     instance = this.assets.assetInstances.get( meta.guid );
			// } else{
			//     instance = this.assets.assetInstances.set(meta.guid, )
			// }

			ProjectBrowserService.lastFile = file;
			ProjectBrowserService.lastAsset = data;
			ProjectBrowserService.lastMetadata = meta;

			switch ( meta.importer ) {
				case MetaImporter.SIGN:
					AppInspector.setInspector(
						InspectorFactoryService.getInpectorByFilename( file.name ),
						data
					);
					break;

				default:
					AppInspector.setInspector(
						InspectorFactoryService.getInpectorByFilename( file.name ),
						data
					);
					break;
			}

		} catch ( error ) {

			console.error( error, file );

		}
	}

	showFileByGuid ( guid: string ) {

		// const metdata = this.assets.find( guid );

		// const directory = metdata.path.split( '/' ).slice( 0, -1 ).join( '/' );

		// // this.fileSelected.emit( new FileNode( "", 0, false, false, metdata.path, "file", true, false ) );

		// this.folderChanged.emit( new FileNode( "", 0, false, false, directory, "directory", false, false ) );

		// // console.log( metdata.path, directory );
	}

}
