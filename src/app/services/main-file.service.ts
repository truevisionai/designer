/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SnackBar } from './snack-bar.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
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

    get currentFile () { return TvMapInstance.currentFile; }

    set currentFile ( value ) { TvMapInstance.currentFile = value; }

    get map () { return TvMapInstance.map; }

    set map ( value ) { TvMapInstance.map = value; }


    importViaContent ( content: string ) {

        this.sceneImporter.importFromString( content );

    }

    newFile () {

        ToolManager.clear();

        AppInspector.clear();

        CommandHistory.clear();

        if ( this.map ) this.map.destroy();

        this.currentFile = new IFile( 'untitled.xml' );

        this.map = new TvMap();

        TvMapBuilder.buildMap( this.map );
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

        this.currentFile.contents = this.sceneExporter.export( this.map );

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
