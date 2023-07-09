/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { SnackBar } from 'app/services/snack-bar.service';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData, PointerMoveData } from '../../events/pointer-event-data';
import { SignalFactory } from '../../modules/tv-map/builders/signal-factory';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { StaticSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { KeyboardInput } from '../input';
import { ToolType } from '../models/tool-types.enum';
import { SceneService } from '../services/scene.service';
import { IMovable } from '../snapping/snapping';
import { BaseTool } from './base-tool';

export class RoadSignalTool extends BaseTool {

	public name: string = 'RoadSignalTool';

	public toolType = ToolType.RoadSignalTool;

	public signal: StaticSignal;

	private movingStrategy: SignalMoveStrategy;

	constructor () {

		super();

		this.movingStrategy = new SignalMoveStrategy();
	}


	onPointerDown ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( !KeyboardInput.isShiftKeyDown ) return;

		const posTheta = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( e.point?.x, e.point?.y, posTheta );

		if ( !road ) {

			SnackBar.warn( 'Please select/create a road' );

			return;
		}

		const signal = this.signal = new StaticSignal( posTheta.s, posTheta.t );

		signal.roadId = road.id;

		signal.controlPoint = AnyControlPoint.create( '', e.point );

		SceneService.add( signal.controlPoint );

		signal.height = 1.5;

		SignalFactory.createSignal( road, signal );

	}

	onPointerMoved ( pointerEventData: PointerMoveData ): void {

		if ( this.pointerDownAt && this.signal ) {

			this.movingStrategy.move( this.signal, pointerEventData.point );

		}

	}
}

class RoadSnapMoveStrategy {

	static move ( object: IMovable, road: TvRoad, posTheta, position: Vector3 ) {

		const finalPosition = road.getPositionAt( posTheta.s, 0 ).toVector3();

		object.move( finalPosition );

	}
}


class SignalMoveStrategy {

	move ( object: StaticSignal, position: Vector3 ) {

		const road = object.getRoad();

		const posTheta = road.getCoordAt( position );

		const distance = posTheta.toVector3().distanceTo( position );

		if ( distance < 1 ) {

			RoadSnapMoveStrategy.move( object, road, posTheta, position );

		} else {

			object.move( position );

		}

	}

}

