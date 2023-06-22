/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { TvScenario } from '../models/tv-scenario';
import { ScenarioBuilder } from './scenario-builder.service';
import { OpenScenarioImporter } from './tv-reader.service';

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioInstance {

	public static changed = new EventEmitter<TvScenario>();

	private static _scenario: TvScenario = new TvScenario();
	private static openScenarioImporter: OpenScenarioImporter;

	constructor ( openScenarioImporter: OpenScenarioImporter ) {
		ScenarioInstance.openScenarioImporter = openScenarioImporter;
	}

	static get scenario () {
		return this._scenario;
	}

	static set scenario ( value ) {

		this.scenario?.destroy();

		this._scenario = value;

		this.changed.emit( value );

	}

	static async loadInstanceFromPath ( path: string ) {

		this.scenario?.destroy();

		const scenario = await this.openScenarioImporter.readFromPath( path );

		ScenarioBuilder.buildScenario( scenario );

		this.scenario = scenario;

	}
}
