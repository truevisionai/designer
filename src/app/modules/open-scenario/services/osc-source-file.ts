import { IFile } from '../../../core/models/file';
import { OpenScenario } from '../models/osc-scenario';
import { EventEmitter } from '@angular/core';
import { OscNameDB } from '../models/osc-name-db';
import { OscClearHelper } from '../helpers/osc-clear-helper';

export class OscSourceFile {

    public static scenarioChanged = new EventEmitter<OpenScenario>();
    public static fileChanged = new EventEmitter<IFile>();
    public static names: OscNameDB = new OscNameDB();

    private static _file: IFile;
    private static _scenario: OpenScenario;
    private static cleaner = new OscClearHelper();

    static get scenario () {
        return this._scenario;
    }

    static set scenario ( value ) {

        // clean the scene first
        this.cleaner.clear( this._scenario );

        this.names.clear();

        this._scenario = value;

        this.scenarioChanged.emit( value );

    }

    static get file () {
        return this._file;
    }

    static set file ( value ) {
        this._file = value;
        this.fileChanged.emit( value );
    }

    static get openScenario () {
        return this._scenario;
    }

    static set openScenario ( value ) {
        this.scenario = value;
    }

    static get currentFile () {
        return this._file;
    }

    static set currentFile ( value ) {
        this._file = value;
        this.fileChanged.emit( value );
    }

}
