/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFile } from '../models/file';
import { FileApiService } from './file-api.service';

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
