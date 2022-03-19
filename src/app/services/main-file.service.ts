/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SnackBar } from './snack-bar.service';
import { TvMapSourceFile } from 'app/modules/tv-map/services/tv-map-source-file';
import { SceneExporterService } from './scene-exporter.service';
import { IFile } from 'app/core/models/file';
import { FileService } from './file.service';
import { AppService } from 'app/core/services/app.service';
import { SceneImporterService } from './scene-importer.service';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { ToolManager } from 'app/core/tools/tool-manager';
import { AppInspector } from 'app/core/inspector';
import { ThreeService } from 'app/modules/three-js/three.service';
import { CommandHistory } from './command-history';

@Injectable( {
    providedIn: 'root'
} )
export class MainFileService {

    constructor (
        public sceneExporter: SceneExporterService,
        public sceneImporter: SceneImporterService,
        public fileService: FileService,
        public threeService: ThreeService
    ) { }

    get currentFile () { return TvMapSourceFile.currentFile; }

    set currentFile ( value ) { TvMapSourceFile.currentFile = value; }

    get openDrive () { return TvMapSourceFile.openDrive; }

    set openDrive ( value ) { TvMapSourceFile.openDrive = value; }


    importViaContent ( content: string ) {

        this.sceneImporter.importFromString( content );

    }

    newFile () {

        ToolManager.clear();

        AppInspector.clear();

        CommandHistory.clear();

        if ( this.openDrive ) this.openDrive.destroy();

        this.currentFile = new IFile( 'untitled.xml' );

        this.openDrive = new TvMap();

        TvMapBuilder.buildMap( this.openDrive );
    }

    showOpenWindow ( path?: string ) {

        if ( AppService.isElectronApp ) {

            this.fileService.import( path, 'tv-map', [ 'xml', 'xosc' ], ( file: IFile ) => {

                this.sceneImporter.importFromFile( file );

            } );

        } else {

            throw new Error( 'not implemented' );

        }

    }

    openFromPath ( path: string, callback?: Function ) {

        if ( AppService.isElectronApp ) {

            this.fileService.readFile( path, 'xml', ( file: IFile ) => {

                this.sceneImporter.importFromString( file.contents );

                if ( callback ) callback();

            } );

        }

    }

    save () {

        if ( this.currentFile == null ) throw new Error( 'Create file before saving' );

        this.currentFile.contents = this.sceneExporter.export( this.openDrive );

        this.saveLocally( this.currentFile );

    }

    saveAs () {

        this.sceneExporter.saveAs();

    }

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

}
