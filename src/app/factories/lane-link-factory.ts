import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TravelDirection, TvLaneSide } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { LaneUtils } from "app/utils/lane.utils";
import { Assert } from "../utils/assert";

export class LaneLinkFactory {

	public static createLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

		const links: TvJunctionLaneLink[] = [];

		connection.getRoad().getLaneProfile().addDefaultLaneSection();
		connection.getLaneSection().addCenterLane();

		this.createNewLinks( connection ).forEach( link => links.push( link ) );

		return links;

	}

	private static createNewLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

		const entries = connection.getEntryCoords();
		const exits = connection.getExitCoords();

		const links: TvJunctionLaneLink[] = [];

		let id = 1;

		for ( const entry of entries ) {

			for ( const exit of exits ) {

				if ( !this.canConnect( entry, exit ) ) continue;

				const connectingLane = entry.lane.clone( id++ * -1 );

				connectingLane.side = TvLaneSide.RIGHT;

				if ( !connection.isCornerConnection ) {
					connectingLane.removeRoadMarks();
				}

				connection.getLaneSection().addLaneInstance( connectingLane );

				connectingLane.setLinks( entry.lane, exit.lane );

				links.push( new TvJunctionLaneLink( entry.lane, connectingLane ) );

				break;

			}

		}

		return links;


	}

	static canConnect ( entry: TvLaneCoord, exit: TvLaneCoord ): boolean {

		return entry.canConnect( exit );

	}

	private static createDrivingLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

		const entries = connection.getEntryCoords();
		const exits = connection.getExitCoords();

		const links: TvJunctionLaneLink[] = [];

		// NOTE: to ensure exit lane is not used twice
		// in future we might support this with multiple
		// lane sections
		const usedExits = new Set<TvLane>();

		let id = 1;

		for ( const entry of entries ) {

			if ( !entry.lane.isDrivingLane ) continue;

			const exit = this.findMatchingExitLane( entry, exits );

			if ( !exit || usedExits.has( exit.lane ) ) continue;

			usedExits.add( exit.lane );

			const connectingLane = entry.lane.clone( id++ * -1 );

			connectingLane.side = TvLaneSide.RIGHT;

			if ( !connection.isCornerConnection ) connectingLane.removeRoadMarks();

			connection.getLaneSection().addLaneInstance( connectingLane );

			connectingLane.setLinks( entry.lane, exit.lane );

			links.push( new TvJunctionLaneLink( entry.lane, connectingLane ) );

		}

		return links;

	}

	static syncLinks ( link: TvJunctionLaneLink, connection: TvJunctionConnection ): void {

		return;

		const incomingLane = link.incomingLane;
		const connectingLame = link.connectingLane;
		const outgoingLane = link.getOutgoingLane();

		const incomingContact = connection.getIncomingRoadContact();
		const outgoingContact = connection.getOutgoingRoadContact();

		const entry = incomingLane.toLaneCoord( incomingContact );
		const exit = outgoingLane.toLaneCoord( outgoingContact );

		this.syncLaneHeight( entry, exit, connectingLame );

	}

	static syncLaneHeight ( previous: TvLaneCoord, next: TvLaneCoord, currentLane: TvLane ): void {

		const previousHeight = previous.getLaneHeight();
		const nextHeight = next.getLaneHeight();

		previousHeight.sOffset = 0;
		nextHeight.sOffset = currentLane.getRoad().getLength();

		Assert.is( previousHeight.sOffset, 0, 'Lane height should not be 0' );
		Assert.isGreaterThan( nextHeight.sOffset, 0, 'Lane height should not be 0' );

		currentLane.clearLaneHeight();
		currentLane.addHeightRecordInstance( previousHeight.clone() );
		currentLane.addHeightRecordInstance( nextHeight.clone() );

	}

	private static createNonDrivingLinks ( connection: TvJunctionConnection ): TvJunctionLaneLink[] {

		const entries = connection.getIncomingCoords();
		const exits = connection.getOutgoingCoords();

		const links: TvJunctionLaneLink[] = [];

		let id = connection.getLaneSection().getLaneCount();

		for ( const entry of entries ) {

			if ( !this.isValidNonDrivingEntry( connection, entry ) ) continue;

			const exit = this.findMatchingExitLane( entry, exits );

			if ( !exit ) continue;

			const connectingLane = entry.lane.clone( id++ * -1 );

			connectingLane.side = TvLaneSide.RIGHT;

			if ( !connection.isCornerConnection ) connectingLane.removeRoadMarks();

			connection.getLaneSection().addLaneInstance( connectingLane );

			connectingLane.setLinks( entry.lane, exit.lane );

			links.push( new TvJunctionLaneLink( entry.lane, connectingLane ) );

		}

		return links;
	}

	private static isValidNonDrivingEntry ( connection: TvJunctionConnection, currentEntry: TvLaneCoord ): boolean {

		if ( currentEntry.lane.isDrivingLane ) return false;

		const boundary = connection.getEntryCoords()[ 0 ];
		const incomingContact = connection.getIncomingRoadContact();
		const incomingDirection = LaneUtils.determineDirection( incomingContact );

		if ( !boundary ) return true;

		if ( incomingDirection == TravelDirection.forward ) {

			return currentEntry.lane.id < boundary.lane.id;

		} else {

			return currentEntry.lane.id > boundary.lane.id;

		}

	}

	private static findMatchingExitLane ( entry: TvLaneCoord, exits: TvLaneCoord[] ): TvLaneCoord | undefined {

		let bestMatch: TvLaneCoord | undefined;

		let closestLane: TvLane;

		for ( const exit of exits ) {

			// lane types should match
			if ( exit.lane.type != entry.lane.type ) continue;

			if ( !entry.canConnect( exit ) ) continue;

			const currentLaneDiff = Math.abs( Math.abs( exit.lane.id ) - Math.abs( entry.lane.id ) );

			const closestLaneDiff = closestLane ? Math.abs( Math.abs( closestLane.id ) - Math.abs( entry.lane.id ) ) : Infinity;

			// Update closestLane only if it's closer to the requested laneId
			if ( currentLaneDiff < closestLaneDiff ) {
				closestLane = exit.lane;
			}

			if ( exit.lane.id === entry.lane.id ) {
				return exit; // Exact match
			}

			bestMatch = exit;

		}

		return bestMatch;

	}

	private static addWidthRecord ( connectingLane: TvLane, entry: TvLaneCoord, exit: TvLaneCoord ): void {

		const sStart = 0;

		const sEnd = connectingLane.getRoad().getLength();

		Assert.isNot( sEnd, 0, 'Road length should not be 0' );

		connectingLane.clearLaneWidth()

		connectingLane.addWidthRecord( sStart, entry.getLaneWidth(), 0, 0, 0, );

		connectingLane.addWidthRecord( sEnd, exit.getLaneWidth(), 0, 0, 0, );

	}
}
