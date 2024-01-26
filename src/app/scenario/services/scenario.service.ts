/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileUtils } from 'app/io/file-utils';
import { TvConsole } from 'app/core/utils/console';
import { OpenDriveService } from 'app/map/services/open-drive.service';
import { TvScenario } from '../models/tv-scenario';
import { OpenScenarioLoader } from './open-scenario.loader';
import { ScenarioBuilder } from './scenario-builder.service';
import { StorageService } from 'app/io/storage.service';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioService {

	private static _scenario: TvScenario = new TvScenario();

	constructor (
		private openScenarioImporter: OpenScenarioLoader,
		private openDriveService: OpenDriveService,
		private storage: StorageService,
	) {
	}

	static get scenario () {

		return this._scenario;

	}

	static set scenario ( value ) {

		this.scenario?.destroy();

		this._scenario = value;

	}

	async importScenario ( path: string ) {

		ScenarioService.scenario?.destroy();

		const scenario = await this.openScenarioImporter.loadPath( path );

		if ( !scenario?.roadNetwork?.logics?.filepath ) {

			TvConsole.error( 'No models file found for scenario' );
			return;
		}

		const directory = FileUtils.getDirectoryFromPath( path );

		const mapFilePath = this.storage.join( directory, scenario.roadNetwork.logics.filepath );

		this.openDriveService.importFromPath( mapFilePath, () => {

			ScenarioService.scenario = scenario;

			// need after scenario change because action, objects in scenario are dependent
			// this.scenario to be set and correct
			new ScenarioBuilder( scenario ).buildScenario();

		} );

	}

	static getGlobalParameterValue ( paremeterName: string ): string {

		const declaration = this._scenario.getParameterDeclaration( paremeterName );

		if ( !declaration ) return null;

		return declaration.parameter?.getValue();

	}

	getScenario (): TvScenario {

		return ScenarioService.scenario;

	}

}
