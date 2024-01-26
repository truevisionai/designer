/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */
//
// import { OpenDriveApiService } from 'app/core/services/open-drive-api.service';
// import { Debug } from 'app/core/utils/debug';
// import { ThreeService } from 'app/modules/three-js/three.service';
// import { TvLaneSide, TvLaneType } from 'app/modules/tv-models/models/tv-common';
// import { TvMap } from 'app/modules/tv-models/models/tv-models.model';
// import { OdWriter } from 'app/modules/tv-models/services/open-drive-writer.service';
// import { TvMapService } from 'app/modules/tv-models/services/tv-models.service';
// import { FileService } from 'app/services/file.service';
// import { TvElectronService } from 'app/services/tv-electron.service';
// import { TvMapInstance } from '../../tv-models/services/tv-models-source-file';
// import { TeleportAction } from '../models/actions/tv-teleport-action';
// import { LanePosition } from '../models/positions/tv-lane-position';
// import { WorldPosition } from '../models/positions/tv-world-position';
// import { VehicleEntityNew } from '../models/tv-entities';
// import { ActionService } from './action-service';
// import { BuilderService } from './tv-builder.service';
//
// class MockOpenDriveApiService {
//
// }
//
// describe( 'BuilderService', () => {
//
// 	let builder: BuilderService;
//
// 	let electron = new TvElectronService();
// 	let fileService = new FileService( electron, null );
//
// 	let entityObject: VehicleEntityNew;
//
// 	beforeEach( () => {
//
// 		const fake = ( new MockOpenDriveApiService ) as OpenDriveApiService;
//
// 		builder = new BuilderService(
// 			new TvMapService( fileService, new OdWriter, null, null, null ),
// 			fileService,
// 			new ThreeService(),
// 			fake
// 		);
//
// 		entityObject = new VehicleEntityNew( 'test' );
//
// 		TvMapInstance.models = new TvMap();
//
// 		const road = TvMapInstance.models.addRoad( '', 1000, 1, -1 );
//
// 		road.addGeometryLine( 0, 0, 0, 0, 1000 );
//
// 		road.addLaneSection( 0, false );
//
// 		let laneSection = road.getLastAddedLaneSection();
//
// 		laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, true, true );
// 		laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
// 		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
// 		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
// 		laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true );
//
// 		laneSection.getLaneArray().forEach( lane => {
//
// 			if ( lane.side != TvLaneSide.CENTER ) {
//
// 				lane.addWidthRecord( 0, 2, 0, 0, 0 );
//
// 			}
//
// 		} );
//
// 	} );
//
// 	it( 'should create place entities correctly', () => {
//
// 		var worldPosition = new WorldPosition( 10, 10, 0 );
//
// 		var positionAction = new TeleportAction( worldPosition );
//
// 		ActionService.executePositionAction( entityObject, positionAction );
//
// 		var placedPosition = worldPosition.toVector3();
//
// 		expect( entityObject.gameObject.position.x ).toBe( placedPosition.x );
// 		expect( entityObject.gameObject.position.y ).toBe( placedPosition.y );
// 		expect( entityObject.gameObject.position.z ).toBe( placedPosition.z );
//
// 	} );
//
// 	it( 'should create place entities correctly with LanePosition', () => {
//
// 		var lanePosition = new LanePosition( 1, -2, 0, 10 );
//
// 		var positionAction = new TeleportAction( lanePosition );
//
// 		ActionService.executePositionAction( entityObject, positionAction );
//
// 		var placedPosition = lanePosition.toVector3();
//
// 		expect( placedPosition ).not.toBeNull();
// 		expect( placedPosition ).not.toBeUndefined();
//
// 		expect( placedPosition.x ).not.toBe( 0 );
// 		expect( placedPosition.y ).not.toBe( 0 );
//
// 		Debug.log( entityObject.gameObject.position, placedPosition );
//
// 		expect( entityObject.gameObject.position.x ).toBe( placedPosition.x );
// 		expect( entityObject.gameObject.position.y ).toBe( placedPosition.y );
// 		expect( entityObject.gameObject.position.z ).toBe( placedPosition.z );
//
// 	} );
//
// 	it( 'should create place entities correctly with RoadPosition', () => {
//
// 		var lanePosition = new LanePosition( 1, -2, 0, 10 );
//
// 		var positionAction = new TeleportAction( lanePosition );
//
// 		ActionService.executePositionAction( entityObject, positionAction );
//
// 		var placedPosition = lanePosition.toVector3();
//
// 		expect( placedPosition ).not.toBeNull();
// 		expect( placedPosition ).not.toBeUndefined();
//
// 		expect( placedPosition.x ).not.toBe( 0 );
// 		expect( placedPosition.y ).not.toBe( 0 );
//
// 		expect( entityObject.gameObject.position.x ).toBe( placedPosition.x );
// 		expect( entityObject.gameObject.position.y ).toBe( placedPosition.y );
// 		expect( entityObject.gameObject.position.z ).toBe( placedPosition.z );
//
// 	} );
//
// } );
