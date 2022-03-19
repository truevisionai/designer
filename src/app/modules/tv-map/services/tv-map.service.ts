/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileService } from '../../../services/file.service';
import { OpenDriverParser } from './open-drive-parser.service';
import { TvMapSourceFile } from './tv-map-source-file';
import { IFile } from '../../../core/models/file';
import { TvMapBuilder } from '../builders/od-builder.service';
import { OdWriter } from './open-drive-writer.service';
import { FileApiService } from 'app/core/services/file-api.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvMap } from '../models/tv-map.model';
import { ElectronService } from 'ngx-electron';

import { saveAs } from 'file-saver';
import { ToolManager } from 'app/core/tools/tool-manager';
import { AppInspector } from 'app/core/inspector';
import { CommandHistory } from 'app/services/command-history';

@Injectable( {
    providedIn: 'root'
} )
export class TvMapService {

    constructor (
        private fileService: FileService,
        private writer: OdWriter,
        private fileApiService: FileApiService,
        private electron: ElectronService,
        private openDriveParser: OpenDriverParser
    ) {

        // not reqiured now because open scenario not being used
        // OdSourceFile.roadNetworkChanged.subscribe( ( e ) => {
        // OdBuilder.makeOpenDrive( this.openDrive );
        // } );

    }

    public get currentFile () {
        return TvMapSourceFile.currentFile;
    }

    public set currentFile ( value ) {
        TvMapSourceFile.currentFile = value;
    }

    public get openDrive () {
        return TvMapSourceFile.openDrive;
    }

    public set openDrive ( value ) {
        TvMapSourceFile.openDrive = value;
    }

    /**
     * @deprecated
     */
    newFile () {

        if ( this.openDrive ) this.openDrive.destroy();

        this.currentFile = new IFile( 'untitled.xml' );

        this.openDrive = new TvMap();

    }

    /**
     * @deprecated
     */
    async open () {

        const filepaths = await this.fileService.showAsyncDialog();

        if ( filepaths == null || filepaths.length == 0 ) return;

        const contents = await this.fileService.readAsync( filepaths[ 0 ] );

        if ( this.openDrive ) this.openDrive.destroy();

        this.openDrive = this.openDriveParser.parse( contents );

        ToolManager.clear();

        AppInspector.clear();

        CommandHistory.clear();

        // set to currently file pah
        this.currentFile = new IFile( 'untitled.xml' );

        TvMapBuilder.buildMap( this.openDrive );

    }

    public import ( file: IFile, callbackFn = null ) {

        ToolManager.clear();

        AppInspector.clear();

        CommandHistory.clear();

        if ( this.openDrive != null ) this.openDrive.destroy();

        this.currentFile = file;

        let parser = new OpenDriverParser();

        this.openDrive = parser.parse( file.contents );

        TvMapBuilder.buildMap( this.openDrive );

        if ( callbackFn != null ) callbackFn();

        // Important! removes garbage
        parser = undefined;

        SnackBar.success( 'File Imported' );
    }

    public importFromPath ( filepath: string, callbackFn = null ) {

        this.fileService.readFile( filepath, 'xml', ( file: IFile ) => {

            this.import( file, callbackFn );

        } );

    }

    public importContent ( contents: string ) {

        const file = new IFile();

        file.name = 'Untitled.xml';
        file.contents = contents;

        this.import( file );

    }

    /**
     * @deprecated
     */
    save () {

        if ( this.currentFile == null ) {

            throw new Error( 'Create file before saving' );

        }

        this.currentFile.contents = this.writer.getOutput( this.openDrive );

        if ( this.currentFile.online ) {

            this.saveOnline( this.currentFile );

        } else {

            this.saveLocally( this.currentFile );

        }

    }

    getOutput () {

        return this.writer.getOutput( this.openDrive );

    }

    /**
     * 
     * @deprecated
     * @param file 
     */
    saveLocally ( file: IFile ) {

        // path exists means it was imported locally
        if ( this.currentFile.path != null ) {

            this.fileService.saveFile( file.path, file.contents, ( file: IFile ) => {

                this.currentFile.path = file.path;
                this.currentFile.name = file.name;

                SnackBar.success( 'File Saved!' );

            } );

        } else {

            this.saveAs();

        }
    }

    saveLocallyAt ( path: string ) {

        const contents = this.getOutput();

        this.fileService.saveFile( path, contents, ( file: IFile ) => {

            this.currentFile.path = file.path;
            this.currentFile.name = file.name;

        } );
    }

    saveOnline ( file: IFile ) {

        this.fileApiService.save( file ).subscribe( res => {

            SnackBar.success( 'File Saved (Online)!' );

        } );

    }

    saveAs () {

        const contents = this.writer.getOutput( this.openDrive );

        if ( this.electron.isElectronApp ) {

            this.fileService.saveAsFile( null, contents, ( file: IFile ) => {

                this.currentFile.path = file.path;
                this.currentFile.name = file.name;

            } );

        } else {

            saveAs( new Blob( [ contents ] ), 'road.xodr' );

        }

    }
}
