/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';

import * as THREE from 'three';
import { saveAs } from 'file-saver';

import { TvCarlaExporter } from 'app/modules/tv-map/services/tv-carla-exporter';
import { IFile } from 'app/core/models/file';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { FileService } from './file.service';
import { ElectronService } from 'ngx-electron';
import { SceneExporterService } from './scene-exporter.service';
import { CommandHistory } from './command-history';
import { SetToolCommand } from 'app/core/commands/set-tool-command';


@Injectable( {
    providedIn: 'root'
} )
export class ExporterService {

    constructor (
        private odService: TvMapService,
        private fileService: FileService,
        private electron: ElectronService,
        private sceneExporter: SceneExporterService
    ) { }

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

        const exporter = new THREE.GLTFExporter();

        exporter.parse( TvMapInstance.map.gameObject, ( buffer: any ) => {

            const blob = new Blob( [ buffer ], { type: 'application/octet-stream' } );

            saveAs( blob, filename );

            // forceIndices: true, forcePowerOfTwoTextures: true
            // to allow compatibility with facebook
        }, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true } );

    }

    exportGTLF () {

        this.clearTool();

        const options = {};

        const exporter = new THREE.GLTFExporter();

        exporter.parse( TvMapInstance.map.gameObject, ( result ) => {

            const text = JSON.stringify( result, null, 2 );

            const filename = 'road.gltf';

            saveAs( new Blob( [ text ], { type: 'text/plain' } ), filename );

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
