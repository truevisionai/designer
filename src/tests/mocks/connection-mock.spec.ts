import { ConnectionFactory } from "app/factories/connection.factory";
import { JunctionFactory } from "app/factories/junction.factory";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TurnType, TvContactPoint } from "app/map/models/tv-common";
import { TvRoad } from "app/map/models/tv-road.model";

function createMockConnection ( type: TurnType, incomingRoad: TvRoad, outgoingRoad: TvRoad, incomingContact?: TvContactPoint, outgoingContact?: TvContactPoint ): TvJunctionConnection {

	const entry = incomingContact ?
		incomingRoad.getContactPosition( incomingContact ).toRoadCoord( incomingRoad ) :
		incomingRoad.getEndCoord();

	const exit = outgoingContact ?
		outgoingRoad.getContactPosition( outgoingContact ).toRoadCoord( outgoingRoad ) :
		outgoingRoad.getStartCoord();

	const junction = JunctionFactory.create();

	return ConnectionFactory.createConnectionAndRoad( junction, entry, exit, type );

}

export function createMockRightConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad, incomingContact?: TvContactPoint, outgoingContact?: TvContactPoint ): TvJunctionConnection {

	return createMockConnection( TurnType.RIGHT, incomingRoad, outgoingRoad, incomingContact, outgoingContact );

}

export function createCornerConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad, incomingContact?: TvContactPoint, outgoingContact?: TvContactPoint ): TvJunctionConnection {

	const connection = createMockConnection( TurnType.RIGHT, incomingRoad, outgoingRoad, incomingContact, outgoingContact );

	connection.markAsCornerConnection();

	return connection

}

export function createMockStraightConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad, incomingContact?: TvContactPoint, outgoingContact?: TvContactPoint ): TvJunctionConnection {

	return createMockConnection( TurnType.STRAIGHT, incomingRoad, outgoingRoad, incomingContact, outgoingContact );

}

export function createMockLeftConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad, incomingContact?: TvContactPoint, outgoingContact?: TvContactPoint ): TvJunctionConnection {

	return createMockConnection( TurnType.LEFT, incomingRoad, outgoingRoad, incomingContact, outgoingContact );

}
