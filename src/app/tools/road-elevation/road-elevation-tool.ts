/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from 'app/tools/tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { RoadElevationControlPoint } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from '../base-tool'
import { RoadElevationService } from 'app/services/road/road-elevation.service';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { Action, SerializedField } from 'app/core/components/serialization';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';

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
		private tool: RoadElevationService,
	) {
		super();
	}


	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		this.tool.base.selection.registerStrategy( RoadElevationControlPoint.name, new ControlPointStrategy<RoadElevationControlPoint>() );

		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

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

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				const elevation = this.tool.createElevation( object, e.point );

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

		const updateCommand = new UpdatePositionCommand( this.selectedNode, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.nodeChanged = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		this.tool.debug.clearLines();

		this.tool.base.selection.handleHighlight( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				this.tool.debug.highlightRoad( object );

			}

		} );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return;

		// if ( !this.tool.base.onPointerDown( e ) ) return;

		this.selectedNode.copyPosition( e.point );

		this.nodeChanged = true;

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof TvElevation ) {

			this.tool.addElevation( this.selectedRoad, object );

		}
	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof TvElevation ) {

			this.tool.updateElevation( this.selectedRoad, object );

		} else if ( object instanceof RoadElevationControlPoint ) {

			this.tool.updateElevationNode( this.selectedRoad, object, object.position );

		} else if ( object instanceof RoadElevationObject ) {

			this.tool.updateElevation( this.selectedRoad, object.elevation );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof TvElevation ) {

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

		AppInspector.setInspector( DynamicInspectorComponent, new RoadElevationObject( object.road, object.elevation ) );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );

	}

	onNodeUnselected ( object: RoadElevationControlPoint ) {

		object?.unselect();

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node' );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideControlPoints( road );

		this.setHint( 'use LEFT CLICK to select a road' );

	}

	onRoadSelected ( road: TvRoad ): void {

		this.tool.showControlPoints( road );

		this.setHint( 'use LEFT CLICK to select a node' );

	}

}


class RoadElevationObject {

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

	@Action()
	delete () {

		if ( Maths.approxEquals( this.s, 0 ) ) {

			SnackBar.warn( 'Cannot delete first node' );

		} else {

			CommandHistory.execute( new RemoveObjectCommand( this.elevation ) );
		}
	}


	// getWorldPosition (): Vector3 {

	// 	return this.road?.getPositionAt( this.elevation.s ).toVector3();

	// }

	// updateValuesAndPosition () {

	// 	TvUtils.computeCoefficients( this.road.elevationProfile.elevation, this.road.length );

	// }

	// updateByPosition ( point: Vector3 ) {

	// 	const roadCoord = this.road.getCoordAt( point );

	// 	this.elevation.s = roadCoord.s;

	// 	this.updateValuesAndPosition();

	// }

}
