/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */
//
// import { Injectable } from '@angular/core';
// import { ThreeService } from 'app/modules/three-js/three.service';
// import { IFile } from '../../../core/models/file';
// import { OpenDriveApiService } from '../../../core/services/open-drive-api.service';
// import { FileService } from '../../../services/file.service';
// import { TvMapService } from '../../tv-map/services/tv-map.service';
// import { PrivateAction } from '../models/private-action';
// import { VehicleEntityNew } from '../models/tv-entities';
// import { RoadNetwork } from '../models/tv-road-network';
// import { TvScenario } from '../models/tv-scenario';
// import { Storyboard } from '../models/tv-storyboard';
//
// @Injectable( {
// 	providedIn: 'root'
// } )
// export class BuilderService {
//
// 	private scenario: TvScenario;
// 	private currentFile: IFile;
//
// 	constructor (
// 		private openDriveService: TvMapService,
// 		private fileService: FileService,
// 		private threeService: ThreeService,
// 		private openDriveApi: OpenDriveApiService
// 	) {
// 	}
//
// 	public static buildVehicleEntity ( obj: VehicleEntityNew, executeAction = true ) {
//
// 		// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// 		// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// 		// obj.gameObject = new THREE.Mesh( geometry, material );
//
// 		// EntityBuilder.build( obj, executeAction );
//
// 	}
//
// 	// addVehicleActor ( point: THREE.Vector3 ): any {
//
// 	//   const playerName = 'New Player';
//
// 	//   const car = this.createCar( point );
//
// 	//   const entityObject = new EntityObject( playerName );
//
// 	//   this.openScenario.addEntity( entityObject );
//
// 	//   const positionAction = new PositionAction();
//
// 	//   positionAction.setPosition( WorldPosition.createFromVector3( car.position ) );
//
// 	//   const speedAction = new SpeedAction();
//
// 	//   speedAction.setAbsoluteTarget( 0 );
//
// 	//   entityObject.speedAction = speedAction;
//
// 	//   this.openScenario.storyboard.addPrivateInitAction( playerName, positionAction );
// 	//   this.openScenario.storyboard.addPrivateInitAction( playerName, speedAction );
//
// 	//   ThreeJsUtils.addComponent( car, new ComponentItem( PlayerPropertiesComponent, entityObject ) );
//
// 	// }
//
//
// 	// createCar ( point: THREE.Vector3 ): THREE.Object3D {
//
// 	//   const spriteMap = new THREE.TextureLoader().load( 'assets/img/top-view-car-red.png' );
// 	//   const geometry = new THREE.PlaneBufferGeometry( 6, 3 );
// 	//   geometry.rotateX( -Math.PI / 2 );
// 	//   const material = new THREE.MeshBasicMaterial( { map: spriteMap, transparent: true, opacity: 0.9 } );
// 	//   const car = new THREE.Mesh( geometry, material );
// 	//   car.userData.clickable = false;
// 	//   SceneService.addClickableObject( car );
//
// 	//   car.position.set( point.x, 0.1, point.z );
//
// 	//   return car;
//
// 	// }
//
//
// 	public static executePrivateAction ( obj: VehicleEntityNew, privateAction: PrivateAction ) {
//
// 		// ActionService.executePrivateAction( obj, privateAction );
//
// 	}
//
//
// 	build ( scenario: TvScenario, file: IFile ) {
//
// 		// this.scenario = scenario;
// 		// this.currentFile = file;
//
// 		// this.buildRoadNetwork( this.scenario.roadNetwork, () => {
//
// 		// 	this.buildEntities();
//
// 		// 	this.buildInitActions( this.scenario.storyboard );
//
// 		// } );
// 	}
//
// 	private buildEntities () {
//
// 		// this.scenario.objects.forEach( ( obj: EntityObject, index ) => {
//
// 		// 	// const type = obj.m_Object.constructor.name;
// 		// 	const type = CatalogReference.name;
//
// 		// 	// TODO: Replace this with enums
// 		// 	switch ( type ) {
//
// 		// 		case CatalogReference.name:
// 		// 			this.buildCatalogEntity( obj );
// 		// 			break;
//
// 		// 		case Vehicle.name:
// 		// 			Debug.log( 'type vehicle' );
// 		// 			break;
//
// 		// 		case Pedestrian.name:
// 		// 			Debug.log( 'type pedestrian' );
// 		// 			break;
//
// 		// 		case MiscObject.name:
// 		// 			Debug.log( 'type misc-object' );
// 		// 			break;
//
// 		// 	}
//
// 		// } );
//
// 	}
//
// 	private buildCatalogEntity ( obj: VehicleEntityNew ) {
//
// 		// Debug.log( 'type catalogue' );
//
// 		// BuilderService.buildVehicleEntity( obj );
//
// 	}
//
// 	private buildRoadNetwork ( roadNetwork: RoadNetwork, callbackFn: any ) {
//
// 		// // TODO: SceneAsset
// 		// // TODO: Signals
//
// 		// if ( AppService.isElectronApp ) {
//
// 		// 	if ( roadNetwork == null || roadNetwork.logics == null || roadNetwork.logics.filepath == null ) {
// 		// 		throw new Error( 'road network empty' );
// 		// 	}
//
// 		// 	let openDriveFilename = roadNetwork.logics.filepath;
//
// 		// 	if ( this.currentFile.online ) {
//
// 		// 		this.fetchFromServer( openDriveFilename, callbackFn );
//
// 		// 	} else {
//
// 		// 		let finalPath = this.fileService.resolve( this.currentFile.path, openDriveFilename );
//
// 		// 		this.openDriveService.importFromPath( finalPath, callbackFn );
// 		// 	}
//
// 		// } else {
//
// 		// 	callbackFn();
//
// 		// }
// 	}
//
// 	private buildInitActions ( storyboard: Storyboard ) {
//
// 		// Debug.log( storyboard );
//
// 		// storyboard.InitActions.PrivateActions.forEach( ( action: AbstractAction, i ) => {
// 		//
// 		//   // action.execute();
// 		//
// 		// } );
//
// 	}
//
// 	private fetchFromServer ( openDriveFilename: string, callbackFn: Function ) {
//
// 		// this.openDriveApi.getOpenDrive( openDriveFilename ).subscribe( file => {
//
// 		// 	this.openDriveService.import( file, callbackFn );
//
// 		// } );
//
// 	}
// }
