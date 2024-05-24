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

		this.removeControllers( junction, AutoSignalizationType.SPIT_PHASE );

		for ( const road of junction.getIncomingRoads() ) {

			// const position = this.findSignalPosition( road, AutoSignalizationType.ALL_GO );

			const signals = this.signalService.findSignalsByType( road, [ '206', '205', '294', '100001' ] );

			for ( const signal of signals ) {

				this.signalService.removeSignal( road, signal );

			}

			this.roadService.update( road );
		}

	}

	addSignalization ( junction: TvJunction, type: AutoSignalizationType, useProps = false ) {

		this.removeControllers( junction, type );

		for ( const road of junction.getIncomingRoads() ) {

			const signals: TvRoadSignal[] = [];

			const signal = this.getSignalByType( road, type );

			if ( !signal ) continue;

			signals.push( signal );

			const stopLine = this.createStopLine( road, signal );

			if ( stopLine ) {

				this.updateValidLanes( stopLine, road, stopLine.s );

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

	private getSignalByType ( road: TvRoad, type: AutoSignalizationType ) {

		const roadCoord = this.findSignalPosition( road, type );

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
				return;
		}

		if ( !signal ) return;

		const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

		signal.orientation = this.findOrientation( contactPoint );

		return signal;

	}

	findSignalPosition ( road: TvRoad, type: AutoSignalizationType ): TvRoadCoord {

		const lane = this.findPlacementLane( road );

		if ( !lane ) {
			TvConsole.error( 'No suitable lane found for road:' + road.id );
			console.error( 'No suitable lane found for road', road.laneSections );
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

		const roadCoord = road.getRoadCoordByContact( contactPoint );

		const stopLine = this.signalFactory.createStopLine( roadCoord, 'StopLine', '294' );

		stopLine.orientation = this.findOrientation( contactPoint );

		stopLine.addDependency( trafficSignal.id, TvSignalDependencyType.TrafficLight );

		trafficSignal.addReference( stopLine.id, TvReferenceElementType.Signal, "stopLine" );

		return stopLine;

	}

	private findPlacementLane ( road: TvRoad ): TvLane | undefined {

		const contactPoint = road.successor?.isJunction ? TvContactPoint.END : TvContactPoint.START;

		const s = contactPoint == TvContactPoint.START ? 0 : road.length;

		const laneSection = road.getLaneSectionAt( s );

		let side = road.trafficRule == TrafficRule.LHT ? TvLaneSide.LEFT : TvLaneSide.RIGHT;

		// if road contact is start then reverse the side
		if ( contactPoint == TvContactPoint.START ) {

			side = side == TvLaneSide.LEFT ? TvLaneSide.RIGHT : TvLaneSide.LEFT;

		}

		const sidewalk = laneSection.getLaneArray().find( lane => lane.side == side && lane.type == TvLaneType.sidewalk );

		if ( sidewalk ) return sidewalk;

		const curb = laneSection.getLaneArray().find( lane => lane.type == TvLaneType.curb );

		if ( curb ) return curb;

	}

	private findOrientation ( contact: TvContactPoint ): TvOrientation {

		if ( contact == TvContactPoint.START ) {
			return TvOrientation.MINUS;
		}

		return TvOrientation.PLUS;

	}

	private updateValidLanes ( signal: TvRoadSignal, road: TvRoad, s: number ) {

		const laneSection = road.getLaneSectionAt( s );

		const lanes = laneSection.getLaneArray();

		const nonDrivingLanes = lanes.filter( lane => lane.type == TvLaneType.sidewalk || lane.type == TvLaneType.curb );

		const laneIds = nonDrivingLanes.map( lane => lane.id );

		const minLaneId = Math.min( ...laneIds );

		const maxLaneId = Math.max( ...laneIds );

		signal.addValidity( minLaneId, maxLaneId );
	}

	private removeControllers ( junction: TvJunction, type: AutoSignalizationType ) {

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

		junction.controllers.push( new TvJunctionController( controller.id, controller.name ) );

	}
}
