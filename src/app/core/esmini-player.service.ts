/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable } from '@angular/core';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { WriterService } from 'app/modules/scenario/services/tv-writer.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { EditorService } from './services/editor.service';
import { OdWriter } from 'app/modules/tv-map/services/open-drive-writer.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { FileService } from 'app/services/file.service';
import { TvConsole } from './utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class EsminiPlayerService {

	get isEnabled (): boolean {
		return this.editor.settings.esminiPath !== '';
	}

	constructor (
		private fileService: FileService,
		private odWriter: OdWriter,
		private scenarioWriter: WriterService,
		private electronService: TvElectronService,
		private editor: EditorService,
	) {
	}

	playSimulation () {

		const path = this.fileService.projectFolder + '/.temp';

		if ( !this.fileService.fs.existsSync( path ) ) {
			this.fileService.fs.mkdirSync( path );
		}

		const xodr = this.saveMap( path );

		const xosc = this.saveScenario( path );

		this.run( path, xodr, xosc );

	}

	run ( path: string, xodr: string, xosc: string ) {

		if ( ScenarioInstance.scenario.objects.size === 0 ) {

			this.runOdrViewer( path, xodr );

		} else {

			this.runScenario( path, xodr, xosc );

		}

	}

	runOdrViewer ( path: string, xodr: string ) {

		const binPath = this.editor.settings.odrViewerPath;

		const args = [ "--window", "60", "60", "800", "400", "--odr", xodr, "--path", path ];

		TvConsole.info( 'Starting odrviewer...' );

		this.electronService.spawn( binPath, args, ( data ) => {

			TvConsole.info( 'Esmini: ' + data );

		}, ( err ) => {

			TvConsole.error( 'Esmini: ' + err );

		}, ( code ) => {

			TvConsole.info( 'Esmini exited with code ' + code );

		} );

	}


	runScenario ( path: string, xodr: string, xosc: string ) {

		const binPath = this.editor.settings.esminiPath;

		const args = [ "--window", "60", "60", "800", "400", "--osc", xosc, "--path", path ];

		TvConsole.info( 'Starting esmini...' );

		this.electronService.spawn( binPath, args, ( data ) => {

			TvConsole.info( 'Esmini: ' + data );

		}, ( err ) => {

			TvConsole.error( 'Esmini: ' + err );

		}, ( code ) => {

			TvConsole.info( 'Esmini exited with code ' + code );

		} );

	}

	saveMap ( path: string ): string {

		const odString = this.odWriter.getOutput( TvMapInstance.map );

		const odFilePath = path + '/map.xodr';

		this.fileService.fs.writeFileSync( odFilePath, odString );

		ScenarioInstance.scenario.setRoadNetworkPath( 'map.xodr' );

		TvConsole.info( 'Map file written to: ' + odFilePath );

		return odFilePath;
	}

	saveScenario ( path: string ): string {

		const oscString = this.scenarioWriter.getOutputString( ScenarioInstance.scenario );

		const oscFilePath = path + '/map.xosc';

		this.fileService.fs.writeFileSync( oscFilePath, oscString );

		TvConsole.info( 'Scenario file written to: ' + oscFilePath );

		return oscFilePath;
	}

}
