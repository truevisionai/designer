/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from '../models/file';
import { ApiService } from './api.service';

@Injectable( {
	providedIn: 'root'
} )
export class FileApiService {

	constructor ( private api: ApiService ) {
	}

	// get file
	getFile ( name: string, type: string ) {

		return this.api.get( `/files?type=${ type }&name=${ name }` );

	}

	// get list of files
	getFileList ( type: string ) {

		return this.api.get( `/files/list?type=${ type }` );

	}

	save ( file: IFile ) {

		return this.api.put( '/files', { file } );

	}

	ping () {

		return this.api.get( `/ping` );

	}
}
