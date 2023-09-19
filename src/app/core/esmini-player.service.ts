/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileService } from 'app/core/io/file.service';
import { OpenScenarioExporter } from 'app/modules/scenario/services/open-scenario-exporter';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { OpenDriveExporter } from 'app/modules/tv-map/services/open-drive-exporter';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvElectronService } from 'app/services/tv-electron.service';
import { EsminiInspectorComponent } from 'app/views/inspectors/esmini-inspector/esmini-inspector.component';
import { AppInspector } from './inspector';
import { EditorService } from './services/editor.service';
import { TvConsole } from './utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class EsminiPlayerService {

	logs: string[] = [];

	constructor (
		private fileService: FileService,
		private openDriveExporter: OpenDriveExporter,
		private electronService: TvElectronService,
		private editor: EditorService,
	) {
	}

	get isEnabled (): boolean {

		return true;

	}

	playSimulation () {

		this.logs.splice( 0, this.logs.length );

		AppInspector.setInspector( EsminiInspectorComponent, this.logs );

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

		const defaultPath = this.fileService.join(
			this.fileService.exeDirectory, 'esmini', this.electronService.platform, 'odrviewer'
		);

		const binPath = this.editor.settings.odrViewerPath || defaultPath;

		if ( !binPath || binPath == '' ) TvConsole.error( 'Please set the ODR Viewer path in settings' );

		if ( !binPath || binPath == '' ) return;

		const args = [ '--window', '60', '60', '800', '400', '--odr', xodr, '--path', path ];

		TvConsole.info( 'Starting odrviewer...' );

		this.electronService.spawn( binPath, args, ( data ) => {

			TvConsole.info( 'Esmini: ' + data );

			this.logs.push( data );

		}, ( err ) => {

			TvConsole.error( 'Esmini: ' + err );

			this.logs.push( err );

		}, ( code ) => {

			TvConsole.info( 'Esmini exited with code ' + code );

			this.logs.push( 'Esmini exited with code ' + code );

		} );

	}


	runScenario ( path: string, xodr: string, xosc: string ) {

		const defaultPath = this.fileService.join(
			this.fileService.exeDirectory, 'esmini', this.electronService.platform, 'esmini'
		);

		const binPath = this.editor.settings.esminiPath || defaultPath;

		if ( !binPath || binPath == '' ) TvConsole.error( 'Please set the Esmini path in settings' );

		if ( !binPath || binPath == '' ) return;

		const args = [ '--window', '60', '60', '800', '400', '--osc', xosc, '--path', path ];

		TvConsole.info( 'Starting esmini...' );

		this.electronService.spawn( binPath, args, ( data ) => {

			TvConsole.info( 'Esmini: ' + data );

			this.logs.push( data );

		}, ( err ) => {

			TvConsole.error( 'Esmini: ' + err );

			this.logs.push( err );

		}, ( code ) => {

			TvConsole.info( 'Esmini exited with code ' + code );

			this.logs.push( 'Esmini exited with code ' + code );

		} );

	}

	saveMap ( path: string ): string {

		const odString = this.openDriveExporter.getOutput( TvMapInstance.map );

		const odFilePath = path + '/map.xodr';

		this.fileService.fs.writeFileSync( odFilePath, odString );

		ScenarioInstance.scenario.setRoadNetworkPath( 'map.xodr' );

		TvConsole.info( 'Map file written to: ' + odFilePath );

		return odFilePath;
	}

	saveScenario ( path: string ): string {

		const scenarioExporter = new OpenScenarioExporter();

		const oscString = scenarioExporter.getOutputString( ScenarioInstance.scenario );

		const oscFilePath = path + '/map.xosc';

		this.fileService.fs.writeFileSync( oscFilePath, oscString );

		TvConsole.info( 'Scenario file written to: ' + oscFilePath );

		return oscFilePath;
	}

}
