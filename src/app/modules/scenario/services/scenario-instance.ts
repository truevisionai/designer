/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { FileUtils } from 'app/io/file-utils';
import { TvConsole } from 'app/core/utils/console';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { TvScenario } from '../models/tv-scenario';
import { OpenScenarioLoader } from './open-scenario.loader';
import { ScenarioBuilder } from './scenario-builder.service';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioInstance {

	public static changed = new EventEmitter<TvScenario>();
	private static scenarioLoader: OpenScenarioLoader;
	private static mapService: TvMapService;

	constructor ( openScenarioImporter: OpenScenarioLoader, mapService: TvMapService ) {
		ScenarioInstance.scenarioLoader = openScenarioImporter;
		ScenarioInstance.mapService = mapService;
	}

	private static _scenario: TvScenario = new TvScenario();

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

		if ( !scenario?.roadNetwork?.logics?.filepath ) {

			TvConsole.error( 'No map file found for scenario' );
			return;
		}

		const directory = FileUtils.getDirectoryFromPath( path );

		const mapFilePath = this.mapService.fileService.join( directory, scenario.roadNetwork.logics.filepath );

		this.mapService.importFromPath( mapFilePath, () => {

			this.scenario = scenario;

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

}
