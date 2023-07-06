import { VehicleEntity } from '../models/entities/vehicle-entity';
import { VehicleWaypointController } from './vehicle-waypoint-controller';

describe( 'VehicleWaypointController', () => {

	it( 'should create an instance', () => {

		expect( new VehicleWaypointController( 'name', null ) ).toBeTruthy();

	} );

	it( 'should create an instance', () => {

		const entity = new VehicleEntity( 'vehicle', );
		const controller = new VehicleWaypointController( 'name', null );

	} );


} );

