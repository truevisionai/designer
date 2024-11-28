import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";

export const EXPECT_LINKS = {
	X_JUNCTION: 20,
	T_JUNCTION: 12,
	TWO_ROAD: 6
}

export const EXPECT_CONNECTION = {
	X_JUNCTION: 12,
	T_JUNCTION: 6,
	TWO_ROAD: 2
}

export function expectXJunction ( junction: TvJunction, message?: string ): void {

	expect( junction ).toBeDefined();

	if ( !junction ) return;

	expect( junction.getConnectionCount() ).toBe( EXPECT_CONNECTION.X_JUNCTION );
	expect( junction.getLaneLinkCount() ).toBe( EXPECT_LINKS.X_JUNCTION );
	expect( junction.getIncomingRoadCount() ).toBe( 4 );

	for ( const connection of junction.getConnections() ) {
		expectValidConnection( connection );
	}

	for ( const road of junction.getIncomingRoads() ) {
		const connections = junction.getConnectionsByRoad( road );
		expect( connections.length ).toBeGreaterThan( 0, `${ road.toString() } has no connections with ${ junction.toString() }` );
	}
}

export function expectTJunction ( junction: TvJunction, message?: string ): void {

	expect( junction ).toBeDefined();

	if ( !junction ) return;

	expect( junction.getConnectionCount() ).toBe( EXPECT_CONNECTION.T_JUNCTION );
	expect( junction.getLaneLinkCount() ).toBe( EXPECT_LINKS.T_JUNCTION );
	expect( junction.getIncomingRoadCount() ).toBe( 3 );

	for ( const connection of junction.getConnections() ) {
		expectValidConnection( connection );
	}

}

export function expect2RoadJunction ( junction: TvJunction, message?: string ): void {

	expect( junction ).toBeDefined();

	if ( !junction ) return;

	expect( junction.getConnectionCount() ).toBe( EXPECT_CONNECTION.TWO_ROAD );
	expect( junction.getLaneLinkCount() ).toBe( EXPECT_LINKS.TWO_ROAD );

	for ( const connection of junction.getConnections() ) {
		expectValidConnection( connection );
	}

}

export function expectValidConnection ( connection: TvJunctionConnection, message?: string ): void {

	expect( connection ).toBeDefined();

	expect( connection.getLinkCount() ).toBeGreaterThan( 0 );
	expect( connection.getPredecessorLink() ).toBeDefined();
	expect( connection.getSuccessorLink() ).toBeDefined();

}
