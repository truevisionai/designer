/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { IFile } from '../../../core/models/file';
import { ClearHelper } from '../helpers/tv-clear-helper';
import { NameDB } from '../models/tv-name-db';
import { TvScenario } from '../models/tv-scenario';

export class TvScenarioInstance {

	public static scenarioChanged = new EventEmitter<TvScenario>();
	public static fileChanged = new EventEmitter<IFile>();
	public static db: NameDB = new NameDB();
	private static cleaner = new ClearHelper();

	private static _file: IFile;

	static get file () {
		return this._file;
	}

	static set file ( value ) {
		this._file = value;
		this.fileChanged.emit( value );
	}

	private static _scenario: TvScenario = new TvScenario();

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
