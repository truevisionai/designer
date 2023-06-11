import { Injectable } from '@angular/core';
import { FileService } from '../../../services/file.service';
import { OscReaderService } from './osc-reader.service';
import { OscWriterService } from './osc-writer.service';
import { OscBuilderService } from '../builders/osc-builder.service';
import { OpenScenario } from '../models/osc-scenario';
import { OscSourceFile } from './osc-source-file';
import { IFile } from '../../../core/models/file';
import { OpenScenarioApiService } from '../../../core/services/open-scenario-api.service';
import { SnackBar } from '../../../services/snack-bar.service';
import { ElectronService } from 'ngx-electron';
import { Debug } from 'app/core/utils/debug';
import { OscPlayerService } from './osc-player.service';

import { saveAs } from 'file-saver';

@Injectable( {
    providedIn: 'root'
} )
export class OscService {

    constructor (
        private reader: OscReaderService,
        private writer: OscWriterService,
        private builder: OscBuilderService,
        private fileService: FileService,
        private openScenarioApi: OpenScenarioApiService,
        private electron: ElectronService,
        private oscPlayer: OscPlayerService
    ) {

        OscSourceFile.scenarioChanged.subscribe( scenario => {

            // Debug.log( 'scenerio changed' );
            // this.builder.build( road, OscSourceFile.file );

        } );

    }

    get currentFile () {
        return OscSourceFile.currentFile;
    }

    set currentFile ( value ) {
        OscSourceFile.currentFile = value;
    }

    get scenario () {
        return OscSourceFile.scenario;
    }

    set scenario ( value ) {
        OscSourceFile.scenario = value;
    }

    rebuild () {

        // TODO: Clear old scene

        this.builder.build( this.scenario, this.currentFile );

    }

    newFile () {

        this.currentFile = new IFile( 'untitled.xml' );

        this.scenario = new OpenScenario();

    }

    openFile () {

        if ( this.electron.isElectronApp ) {

            this.fileService.import( null, 'osc', [ 'xml', 'xosc' ], ( file: IFile ) => {

                this.import( file );

            } );

        } else {

            throw new Error( 'not implemented' );

        }
    }

    import ( file: IFile ) {

        this.currentFile = file;

        SnackBar.open( 'Building Scenario' );

        this.scenario = this.reader.readFromFile( file );

        this.builder.build( this.scenario, file );
    }

    importFromPath ( filepath: string ) {

        this.fileService.readFile( filepath, 'xml', ( file: IFile ) => {

            this.import( file );

        } );

    }

    importFromContent ( contents: string ) {

        const file = new IFile();

        file.name = 'Untitled.xml';
        file.contents = contents;
        file.online = false;

        this.import( file );
    }

    save ( callback?: ( file: IFile ) => void ) {

        const fileDoesNotExist = this.currentFile == null || this.currentFile.path == null;

        if ( fileDoesNotExist ) {

            this.saveAs( callback );

        } else {

            SnackBar.open( 'Saving...' );

            const content = this.writer.getOutputString( this.scenario );

            if ( this.currentFile.online ) {

                this.saveOnline( content );

            } else {

                this.saveLocally( content, callback );

            }
        }
    }

    saveAs ( callback?: ( file: IFile ) => void ) {

        const contents = this.writer.getOutputString( OscSourceFile.scenario );

        Debug.log( contents );

        if ( this.electron.isElectronApp ) {

            this.fileService.saveAsFile( null, contents, ( file: IFile ) => {

                if ( this.currentFile == null ) {

                    this.currentFile = new IFile( file.name, file.path );

                } else {

                    this.currentFile.path = file.path;
                    this.currentFile.name = file.name;

                }

                if ( callback ) callback( file );

            } );

        } else {

            saveAs( new Blob( [ contents ] ), 'scenario.xosc' );

        }

    }

    saveLocallyAt ( path, callback?: ( file: IFile ) => void ) {

        const contents = this.writer.getOutputString( OscSourceFile.scenario );

        this.fileService.saveFile( path, contents, ( file: IFile ) => {

            if ( this.currentFile == null ) {

                this.currentFile = new IFile( file.name, file.path );

            } else {

                this.currentFile.path = file.path;
                this.currentFile.name = file.name;

            }

            if ( callback ) callback( file );

        } );
    }

    private saveOnline ( content: string ) {

        const tmpFile = new IFile( this.currentFile.name, this.currentFile.path, content, this.currentFile.type, true );

        this.openScenarioApi.saveOpenScenario( tmpFile ).subscribe( res => {

            SnackBar.open( 'Successfully saved online' );

        } );

    }

    private saveLocally ( content: string, callback?: ( file: IFile ) => void ) {

        this.saveLocallyAt( OscSourceFile.currentFile.path, callback );

    }
}
