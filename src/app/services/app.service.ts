/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
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
import { RoadService } from './road/road.service';
import { RoadSplineService } from './road/road-spline.service';
import { MapService } from './map.service';
import { ObjectEventListener } from 'app/listeners/object-event-listener';
import { RoadLinkService } from './road/road-link.service';
import { AssetService } from 'app/core/asset/asset.service';
import { LaneService } from 'app/tools/lane/lane.service';
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
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
		private assetService: AssetService,
		private laneService: LaneService,
		private eventServiceProvider: EventServiceProvider,
	) {


		AppService.eventSystem = eventSystem;
		AppService.three = three;
		AppService.electron = electron;
		AppService.file = files;
		AppService.editor = editor;

		AppInfo.electron = electron;

		ManagerRegistry.registerManager( JunctionManager );
		ManagerRegistry.registerManager( EntityManager );
		ManagerRegistry.setManager( 'lane-manager', new LaneManager( this.laneService ) );
		ManagerRegistry.registerManager( MapManager );
		ManagerRegistry.registerManager( ElevationManager );
		ManagerRegistry.setManager( 'object-listener', new ObjectEventListener( this.assetService ) );
		// ManagerRegistry.registerManager( RoadSelectionListener );
		// ManagerRegistry.registerManager( RoadControlPointListener );
		ManagerRegistry.setManager( 'road-selection-listener', new RoadSelectionListener( this.roadService ) );

		ManagerRegistry.initManagers();

		this.eventServiceProvider.init();
	}

	static get isElectronApp (): boolean {

		return this.electron.isElectronApp;

	}

	public exit () {

		this.files.remote.app.exit( 0 );

	}

}
