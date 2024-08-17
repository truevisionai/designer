/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvConsole } from 'app/core/utils/console';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TrafficRule } from 'app/map/models/traffic-rule';
import { TvContactPoint, TvLaneSide, TvLaneType, TvOrientation } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSignalFactory } from 'app/map/road-signal/road-signal.factory';
import { TvReferenceElementType, TvRoadSignal, TvSignalDependencyType } from 'app/map/road-signal/tv-road-signal.model';
import { TvSignalControllerFactory } from 'app/map/signal-controller/tv-signal-controller.factory';
import { RoadService } from 'app/services/road/road.service';
import { TvSignalControllerService } from "../../map/signal-controller/tv-signal-controller.service";
import { TvJunctionController } from "../../map/models/junctions/tv-junction-controller";
import { RoadSignalService } from "../../map/road-signal/road-signal.service";
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { LaneUtils } from 'app/utils/lane.utils';
import { Log } from 'app/core/utils/log';
import { RoadGeometryService } from "../../services/road/road-geometry.service";

export enum AutoSignalizationType {
	ALL_GO,
	ALL_STOP,
	ALL_YIELD,
	SPIT_PHASE,
	PROTECTED_LEFT,
	PERMITTED_LEFT,
}

@Injectable( {
	providedIn: 'root'
} )
export class AutoSignalizeJunctionService {

	constructor (
		private signalFactory: RoadSignalFactory,
		private signalService: RoadSignalService,
		private roadService: RoadService,
		private controllerService: TvSignalControllerService,
		private controllerFactory: TvSignalControllerFactory
	) {
	}

	removeSignalization ( junction: TvJunction ) {

		this.removeControllers( junction );

		this.removeSignals( junction );

	}

	addSignalization ( junction: TvJunction, type: AutoSignalizationType, useProps = false ) {

		this.removeControllers( junction );

		// TODO: instead of incoming roads, we need connecting road to have junctions
		// currenlty we are using incoming roads
		// because connecting roads are automatically created by the junction
		for ( const road of junction.getIncomingRoads() ) {

			const signals: TvRoadSignal[] = [];

			const signal = this.getSignalByType( road, type, junction );

			if ( !signal ) {
				Log.error( 'No signal created for road:' + road.id );
				continue;
			}

			signals.push( signal );

			const stopLine = this.createStopLine( road, signal );

			if ( stopLine ) {

				this.updateValidLanes( stopLine, road, stopLine.s, junction );

				signals.push( stopLine );

			}

			signals.forEach( signal => {

				const existingSignal = this.signalService.findSignal( road, signal );

				if ( existingSignal ) {
					this.signalService.removeSignal( road, existingSignal );
				}

				road.addSignal( signal );

			} );

			this.addControllers( type, junction, signals );

			this.roadService.update( road );
		}

	}

	private getSignalByType ( road: TvRoad, type: AutoSignalizationType, junction: TvJunction ) {

		const roadCoord = this.findSignalPosition( road, type, junction );

		let signal: TvRoadSignal;

		switch ( type ) {

			case AutoSignalizationType.ALL_GO:
				// no signal needed for all go
				break;

			case AutoSignalizationType.ALL_STOP:
				signal = this.signalFactory.createPoledSign( roadCoord, 'StopSignal', '206', '-1' );
				break;

			case AutoSignalizationType.ALL_YIELD:
				signal = this.signalFactory.createPoledSign( roadCoord, 'YieldSignal', '205', '-1' );
				break;

			case AutoSignalizationType.SPIT_PHASE:
				signal = this.signalFactory.createTrafficLight( roadCoord, 'TrafficLight', '1000001', '-1' );
				break;

			default:
				Log.error( 'Invalid signal type' );
				return;
		}

		if ( !signal ) return;

		const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

		signal.orientation = this.findOrientation( contactPoint );

		return signal;

	}

	findSignalPosition ( road: TvRoad, type: AutoSignalizationType, junction: TvJunction ): TvRoadCoord {

		const lane = this.findPlacementLane( road, junction );

		if ( !lane ) {
			Log.error( 'No suitable lane found for road:' + road.id );
			TvConsole.error( 'No suitable lane found for road:' + road.id );
			return;
		}

		const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

		const s = contactPoint == TvContactPoint.START ? 0 : road.length;

		const posTheta = road.getLaneCenterPosition( lane, s );

		const roadCoord = posTheta.toRoadCoord( road );

		return roadCoord;

	}

	createStopLine ( road: TvRoad, trafficSignal: TvRoadSignal ) {

		const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

		const roadCoord = RoadGeometryService.instance.findContactCoord( road, contactPoint );

		const stopLine = this.signalFactory.createStopLine( roadCoord, 'StopLine', '294' );

		stopLine.orientation = this.findOrientation( contactPoint );

		stopLine.addDependency( trafficSignal.id, TvSignalDependencyType.TrafficLight );

		trafficSignal.addReference( stopLine.id, TvReferenceElementType.Signal, "stopLine" );

		return stopLine;

	}

	private findPlacementLane ( road: TvRoad, junction: TvJunction ): TvLane | undefined {

		const sidewalk = this.getLane( road, junction, TvLaneType.sidewalk );
		if ( sidewalk ) return sidewalk;

		const curb = this.getLane( road, junction, TvLaneType.curb );
		if ( curb ) return curb;

		const shoulder = this.getLane( road, junction, TvLaneType.shoulder );
		if ( shoulder ) return shoulder;

	}

	private getLane ( road: TvRoad, junction: TvJunction, laneType: TvLaneType ): TvLane {

		const contactPoint = road.successor?.element == junction ? TvContactPoint.END : TvContactPoint.START;

		const s = contactPoint == TvContactPoint.START ? 0 : road.length;

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const side = this.getForwardSide( road, contactPoint );

		if ( side == TvLaneSide.LEFT ) {

			return LaneUtils.findHighest( laneSection.getLaneArray(), laneType );

		} else if ( side == TvLaneSide.RIGHT ) {

			return LaneUtils.findLowest( laneSection.getLaneArray(), laneType );

		} else {

			Log.error( 'Invalid contact point' );

		}

	}

	private getForwardSide ( road: TvRoad, contactPoint: TvContactPoint ): TvLaneSide {

		let side = road.trafficRule == TrafficRule.LHT ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

		// if road contact is start then reverse the side
		if ( contactPoint == TvContactPoint.START ) {

			side = side == TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;

		}

		return side;
	}

	private findOrientation ( contact: TvContactPoint ): TvOrientation {

		if ( contact == TvContactPoint.START ) {
			return TvOrientation.MINUS;
		}

		return TvOrientation.PLUS;

	}

	private updateValidLanes ( signal: TvRoadSignal, road: TvRoad, s: number, junction: TvJunction ) {

		/**
		Rules
		The following rules apply to validity elements:
		A signal may be valid for one or more lanes.
		The range given by all <validity> elements shall be a subset of the parent’s @orientation attribute:

		For right-hand traffic, @orientation="+" implies that the <validity> element shall only span negative lane ids,
		while @orientation="-" implies that the <validity> element shall only span positive lane ids.
		If the given <validity> elements span both, positive and negative lane ids, @orientation="none" shall be used.

		For left-hand-traffic, @orientation="-" implies that the <validity> element shall only span negative lane ids,
		while @orientation="+" implies that the <validity> element shall only span positive lane ids.
		If the given <validity> elements span both, positive and negative lane ids, @orientation="none" shall be used.

		The value of the @fromLane attribute shall be lower than or equal to the value of the @toLane attribute.
		**/

		const contactPoint = road.successor?.element == junction ? TvContactPoint.END : TvContactPoint.START;

		const side = this.getForwardSide( road, contactPoint );

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const drivingLanes = laneSection.getLaneArray().filter( lane => lane.type == TvLaneType.driving && lane.side == side ).map( lane => lane.id );

		// TODO: this is not correct, we need to find the lane with the signal
		const minLaneId = Math.min( ...drivingLanes );
		const maxLaneId = Math.max( ...drivingLanes );

		signal.addValidity( minLaneId, maxLaneId );
	}

	private removeControllers ( junction: TvJunction ) {

		// remove existing controllers from junction and map
		for ( const controller of junction.controllers ) {

			this.controllerService.removeController( controller.id );

			junction.controllers = junction.controllers.filter( c => c.id != controller.id );

		}

	}

	private addControllers ( type: AutoSignalizationType, junction: TvJunction, signals: TvRoadSignal[] ) {

		// controllers are only needed in split phase
		if ( type != AutoSignalizationType.SPIT_PHASE ) return;

		const controller = this.controllerFactory.createNewController();

		signals.forEach( signal => controller.addControl( signal.id, signal.type ) );

		this.controllerService.addController( controller );

		const junctionController = new TvJunctionController( controller.id, controller.name );

		junction.addController( junctionController );

	}

	private removeSignals ( junction: TvJunction ) {

		for ( const road of junction.getIncomingRoads() ) {

			const signals = this.signalService.findSignalsByType( road, [ '206', '205', '294', '1000001' ] );

			for ( const signal of signals ) {

				this.signalService.removeSignal( road, signal );

			}

			this.roadService.update( road );
		}

	}
}
