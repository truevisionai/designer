import { OpenDriveApiService } from 'app/core/services/open-drive-api.service';
import { Debug } from 'app/core/utils/debug';
import { ThreeService } from 'app/modules/three-js/three.service';
import { TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { OdWriter } from 'app/modules/tv-map/services/open-drive-writer.service';
import { TvMapService } from 'app/modules/tv-map/services/tv-map.service';
import { FileService } from 'app/services/file.service';
import { ElectronService } from 'ngx-electron';
import { GameObject } from '../../../core/game-object';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { OscPositionAction } from '../models/actions/osc-position-action';
import { OscEntityObject } from '../models/osc-entities';
import { OscLanePosition } from '../models/positions/osc-lane-position';
import { OscWorldPosition } from '../models/positions/osc-world-position';
import { OscActionBuilder } from './osc-action-builder';
import { OscBuilderService } from './osc-builder.service';

class MockOpenDriveApiService {

}

describe( 'OscBuilderService', () => {

	let builder: OscBuilderService;

	let electron = new ElectronService();
	let fileService = new FileService( electron, null );

	let oscObject: OscEntityObject;

	beforeEach( () => {

		const fake = ( new MockOpenDriveApiService ) as OpenDriveApiService;

		builder = new OscBuilderService(
			new TvMapService( fileService, new OdWriter, null, null, null ),
			fileService,
			new ThreeService(),
			fake
		);

		oscObject = new OscEntityObject( 'test' );
		oscObject.gameObject = new GameObject( 'go' );
		oscObject.gameObject.name = 'go';

		TvMapInstance.map = new TvMap();

		const road = TvMapInstance.map.addRoad( '', 1000, 1, -1 );

		road.addGeometryLine( 0, 0, 0, 0, 1000 );

		road.addLaneSection( 0, false );

		let laneSection = road.getLastAddedLaneSection();

		laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.driving, true, true );
		laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
		laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, true, true );

		laneSection.getLaneVector().forEach( lane => {

			if ( lane.side != TvLaneSide.CENTER ) {

				lane.addWidthRecord( 0, 2, 0, 0, 0 );

			}

		} );

	} );

	it( 'should create place entities correctly', () => {

		var worldPosition = new OscWorldPosition( 10, 10, 0 );

		var positionAction = new OscPositionAction( worldPosition );

		OscActionBuilder.executePositionAction( oscObject, positionAction );

		var placedPosition = worldPosition.getPosition();

		expect( oscObject.gameObject.position.x ).toBe( placedPosition.x );
		expect( oscObject.gameObject.position.y ).toBe( placedPosition.y );
		expect( oscObject.gameObject.position.z ).toBe( placedPosition.z );

	} );

	it( 'should create place entities correctly with OscLanePosition', () => {

		var lanePosition = new OscLanePosition( 1, -2, 0, 10 );

		var positionAction = new OscPositionAction( lanePosition );

		OscActionBuilder.executePositionAction( oscObject, positionAction );

		var placedPosition = lanePosition.getPosition();

		expect( placedPosition ).not.toBeNull();
		expect( placedPosition ).not.toBeUndefined();

		expect( placedPosition.x ).not.toBe( 0 );
		expect( placedPosition.y ).not.toBe( 0 );

		Debug.log( oscObject.gameObject.position, placedPosition );

		expect( oscObject.gameObject.position.x ).toBe( placedPosition.x );
		expect( oscObject.gameObject.position.y ).toBe( placedPosition.y );
		expect( oscObject.gameObject.position.z ).toBe( placedPosition.z );

	} );

	it( 'should create place entities correctly with OscRoadPosition', () => {

		var lanePosition = new OscLanePosition( 1, -2, 0, 10 );

		var positionAction = new OscPositionAction( lanePosition );

		OscActionBuilder.executePositionAction( oscObject, positionAction );

		var placedPosition = lanePosition.getPosition();

		expect( placedPosition ).not.toBeNull();
		expect( placedPosition ).not.toBeUndefined();

		expect( placedPosition.x ).not.toBe( 0 );
		expect( placedPosition.y ).not.toBe( 0 );

		expect( oscObject.gameObject.position.x ).toBe( placedPosition.x );
		expect( oscObject.gameObject.position.y ).toBe( placedPosition.y );
		expect( oscObject.gameObject.position.z ).toBe( placedPosition.z );

	} );

} );
