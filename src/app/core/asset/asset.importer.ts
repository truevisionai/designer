/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileUtils } from "../../io/file-utils";
import { ImporterFactory } from "../../factories/importer.factory";

@Injectable( {
	providedIn: 'root'
} )
export class AssetImporter {

	constructor (
		private factory: ImporterFactory,
	) {
	}

	async import ( sourcePath: string, destinationFolder: string ) {

		const extension = FileUtils.getExtensionFromPath( sourcePath );

		const importer = this.factory.getImporter( extension.toLowerCase() );

		if ( !importer ) return;

		return await importer.import( sourcePath, destinationFolder );

		// for open scenario
		// this.dialogFactory.showImportOpenScenarioDialog( file.path, destinationPath, extension )
		// 			?.afterClosed()
		// 			.subscribe( () => {
		// 				this.onFolderChanged( this.currentFolder );
		// 			} );

	}

}

