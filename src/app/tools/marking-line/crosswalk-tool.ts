/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { CrosswalkInspectorComponent, } from 'app/views/inspectors/crosswalk-inspector/crosswalk-inspector.component';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { ToolType } from '../tool-types.enum';
import { ControlPointStrategy } from '../../core/snapping/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from '../../core/snapping/select-strategies/road-coord-strategy';
import { BaseTool } from '../base-tool';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { RoadObjectService } from './road-object.service';
import { OnRoadMovingStrategy } from 'app/core/snapping/move-strategies/on-road-moving.strategy';
import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvObjectOutline } from 'app/modules/tv-map/models/objects/tv-object-outline';

export class CrosswalkTool extends BaseTool {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	get selectedCrosswalk (): TvRoadObject {
		return this.tool.base.selection.getLastSelected<TvRoadObject>( TvRoadObject.name );
	}

	get selectedPoint (): TvCornerRoad {
		return this.tool.base.selection.getLastSelected<TvCornerRoad>( TvCornerRoad.name );
	}

	get selectedRoad (): TvRoad {
		return this.tool.base.selection.getLastSelected<TvRoad>( TvRoad.name );
	}

	private debug = false;

	private pointMoved: boolean;

	constructor ( private tool: RoadObjectService ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.reset();

		this.tool.base.selection.registerStrategy( TvCornerRoad.name, new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( TvRoadObject.name, new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.tool.base.setHint( 'Use LEFT CLICK to select a road' );
	}

	enable () {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		this.tool.base.handleCreation( e, ( roadCoord: TvRoadCoord ) => {

			if ( !this.selectedCrosswalk ) {

				this.createCrosswalk( roadCoord );

			} else {

				this.addCornerRoad( roadCoord );

			}

		} );

	}

	onPointerDownSelect ( pointerEventData: PointerEventData ) {

		this.tool.base.selection.handleSelection( pointerEventData );

	}

	onPointerMoved ( pointerEventData: PointerEventData ) {

		if ( !this.isPointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.selectedPoint ) return;

		if ( !this.selectedPoint.isSelected ) return;

		this.tool.base.handleTargetMovement( pointerEventData, this.selectedRoad, position => {

			this.selectedPoint?.copyPosition( position.position );

		} );

		this.pointMoved = true;
	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		if ( !this.selectedPoint ) return;

		if ( !this.selectedPoint.isSelected ) return;

		if ( !this.pointMoved ) return;

		const oldPosition = this.pointerDownAt.clone();

		const newPosition = this.selectedPoint.position.clone();

		if ( newPosition.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		const updateCommand = new UpdatePositionCommand( this.selectedPoint, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.pointMoved = false;

	}

	onDeleteKeyDown (): void {

		if ( this.selectedPoint && this.selectedCrosswalk ) {

			this.executeRemoveObject( this.selectedPoint );

		} else if ( this.selectedCrosswalk && this.selectedRoad ) {

			this.executeRemoveObject( this.selectedCrosswalk );

		}

	}

	addCornerRoad ( roadCoord: TvRoadCoord ) {

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoad.length;

		const point = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ) {

		const point = new TvCornerRoad( 0, roadCoord.road, roadCoord.s, roadCoord.t, roadCoord.z );

		const marking = new TvObjectMarking();

		marking.addCornerRoad( point );

		const outline = new TvObjectOutline();

		outline.cornerRoad.push( point );

		const crosswalk = new TvRoadObject( ObjectTypes.crosswalk, 'crosswalk', TvRoadObject.counter++, roadCoord.s, roadCoord.t );

		crosswalk.outlines.push( outline );

		crosswalk.markings.push( marking );

		const addCommand = new AddObjectCommand( crosswalk );

		const selectCommand = new SelectObjectCommand( crosswalk );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof TvRoadObject ) {

			this.onCrosswalkAdded( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadAdded( object );

		}

	}

	onCornerRoadAdded ( object: TvCornerRoad ) {

		this.tool.addCornerRoad( this.selectedCrosswalk, object );

	}

	onCrosswalkAdded ( object: TvRoadObject ) {

		this.tool.addRoadObject( this.selectedRoad, object );

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof TvRoadObject ) {

			this.onCrosswalkUpdated( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadUpdated( object );

		}

	}

	onCornerRoadUpdated ( object: TvCornerRoad ) {

		const roadObject = this.tool.findRoadObject( this.selectedRoad, object );

		if ( !roadObject ) return;

		this.tool.updateRoadObject( object.road, roadObject );

	}

	onCrosswalkUpdated ( object: TvRoadObject ) {

		this.tool.updateRoadObject( object.road, object );

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof TvRoadObject ) {

			this.tool.removeRoadObject( this.selectedRoad, object );

		} else if ( object instanceof TvCornerRoad ) {

			this.tool.removeCornerRoad( this.selectedCrosswalk, object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkSelected( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkUnselected( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		this.selectedPoint?.unselect();

		this.tool.showRoad( road );

		this.tool.base.setHint( 'Use SHIFT + LEFT CLICK to create a crosswalk' );
	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideRoad( road );

		this.tool.base.setHint( 'Use LEFT CLICK to select a road' );
	}

	onCrosswalkSelected ( roadObject: TvRoadObject ) {

		AppInspector.setInspector( DynamicInspectorComponent, roadObject );

		this.tool.base.setHint( 'Use SHIFT + LEFT CLICK to add a point' );
	}

	onCrosswalkUnselected ( roadObject: TvRoadObject ) {

		AppInspector.clear();

		this.tool.base.setHint( 'Use SHIFT + LEFT CLICK to create a crosswalk' );

	}

	onCornerRoadSelected ( object: TvCornerRoad ) {

		const roadObject = this.tool.findRoadObject( this.selectedRoad, object );

		this.selectedPoint?.unselect();

		object.select();

		AppInspector.setInspector( DynamicInspectorComponent, roadObject );

		this.tool.base.setHint( 'Drag the point to move the crosswalk' );

	}

	onCornerRoadUnselected ( object: TvCornerRoad ) {

		object.unselect();

		AppInspector.clear();

	}

}
