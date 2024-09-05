/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { FileService } from 'app/io/file.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { ViewportEvents } from '../events/viewport-events';
import { ThreeService } from '../renderer/three.service';
import { SnackBar } from './snack-bar.service';
import { AppInfo } from './app-info.service';
import { AuthService } from './auth.service';
import { EditorService } from './editor/editor.service';
import { SceneService } from './scene.service';
import { RoadService } from './road/road.service';
import { AssetService } from 'app/assets/asset.service';
import { EventServiceProvider } from 'app/listeners/event-service-provider';

@Injectable( {
	providedIn: 'root'
} )
export class AppService {

	static homeUrl = '';

	static loginUrl = '/sessions/signin';

	static eventSystem: ViewportEvents;

	static three: ThreeService;

	static electron: TvElectronService;

	static file: FileService;

	static editor: EditorService;

	constructor (
		private eventSystem: ViewportEvents,
		private electron: TvElectronService,
		private scene: SceneService,
		private snackBar: SnackBar,
		private three: ThreeService,
		public auth: AuthService,
		public files: FileService,
		public editor: EditorService,
		private roadService: RoadService,
		private assetService: AssetService,
		private eventServiceProvider: EventServiceProvider,
	) {

		AppService.eventSystem = eventSystem;
		AppService.three = three;
		AppService.electron = electron;
		AppService.file = files;
		AppService.editor = editor;

		AppInfo.electron = electron;

		this.eventServiceProvider.init();
	}

	static get isElectronApp (): boolean {

		return this.electron.isElectronApp;

	}

	public exit () {

		this.electron.remote.app.exit( 0 );

	}

}
