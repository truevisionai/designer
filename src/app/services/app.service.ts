/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { FileService } from 'app/io/file.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { ViewportEvents } from '../events/viewport-events';
import { ThreeService } from '../modules/three-js/three.service';
import { SnackBar } from './snack-bar.service';
import { AppInfo } from './app-info.service';
import { AuthService } from './auth.service';
import { EditorService } from './editor.service';
import { SceneService } from './scene.service';
import { ManagerRegistry } from '../managers/manager-registry';
import { JunctionManager } from '../managers/junction-manager';
import { RoadEventListener } from '../listeners/road-event-listener';
import { EntityManager } from '../managers/entity-manager';
import { LaneManager } from '../managers/lane-manager';
import { MapManager } from '../managers/map-manager';
import { ElevationManager } from '../managers/elevation-manager';
import { RoadSelectionListener } from 'app/listeners/road-selection-listener';
import { RoadControlPointListener } from 'app/listeners/road-control-point-listener';
import { RoadService } from './road/road.service';
import { RoadSplineService } from './road/road-spline.service';
import { MapService } from './map.service';
import { ObjectEventListener } from 'app/listeners/object-event-listener';
import { RoadLinkService } from './road/road-link.service';
import { AssetFactoryNew } from 'app/core/asset/asset-factory.service';

@Injectable( {
	providedIn: 'root'
} )
export class AppService {

	static homeUrl = '';
	static loginUrl = '/sessions/signin';

	static eventSystem: ViewportEvents;
	static three: ThreeService;
	static electron: TvElectronService;
	static assets: AssetLoaderService;
	static file: FileService;
	static editor: EditorService;

	constructor (
		private eventSystem: ViewportEvents,
		private electron: TvElectronService,
		private scene: SceneService,
		private snackBar: SnackBar,
		private three: ThreeService,
		public auth: AuthService,
		public assets: AssetLoaderService,
		public files: FileService,
		public editor: EditorService,
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
		private assetFactory: AssetFactoryNew,
	) {


		AppService.eventSystem = eventSystem;
		AppService.three = three;
		AppService.electron = electron;
		AppService.assets = assets;
		AppService.file = files;
		AppService.editor = editor;

		AppInfo.electron = electron;

		ManagerRegistry.setManager( 'road-event-listern', new RoadEventListener( this.roadService, this.roadSplineService, this.roadLinkService, this.mapService ) );
		ManagerRegistry.registerManager( JunctionManager );
		ManagerRegistry.registerManager( EntityManager );
		ManagerRegistry.registerManager( LaneManager );
		ManagerRegistry.registerManager( MapManager );
		ManagerRegistry.registerManager( ElevationManager );
		ManagerRegistry.setManager( 'object-listener', new ObjectEventListener( this.assetFactory ) );
		// ManagerRegistry.registerManager( RoadSelectionListener );
		// ManagerRegistry.registerManager( RoadControlPointListener );
		ManagerRegistry.setManager( 'road-selection-listener', new RoadSelectionListener( this.roadService ) );
		ManagerRegistry.setManager( 'road-control-point-listener', new RoadControlPointListener( this.roadService, this.mapService, this.roadLinkService ) );

		ManagerRegistry.initManagers();
	}

	static get isElectronApp (): boolean {

		return this.electron.isElectronApp;

	}

	public exit () {

		this.files.remote.app.exit( 0 );

	}

}
