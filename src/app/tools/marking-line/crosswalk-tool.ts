/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
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
import { OnRoadMovingStrategy } from 'app/core/snapping/move-strategies/on-road-moving.strategy';
// import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { CrosswalkToolService } from "./crosswalk-tool.service";
import { MarkingObjectInspectorData } from 'app/modules/tv-map/models/objects/marking-object-inspector-data';
import { Environment } from 'app/core/utils/environment';
import { SimpleControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { TvCornerRoad } from 'app/modules/tv-map/models/objects/tv-corner-road';

export class CrosswalkTool extends BaseTool {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	get selectedCrosswalk (): TvRoadObject {
		return this.tool.base.selection.getLastSelected<TvRoadObject>( TvRoadObject.name );
	}

	get selectedPoint (): SimpleControlPoint<TvCornerRoad> {
		return this.tool.base.selection.getLastSelected<SimpleControlPoint<TvCornerRoad>>( SimpleControlPoint.name );
	}

	get selectedRoad (): TvRoad {
		return this.tool.base.selection.getLastSelected<TvRoad>( TvRoad.name );
	}

	private debug = !Environment.production;

	private pointMoved: boolean;

	constructor ( private tool: CrosswalkToolService ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.reset();

		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
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

				this.createCornerRoad( roadCoord );

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

		if ( newPosition.distanceTo( this.pointerDownAt ) < 0.1 ) return;

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

	createCornerRoad ( roadCoord: TvRoadCoord ) {

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoad.length;

		const corner = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const point = this.tool.controlPointFactory.createSimpleControlPoint( corner, corner.getPosition() );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ) {

		const crosswalk = this.tool.factory.createRoadObject( roadCoord, ObjectTypes.crosswalk );

		const addCommand = new AddObjectCommand( crosswalk );

		const selectCommand = new SelectObjectCommand( crosswalk );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof TvRoadObject ) {

			this.onCrosswalkAdded( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointAdded( object );

		}

	}

	onControlPointAdded ( point: SimpleControlPoint<TvCornerRoad> ) {

		this.tool.addCornerRoad( this.selectedCrosswalk, point );

	}

	onCrosswalkAdded ( object: TvRoadObject ) {

		this.tool.addRoadObject( this.selectedRoad, object );

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof TvRoadObject ) {

			this.onCrosswalkUpdated( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointUpdated( object );

		} else if ( object instanceof TvObjectMarking ) {

			const roadObject = this.tool.objectService.findRoadObjectByMarking( this.selectedRoad, object );

			this.tool.objectService.updateRoadObject( this.selectedRoad, roadObject );

		}

	}

	onControlPointUpdated ( point: SimpleControlPoint<TvCornerRoad> ) {

		const roadObject = this.tool.objectService.findByCornerRoad( this.selectedRoad, point.object );

		if ( !roadObject ) {
			console.error( 'roadObject not found', roadObject );
			return;
		}

		this.tool.updateCornerPointPosition( roadObject, point, point.position );

	}

	onCrosswalkUpdated ( object: TvRoadObject ) {

		this.tool.objectService.updateRoadObject( object.road, object );

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof TvRoadObject ) {

			this.tool.removeRoadObject( this.selectedRoad, object );

			this.onCrosswalkUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.tool.removeCornerRoad( this.selectedCrosswalk, object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof TvRoadObject ) {

			this.onCrosswalkUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

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

		const marking = roadObject.markings[ 0 ];

		if ( !marking ) return;

		AppInspector.setInspector( DynamicInspectorComponent, new MarkingObjectInspectorData( roadObject, marking ) );

		this.tool.base.setHint( 'Use SHIFT + LEFT CLICK to add a point' );

	}

	onCrosswalkUnselected ( roadObject: TvRoadObject ) {

		AppInspector.clear();

		this.tool.base.setHint( 'Use SHIFT + LEFT CLICK to create a crosswalk' );

	}

	onControlPointSelected ( point: SimpleControlPoint<TvCornerRoad> ) {

		const roadObject = this.tool.objectService.findByCornerRoad( this.selectedRoad, point.mainObject );

		if ( !roadObject ) {
			console.error( 'roadObject not found', roadObject );
			return;
		}

		const marking = this.tool.objectService.findMarkingByCornerRoad( roadObject, point.mainObject );

		this.selectedPoint?.unselect();

		point.select();

		AppInspector.setInspector( DynamicInspectorComponent, new MarkingObjectInspectorData( roadObject, marking ) );

		this.tool.base.setHint( 'Drag the point to move the crosswalk' );

	}

	onCornerRoadUnselected ( point: SimpleControlPoint<TvCornerRoad> ) {

		AppInspector.clear();

		point.unselect();

	}

}
