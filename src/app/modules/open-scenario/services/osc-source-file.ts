/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { IFile } from '../../../core/models/file';
import { OscClearHelper } from '../helpers/osc-clear-helper';
import { OscNameDB } from '../models/osc-name-db';
import { OpenScenario } from '../models/osc-scenario';

export class OscSourceFile {

	public static scenarioChanged = new EventEmitter<OpenScenario>();
	public static fileChanged = new EventEmitter<IFile>();
	public static db: OscNameDB = new OscNameDB();
	private static cleaner = new OscClearHelper();

	private static _file: IFile;

	static get file () {
		return this._file;
	}

	static set file ( value ) {
		this._file = value;
		this.fileChanged.emit( value );
	}

	private static _scenario: OpenScenario = new OpenScenario();

	static get scenario () {
		return this._scenario;
	}

	static set scenario ( value ) {

		// clean the scene first
		this.cleaner.clear( this._scenario );

		this.db.clear();

		this._scenario = value;

		this.scenarioChanged.emit( value );

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
