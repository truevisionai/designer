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
import { EntityBuilder } from "../entity/entity.builder";

@Injectable( {
	providedIn: 'root'
} )
export class ScenarioService {

	public scenario: TvScenario = new TvScenario();

	constructor (
		private openScenarioImporter: OpenScenarioLoader,
		private openDriveService: OpenDriveService,
		private storage: StorageService,
		private entityBuilder: EntityBuilder
	) {
	}

	get entities () {

		return Array.from( this.scenario?.objects?.values() || [] );

	}

	async importScenario ( path: string ): Promise<void> {

		this.destroy();

		const scenario = await this.openScenarioImporter.loadPath( path );

		if ( !scenario?.roadNetwork?.logics?.filepath ) {

			TvConsole.error( 'No models file found for scenario' );
			return;
		}

		const directory = FileUtils.getDirectoryFromPath( path );

		const mapFilePath = this.storage.join( directory, scenario.roadNetwork.logics.filepath );

		this.openDriveService.importFromPath( mapFilePath, () => {

			this.setScenario( scenario );

			// need after scenario change because action, objects in scenario are dependent
			// this.scenario to be set and correct
			const builder = new ScenarioBuilder( this.entityBuilder );

			builder.buildScenario( scenario );

		} );

	}

	getScenario (): TvScenario {

		return this.scenario;

	}

	setScenario ( scenario: TvScenario ): void {

		this.destroy();

		this.scenario = scenario;

	}

	destroy (): void {

		if ( !this.scenario ) return;

		this.scenario.db.clear();

		this.scenario.parameterDeclarations.splice( 0, this.scenario.parameterDeclarations.length );

		this.scenario.objects.forEach( entity => {

			entity.initActions.splice( 0, entity.initActions.length );

		} );

		this.scenario.storyboard.stories.forEach( story => {

			story.acts.splice( 0, story.acts.length );

		} );

		this.scenario.objects.clear();

		this.scenario.storyboard.stories.clear();

	}

}
