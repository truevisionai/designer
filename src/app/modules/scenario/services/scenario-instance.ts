/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { TvScenario } from '../models/tv-scenario';
import { ParameterResolver, ScenarioBuilder } from './scenario-builder.service';
import { OpenScenarioLoader } from './open-scenario.loader';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { TvConsole } from 'app/core/utils/console';
import { FileUtils } from 'app/services/file-utils';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioInstance {

	public static changed = new EventEmitter<TvScenario>();

	private static _scenario: TvScenario = new TvScenario();
	private static scenarioLoader: OpenScenarioLoader;
	private static mapService: TvMapService;

	constructor ( openScenarioImporter: OpenScenarioLoader, mapService: TvMapService ) {
		ScenarioInstance.scenarioLoader = openScenarioImporter;
		ScenarioInstance.mapService = mapService;
	}

	static get scenario () {
		return this._scenario;
	}

	static set scenario ( value ) {

		this.scenario?.destroy();

		this._scenario = value;

		this.changed.emit( value );

	}

	static async importScenario ( path: string ) {

		this.scenario?.destroy();

		const scenario = await this.scenarioLoader.loadPath( path );

		new ScenarioBuilder( scenario ).buildScenario();

		if ( !scenario?.roadNetwork?.logics?.filepath ) {

			TvConsole.error( 'No map file found for scenario' );
			return;
		}

		const directory = FileUtils.getDirectoryFromPath( path );

		const mapFilePath = this.mapService.fileService.join( directory, scenario.roadNetwork.logics.filepath );

		this.mapService.importFromPath( mapFilePath, () => {

			this.scenario = scenario;

		} );

	}
}
