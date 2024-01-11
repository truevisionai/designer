/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from 'app/tools/tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { RoadElevationControlPoint } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from '../base-tool'
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { Action, SerializedField } from 'app/core/components/serialization';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import { SetValueCommand } from 'app/commands/set-value-command';
import { RoadElevationToolService } from './road-elevation-tool.service';
import { RoadLineMovingStrategy } from 'app/core/snapping/move-strategies/road-line-moving.strategy';
import { RoadPosition } from 'app/modules/scenario/models/positions/tv-road-position';
import { CopyPositionCommand, UpdatePositionCommand } from 'app/commands/copy-position-command';

export class RoadElevationTool extends BaseTool {

	name: string = 'Road Elevation Tool';

	toolType: ToolType = ToolType.RoadElevation;

	nodeChanged: boolean = false;

	debug: boolean = false;

	get selectedRoad (): TvRoad {

		return this.tool.base.selection.getLastSelected<TvRoad>( TvRoad.name );

	}

	get selectedNode (): RoadElevationControlPoint {

		return this.tool.base.selection.getLastSelected<RoadElevationControlPoint>( RoadElevationControlPoint.name );

	}

	constructor (
		private tool: RoadElevationToolService,
	) {
		super();
	}


	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		this.tool.base.selection.registerStrategy( RoadElevationControlPoint.name, new ControlPointStrategy<RoadElevationControlPoint>() );

		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		this.tool.base.addMovingStrategy( new RoadLineMovingStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.tool.base.reset();

		this.tool.debug.clear();

		this.tool.onToolDisabled();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				const elevation = this.tool.elevationService.createElevation( object, e.point );

				this.executeAddObject( elevation );

				// const addCommand = new AddObjectCommand( elevation );

				// const selectCommand = new SelectObjectCommand( node, this.selectedNode );

				// CommandHistory.executeMany( addCommand, selectCommand );

			}

		} )

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onPointerUp () {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		const newPosition = this.selectedNode.position.clone();

		const oldPosition = this.pointerDownAt.clone();

		const updateCommand = new CopyPositionCommand( this.selectedNode, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.nodeChanged = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( !this.isPointerDown ) {

			this.tool.debug.clearLines();

			this.tool.base.selection.handleHighlight( e, ( object ) => {

				if ( object instanceof TvRoad ) {

					this.tool.debug.highlightRoad( object );

				}

			} );

			return;
		}

		if ( !this.selectedRoad ) return;

		if ( !this.selectedNode ) return;

		if ( !this.selectedNode.isSelected ) return;

		this.tool.base.handleTargetMovement( e, this.selectedRoad, ( position ) => {

			if ( position instanceof RoadPosition ) {

				this.selectedNode.copyPosition( position.position );

				this.nodeChanged = true;

			}

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.addElevation( this.selectedRoad, object );

		}
	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.updateElevation( this.selectedRoad, object );

		} else if ( object instanceof RoadElevationControlPoint ) {

			this.tool.updateElevationNode( object.road, object, object.position );

		} else if ( object instanceof ElevationNodeObject ) {

			this.tool.updateElevation( object.road, object.elevation );

		} else if ( object instanceof RoadElevationObject ) {

			object.road.elevationProfile.elevation.forEach( elevation => {

				this.tool.updateElevation( object.road, elevation );

			} );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.removeElevation( this.selectedRoad, object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof RoadElevationControlPoint ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof RoadElevationControlPoint ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onNodeSelected ( object: RoadElevationControlPoint ) {

		object?.select();

		AppInspector.setInspector( DynamicInspectorComponent, new ElevationNodeObject( object.road, object.elevation ) );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );

	}

	onNodeUnselected ( object: RoadElevationControlPoint ) {

		object?.unselect();

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node' );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideControlPoints( road );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a road' );

	}

	onRoadSelected ( road: TvRoad ): void {

		this.tool.showControlPoints( road );

		AppInspector.setInspector( DynamicInspectorComponent, new RoadElevationObject( road ) );

		this.setHint( 'use LEFT CLICK to select a node' );

	}

}


class ElevationNodeObject {

	constructor (
		public road: TvRoad,
		public elevation: TvElevation
	) {
	}

	@SerializedField( { type: 'int' } )
	get s (): number {

		return this.elevation.s;

	}

	set s ( value: number ) {

		this.elevation.s = value;

	}

	@SerializedField( { type: 'int' } )
	get height (): number {

		return this.elevation.a;

	}

	set height ( value: number ) {

		this.elevation.a = value;

	}

	@Action( { label: 'Increase Elevation' } )
	increase () {

		const newValue = this.elevation.a + 1;

		const oldValue = this.elevation.a;

		CommandHistory.execute( new SetValueCommand( this.elevation, 'a', newValue, oldValue ) );

	}

	@Action( { label: 'Decrease Elevation' } )
	decrease () {

		const newValue = this.elevation.a - 1;

		const oldValue = this.elevation.a;

		CommandHistory.execute( new SetValueCommand( this.elevation, 'a', newValue, oldValue ) );

	}

	@Action()
	delete () {

		if ( Maths.approxEquals( this.s, 0 ) ) {

			SnackBar.warn( 'Cannot delete first node' );

		} else {

			CommandHistory.execute( new RemoveObjectCommand( this.elevation ) );
		}
	}

}

class RoadElevationObject {

	constructor (
		public road: TvRoad
	) {
	}

	@Action( { label: 'Increase Elevation' } )
	increase () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a + 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

	@Action( { label: 'Decrease Elevation' } )
	decrease () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a - 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

}
