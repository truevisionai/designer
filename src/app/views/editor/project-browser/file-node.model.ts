/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FileService } from 'app/io/file.service';

/** Flat node with expandable and level information */
export class FileNode {

	constructor ( public name: string, public level = 1, public expandable = false, public isLoading = false, public path: string = '', public type: string = '', public isSelected = false, public isDeleted = false ) {
	}

	sub_folders ( fileService: FileService ): FileNode[] {

		const files = fileService.readPathContentsSync( this.path );

		const folders = [];

		files.forEach( file => {

			if ( file.type === 'directory' ) folders.push( new FileNode( file.name, 0, true, false, file.path, file.type ) );

		} );

		return folders;
	}

	sub_files ( fileService: FileService ): FileNode[] {

		// console.log( 'get-sub-files', this.name );

		const files = fileService.readPathContentsSync( this.path );

		const items = [];

		files.forEach( file => {

			const extension = FileService.getExtension( file.name );

			if ( extension !== 'meta' ) items.push( new FileNode( file.name, 0, true, false, file.path, file.type ) );

		} );

		return items;
	}
}
