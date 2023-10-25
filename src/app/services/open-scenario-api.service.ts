/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFile } from '../core/io/file';
import { FileApiService } from '../core/io/file-api.service';

@Injectable( {
	providedIn: 'root'
} )
export class OpenScenarioApiService {

	constructor ( private files: FileApiService ) {
	}

	getOpenScenario ( name: string ): Observable<IFile> {

		return this.files.getFile( name, 'open-scenario' );

	}

	saveOpenScenario ( file: IFile ): Observable<IFile> {

		return this.files.save( file );

	}
}
