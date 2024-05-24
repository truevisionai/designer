/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ModelImporter } from "../importers/model.importer";
import { TextureImporter } from "../importers/texture.importer";
import { FileExtension } from "../io/file-extension";
import { TvConsole } from "../core/utils/console";
import { Importer } from "../core/interfaces/importer";

@Injectable( {
	providedIn: 'root'
} )
export class ImporterFactory {

	constructor (
		private modelImporter: ModelImporter,
		private textureImporter: TextureImporter
	) {
	}

	getImporter ( extension: string ) {

		let importer: Importer;

		switch ( extension ) {

			case FileExtension.GLTF:
				importer = this.modelImporter;
				break;

			case FileExtension.GLB:
				importer = this.modelImporter;
				break;

			case FileExtension.OBJ:
				importer = this.modelImporter;
				break;

			case FileExtension.FBX:
				importer = this.modelImporter;
				break;

			case FileExtension.JPG:
				importer = this.textureImporter;
				break;

			case FileExtension.JPEG:
				importer = this.textureImporter;
				break;

			case FileExtension.PNG:
				importer = this.textureImporter;
				break;

			case FileExtension.TGA:
				importer = this.textureImporter;
				break;

			case FileExtension.SVG:
				importer = this.textureImporter;
				break;

			case FileExtension.OPENDRIVE:
				TvConsole.error( `${ extension } file not supported` );
				break;

			case FileExtension.OPENSCENARIO:
				TvConsole.error( `${ extension } file not supported` );
				// this.dialogFactory.showImportOpenScenarioDialog( file.path, destinationPath, extension )
				// 	?.afterClosed()
				// 	.subscribe( () => {
				// 		this.onFolderChanged( this.currentFolder );
				// 	} );
				break;

			default:
				TvConsole.error( `${ extension } file not supported` );
				break;

		}

		return importer;
	}

}
