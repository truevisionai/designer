/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { TvScenario } from '../models/tv-scenario';
import { ScenarioBuilder, ScenarioBuilderV2 } from './scenario-builder.service';
import { OpenScenarioImporter } from './open-scenario-importer.service';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { TvConsole } from 'app/core/utils/console';
import { FileUtils } from 'app/services/file-utils';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioInstance {

	public static changed = new EventEmitter<TvScenario>();

	private static _scenario: TvScenario = new TvScenario();
	private static openScenarioImporter: OpenScenarioImporter;
	private static mapService: TvMapService;
	private static scenarioBuilder: ScenarioBuilderV2;

	constructor ( openScenarioImporter: OpenScenarioImporter, mapService: TvMapService ) {
		ScenarioInstance.openScenarioImporter = openScenarioImporter;
		ScenarioInstance.mapService = mapService;
		ScenarioInstance.scenarioBuilder = new ScenarioBuilderV2( null, null );
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

		const contents: string = await this.mapService.fileService.readAsync( path );

		const xmlWithVariables = this.openScenarioImporter.getXMLElement( contents );

		const xml = this.scenarioBuilder.replaceParameterWithValue( xmlWithVariables );

		const scenario = this.openScenarioImporter.parseXML( xml );

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
