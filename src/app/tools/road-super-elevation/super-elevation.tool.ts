/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from 'app/tools/tool-types.enum';
import { BaseTool } from '../base-tool';
import { Injectable } from "@angular/core";
import { DepPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { DepSelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SimpleControlPoint } from 'app/objects/simple-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { SuperElevationDebugger } from "./super-elevation.debugger";
import { SuperElevationInspector } from "./super-elevation.inspector";
import { TvSuperElevation } from "../../map/models/tv-lateral.profile";
import { RoadService } from "../../services/road/road.service";
import { PointerEventData } from 'app/events/pointer-event-data';
import { SuperElevationService } from './super-elevation.service';
import { BaseToolService } from '../base-tool.service';
import { Commands } from 'app/commands/commands';
import { RoadGeometryService } from "../../services/road/road-geometry.service";

@Injectable( {
	providedIn: 'root'
} )
export class SuperElevationToolHelper {

	constructor (
		public base: BaseToolService,
		public toolDebugger: SuperElevationDebugger,
		public roadService: RoadService,
		public elevationService: SuperElevationService,
	) {
	}

}

export class SuperElevationTool extends BaseTool<any> {

	readonly name: string = 'Road SuperElevation Tool';

	readonly toolType: ToolType = ToolType.SuperElevation;

	get selectedRoad () {
		return this.selectionService.findSelectedObject<TvRoad>( TvRoad )
	}

	constructor ( private helper: SuperElevationToolHelper ) {
		super()
	}

	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		this.setDebugService( this.helper.toolDebugger );

		this.selectionService.registerStrategy( SimpleControlPoint, new DepPointStrategy() );

		this.selectionService.registerStrategy( TvRoad, new DepSelectRoadStrategy( false, true, this.helper.toolDebugger ) );

		// this.base.addMovingStrategy( new RoadLineMovingStrategy() );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) {
			this.setHint( 'Select a road first' );
			return;
		}

		const coord = this.helper.roadService.findRoadCoord( e.point );

		if ( !coord || coord.road != this.selectedRoad ) {
			this.setHint( 'Create only on selected road' );
			return;
		}

		const current = coord.road.getLateralProfile().getSuperElevation( coord.s );

		const clone = current?.clone() || new TvSuperElevation( coord.s, 0, 0, 0, 0 );

		clone.s = coord.s;

		const point = this.helper.toolDebugger.createNode( coord.road, clone );

		this.executeAddAndSelect( point, this.currentSelectedPoint );

	}

	onPointerUp ( e: PointerEventData ): void {

		this.helper.base.enableControls();

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = e.point;

		const oldPosition = this.pointerDownAt;

		if ( oldPosition.distanceTo( newPosition ) < 0.1 ) return;

		Commands.CopyPosition( this.currentSelectedPoint, newPosition, oldPosition );

		this.currentSelectedPointMoved = false;

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		this.helper.base.disableControls();

		const coord = this.helper.roadService.findRoadCoord( e.point );

		if ( !coord || coord.road != this.selectedRoad ) return;

		const position = RoadGeometryService.instance.findRoadPosition( coord.road, coord.s );

		this.currentSelectedPoint.copyPosition( position.position );

		this.currentSelectedPointMoved = true;

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.debugService.updateDebugState( object, DebugState.SELECTED );

			this.clearInspector();

		} else if ( object instanceof SimpleControlPoint ) {

			object.select();

			this.setInspector( new SuperElevationInspector( object ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.debugService.updateDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			this.clearInspector();

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof SimpleControlPoint ) {

			object.select();

			this.helper.elevationService.add( object.userData.road, object.userData.superElevation );

			this.debugService.updateDebugState( object.userData.road, DebugState.SELECTED );

		}

	}

	onObjectUpdated ( object: any ) {

		if ( object instanceof SuperElevationInspector ) {

			this.helper.elevationService.update( object.road, object.elevation );

			this.debugService.updateDebugState( object.road, DebugState.SELECTED );

		} else if ( object instanceof SimpleControlPoint ) {

			const road = object.userData.road;

			const superElevation = object.userData.superElevation;

			const coord = this.helper.roadService.findRoadCoord( object.position );

			if ( !coord || coord.road != road ) return;

			superElevation.s = coord.s;

			this.helper.elevationService.update( road, superElevation );

			this.debugService.updateDebugState( road, DebugState.SELECTED );

		} else {

			console.error( 'Invalid object type', object, this.selectedRoad );

		}

	}

	onObjectRemoved ( object: any ) {

		if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			this.helper.elevationService.remove( object.userData.road, object.userData.superElevation );

			this.debugService.updateDebugState( this.selectedRoad, DebugState.SELECTED );

			this.clearInspector();

		}

	}

}

