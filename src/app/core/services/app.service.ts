/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { FileService } from 'app/services/file.service';
import { SceneExporterService } from 'app/services/scene-exporter.service';
import { TvElectronService } from 'app/services/tv-electron.service';

import { EventSystem } from '../../events/event-system.service';
import { ThreeService } from '../../modules/three-js/three.service';
import { SnackBar } from '../../services/snack-bar.service';
import { AppInfo } from './app-info.service';
import { AuthService } from './auth.service';
import { EditorService } from './editor.service';
import { SceneService } from './scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class AppService {

	static homeUrl = '';
	static loginUrl = '/sessions/signin';

	static eventSystem: EventSystem;
	static three: ThreeService;
	static electron: TvElectronService;
	static assets: AssetLoaderService;
	static file: FileService;
	static exporter: SceneExporterService;
	static editor: EditorService;

	constructor (
		private eventSystem: EventSystem,
		private electron: TvElectronService,
		private scene: SceneService,
		private snackBar: SnackBar,
		private three: ThreeService,
		public auth: AuthService,
		public assets: AssetLoaderService,
		public files: FileService,
		sceneExporter: SceneExporterService,
		public editor: EditorService,
	) {


		AppService.eventSystem = eventSystem;
		AppService.three = three;
		AppService.electron = electron;
		AppService.assets = assets;
		AppService.file = files;
		AppService.editor = editor;

		AppService.exporter = sceneExporter;

		AppInfo.electron = electron;
	}

	static get isElectronApp (): boolean {

		return this.electron.isElectronApp;

	}

	public exit () {

		this.files.remote.app.exit( 0 );

	}

}
