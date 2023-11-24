import { Injectable } from '@angular/core';
import { TvElectronService } from './tv-electron.service';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { Metadata } from 'app/core/asset/metadata.model';
import { StorageService } from 'app/io/storage.service';

declare const versions;

@Injectable( {
	providedIn: 'root'
} )
export class ProjectService {

	constructor (
		private electronService: TvElectronService,
		private storageService: StorageService,
	) { }

	get remote () {

		return this.electronService.remote;

	}

	get userDocumentFolder () {

		return this.remote.app.getPath( 'documents' );

	}

	get currentDirectory () {

		return versions.currentDirectory;

	}

	get projectPath () {

		if ( this.electronService.isWindows ) {

			return this.userDocumentFolder + '\\Truevision';

		} else if ( this.electronService.isLinux ) {

			return this.userDocumentFolder + '/Truevision';

		} else if ( this.electronService.isMacOS ) {

			return this.userDocumentFolder + '/Truevision';

		} else {

			throw new Error( 'Unsupported platform. Please contact support for more details.' );

		}

	}

	createProjectFolder () {

		try {

			// create Truevision Folder in user documents if it does not exist
			// if ( !this.storageService.exists( this.projectPath ) ) {

			// 	this.storageService.createDirectory( this.userDocumentFolder, 'Truevision' );

			// 	AssetFactory.createNewFolder( this.projectPath, 'Materials' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'Props' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'Roads' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'RoadStyles' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'RoadMarkings' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'Signs' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'Scenes' );
			// 	AssetFactory.createNewFolder( this.projectPath, 'Textures' );

			// 	this.createDefaultAssets();


			// }

		} catch ( error ) {

			console.log( error );

			throw new Error( 'Error in setting up default project folder' );

		}

	}

	createDefaultAssets () {

		this.createRoadStyleAssets();

		this.createPropAssets();

		this.createRoadMarkingAssets();

		this.createBaseAssets( 'Materials' );

	}

	createRoadMarkingAssets () {

		this.createBaseAssets( 'RoadMarkings' );

	}

	createPropAssets () {

		this.createBaseAssets( 'Props' );

	}

	createRoadStyleAssets () {

		this.createBaseAssets( 'RoadStyles' );

	}

	createBaseAssets ( folder: string ) {

		try {

			// let path = null;

			// if ( this.electronService.remote.app.isPackaged ) {

			// 	const appPath = this.electronService.remote.app.getAppPath();

			// 	path = this.fileService.resolve( appPath, `./default-project/${ folder }` );

			// } else {

			// 	path = this.fileService.join( this.currentDirectory, `/default-project/${ folder }` );

			// }

			// this.fileService.readPathContentsSync( path ).forEach( file => {

			// 	const destinationFolder = this.storageService.join( this.projectPath, `/${ folder }/` );

			// 	const destinationPath = this.storageService.join( destinationFolder, file.name );

			// 	if ( file.name.includes( '.meta' ) ) {

			// 		const metadata = this.fetchMetaFile( file );

			// 		metadata.path = destinationPath.replace( '.meta', '' );

			// 		MetadataFactory.saveMetadataFile( destinationPath, metadata );

			// 	} else {

			// 		this.storageService.copyFileSync( file.path, destinationPath );

			// 	}

			// } );

		} catch ( error ) {

			console.error( error );

			throw new Error( 'Error in creating assets' );

		}

	}

	fetchMetaFile ( file: AssetNode | string ): Metadata {

		try {

			let path = null;

			if ( typeof ( file ) === 'string' ) path = file;

			if ( typeof ( file ) === 'object' ) path = file.path;

			if ( !path.includes( '.meta' ) ) path = path + '.meta';

			const contents = this.storageService.readSync( path );

			return JSON.parse( contents );

		} catch ( error ) {

			console.error( error, file );

		}

	}

}
