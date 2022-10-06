/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/core/commands/set-tool-command';
import { IFile } from 'app/core/models/file';

import { TvCarlaExporter } from 'app/modules/tv-map/services/tv-carla-exporter';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { saveAs } from 'file-saver';
import { ElectronService } from 'ngx-electron';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import { CommandHistory } from './command-history';
import { FileService } from './file.service';
import { SceneExporterService } from './scene-exporter.service';

@Injectable( {
    providedIn: 'root'
} )
export class ExporterService {

    constructor (
        private odService: TvMapService,
        private fileService: FileService,
        private electron: ElectronService,
        private sceneExporter: SceneExporterService
    ) {
    }

    exportScene () {

        this.clearTool();

        this.sceneExporter.saveAs();

    }

    exportOpenDrive () {

        this.clearTool();

        this.odService.saveAs();
    }

    exportGLB ( filename = 'road.glb' ) {

        this.clearTool();

        const exporter = new GLTFExporter();

        exporter.parse( TvMapInstance.map.gameObject, ( buffer: any ) => {

            const blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

            saveAs( blob, filename );

            // forceIndices: true, forcePowerOfTwoTextures: true
            // to allow compatibility with facebook
        }, ( error ) => {

        }, { binary: true, forceIndices: true } );

    }

    exportGTLF () {

        this.clearTool();

        const options = {};

        const exporter = new GLTFExporter();

        exporter.parse( TvMapInstance.map.gameObject, ( result ) => {

            const text = JSON.stringify( result, null, 2 );

            const filename = 'road.gltf';

            saveAs( new Blob( [ text ], { type: 'text/plain' } ), filename );

        }, ( error ) => {

            console.error( error );

        }, options );

    }

    exportCARLA () {

        this.clearTool();

        const exporter = new TvCarlaExporter();

        const contents = exporter.getOutput( this.odService.map );

        if ( this.electron.isElectronApp ) {

            this.fileService.saveAsFile( null, contents, ( file: IFile ) => {

                this.odService.currentFile.path = file.path;
                this.odService.currentFile.name = file.name;

            } );

        } else {

            saveAs( new Blob( [ contents ] ), 'road.xodr' );

        }

    }

    private clearTool () {

        CommandHistory.execute( new SetToolCommand( null ) );

    }
}
