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
export class OpenDriveApiService {

    constructor ( private files: FileApiService ) {
    }

    getOpenDrive ( name: string ): Observable<IFile> {
        return this.files.getFile( name, 'tv-map' );
    }

    getAll (): Observable<IFile[]> {
        return this.files.getFileList( 'tv-map' );
    }
}
