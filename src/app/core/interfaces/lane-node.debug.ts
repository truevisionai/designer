/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugState } from 'app/services/debug/debug-state';
import { Object3D } from "three";
import { IDebugger } from './debug.service';
import { Object3DArrayMap } from '../models/object3d-array-map';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { MapService } from 'app/services/map/map.service';
import { TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { HasDistanceValue } from './has-distance-value';
import { LanePointNode } from "../../objects/lane-node";
import { RoadDistance } from 'app/map/road/road-distance';

export abstract class BaseLaneDebugService<T extends HasDistanceValue> implements IDebugger<TvLane, LanePointNode<T>> {

	public debugDrawService: DebugDrawService;

	public mapService: MapService;

	protected lines = new Object3DArrayMap<TvLane, Object3D[]>();

	protected nodes = new Object3DArrayMap<TvLane, Object3D[]>();

	abstract setDebugState ( object: TvLane, state: DebugState ): void;

	abstract onHighlight ( object: TvLane ): void;

	abstract onUnhighlight ( object: TvLane ): void;

	abstract onSelected ( object: TvLane ): void;

	abstract onUnselected ( object: TvLane ): void;

	abstract onDefault ( object: TvLane ): void;

	abstract onRemoved ( object: TvLane ): void;

	protected highlighted = new Set<TvLane>();

	protected selected = new Set<TvLane>();

	protected setBaseState ( object: TvLane, state: DebugState ): void {

		if ( !object ) return;

		switch ( state ) {

			case DebugState.DEFAULT:
				this.setDefaultState( object );
				break;

			case DebugState.HIGHLIGHTED:
				this.setHighlightState( object );
				break;

			case DebugState.SELECTED:
				this.setSelectedState( object );
				break;

			case DebugState.REMOVED:
				this.setRemovedState( object );
				break;

		}

	}

	private shouldHighlight ( object: TvLane ) {

		// we don't want to highlight selected objects
		if ( this.selected.has( object ) ) return false;

		// we don't want to highlight already highlighted objects
		if ( this.highlighted.has( object ) ) return false;

		return true;
	}

	private setHighlightState ( object: TvLane ): void {

		if ( !this.shouldHighlight( object ) ) return;

		this.highlighted.add( object );

		this.onHighlight( object );

	}

	private setDefaultState ( object: TvLane ): void {

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		if ( this.selected.has( object ) ) {

			this.onUnselected( object );

			this.selected.delete( object );

		}

		this.onDefault( object );
	}

	private setSelectedState ( object: TvLane ): void {

		if ( this.selected.has( object ) ) {

			this.onSelected( object );

			return;
		}

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.selected.add( object );

		this.onSelected( object );
	}

	private setRemovedState ( object: TvLane ): void {

		if ( this.selected.has( object ) ) {

			this.onUnselected( object );

			this.selected.delete( object );

		}

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.onRemoved( object );

	}

	resetHighlighted (): void {

		this.highlighted.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.highlighted.clear();

	}

	resetSelected (): void {

		this.selected.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.selected.clear();

	}

	updateDebugState ( object: TvLane, state: DebugState ): void {

		if ( object ) this.onRemoved( object );

		if ( object ) this.setDebugState( object, state );

	}

	clear (): void {

		this.resetHighlighted();

		this.resetSelected();

		this.nodes.clear();

		this.lines.clear();

	}

	enable (): void {

		this.mapService.roads.forEach( road => {

			road.laneSections.forEach( laneSection => {

				laneSection.getNonCenterLanes().forEach( lane => {

					this.setBaseState( lane, DebugState.DEFAULT );

				} );

			} );

		} );

	}

	addControl ( lane: TvLane, node: LanePointNode<T>, state: DebugState ): void {

		this.nodes.addItem( lane, node );

	}

	updatePosition ( lane: TvLane, control: LanePointNode<T> ): void {

		const distance = lane.laneSection.s + control.s as RoadDistance;

		const position = lane.laneSection.road.getLaneEndPosition( lane, distance );

		control.position.copy( position.position );

	}

	removeControl ( object: TvLane, control: LanePointNode<T> ): void {

		this.nodes.removeItem( object, control );

	}

	protected createLine ( node, lane: TvLane, start: number, end: number, lineWidth = 4, stepSize = 0.1 ) {

		const points = this.debugDrawService.getPoints( lane, start, end, stepSize );

		const line = this.debugDrawService.createDebugLine( node, points, lineWidth );

		return line;
	}

	protected createDashedLine ( node, lane: TvLane, start: number, end: number, lineWidth = 4, stepSize = 0.1 ) {

		const points = this.debugDrawService.getPoints( lane, start, end, stepSize );

		const line = this.debugDrawService.createDashedLine( node, points, lineWidth );

		return line;
	}
}
