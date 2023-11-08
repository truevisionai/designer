/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddObjectCommand, SelectObjectCommandv2 } from 'app/commands/select-point-command';
import { CommandHistory } from 'app/services/command-history';
import {
	CrosswalkInspectorComponent,
	ICrosswalkInspectorData
} from 'app/views/inspectors/crosswalk-inspector/crosswalk-inspector.component';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { Crosswalk, TvCornerRoad } from '../../modules/tv-map/models/tv-road-object';
import { ToolType } from '../tool-types.enum';
import { ControlPointStrategy } from '../../core/snapping/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from '../../core/snapping/select-strategies/road-coord-strategy';
import { BaseTool } from '../base-tool';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { CrosswalkObjectService } from './crosswalk-object.service';
import { OnRoadMovingStrategy } from 'app/core/snapping/move-strategies/on-road-moving.strategy';
import { RoadLineMovingStrategy } from 'app/core/snapping/move-strategies/road-line-moving.strategy';

export class CrosswalkTool extends BaseTool {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	private selectedPoint: TvCornerRoad;

	private selectedCrosswalk: Crosswalk;

	private selectedRoad: TvRoad;

	constructor ( private tool: CrosswalkObjectService ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.init();

		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );
		this.tool.base.addSelectionStrategy( new SelectRoadStrategy() );
		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
	}

	enable () {

		super.enable();

	}

	disable (): void {

		super.disable();

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

		this.tool.base.handleSelection( pointerEventData, selected => {

			if ( selected instanceof TvRoad ) {

				if ( this.selectedPoint ) this.onCornerRoadUnselected( this.selectedPoint );

				if ( this.selectedCrosswalk ) this.onCrosswalkUnselected( this.selectedCrosswalk );

				if ( this.selectedRoad === selected ) return;

				this.selectObject( selected, this.selectedRoad );

			} else if ( selected instanceof TvCornerRoad ) {

				if ( this.selectedPoint === selected ) return;

				this.selectObject( selected, this.selectedPoint );

			}

		}, () => {

			if ( this.selectedPoint ) {

				this.unselectObject( this.selectedPoint );

			} else if ( this.selectedCrosswalk ) {

				this.unselectObject( this.selectedCrosswalk );

			} else if ( this.selectedRoad ) {

				this.unselectObject( this.selectedRoad );

			}

		} );

	}

	onPointerMoved ( pointerEventData: PointerEventData ) {

		if ( !this.isPointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.selectedPoint ) return;

		this.tool.base.handleTargetMovement( pointerEventData, this.selectedRoad, position => {

			this.selectedPoint?.copyPosition( position.position );

		} );

		// if ( pointerEventData.button !== MouseButton.LEFT ) return;

		// this.selectStrategy.onPointerMoved( pointerEventData );

		// if ( !this.point?.isSelected ) return;

		// if ( !this.pointerDownAt ) return;

		// const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		// if ( !coord ) return;

		// this.point.copyPosition( coord.toPosTheta().toVector3() );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		// if ( pointerEventData.button !== MouseButton.LEFT ) return;

		// if ( !this.point?.isSelected ) return;

		// if ( !this.pointerDownAt ) return;

		// const coord = this.onRoadStrategy.onPointerMoved( pointerEventData );

		// if ( !coord ) return;

		// const position = coord.toPosTheta().toVector3();

		// if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		// CommandHistory.execute( new CopyPositionCommand( this.point, position, this.pointerDownAt ) );

	}

	addCornerRoad ( roadCoord: TvRoadCoord ) {

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoad.length;

		const point = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommandv2( point );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ) {

		const point = new TvCornerRoad( 0, roadCoord.road, roadCoord.s, roadCoord.t, roadCoord.z );

		const crosswalk = new Crosswalk( roadCoord.s, roadCoord.t );

		crosswalk.addCornerRoad( point );

		const addCommand = new AddObjectCommand( crosswalk );

		const selectCommand = new SelectObjectCommandv2( crosswalk );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onObjectAdded ( object: any ): void {

		console.log( 'onObjectAdded', object );

		if ( object instanceof Crosswalk ) {

			this.onCrosswalkAdded( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadAdded( object );

		}

	}

	onCornerRoadAdded ( object: TvCornerRoad ) {

		this.tool.addCornerRoad( this.selectedCrosswalk, object );

	}

	onCrosswalkAdded ( object: Crosswalk ) {

		this.tool.addCrosswalk( this.selectedRoad, object );

	}

	onObjectRemoved ( object: any ): void {

		console.log( 'onObjectRemoved', object );

		if ( object instanceof Crosswalk ) {

			this.tool.removeCrosswalk( this.selectedRoad, object );

		} else if ( object instanceof TvCornerRoad ) {


		}

	}

	onObjectSelected ( object: any ): void {

		console.log( 'onObjectSelected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof Crosswalk ) {

			this.onCrosswalkSelected( object );

		} else if ( object instanceof TvCornerRoad ) {

			this.onCornerRoadSelected( object );

		}

	}

	onCornerRoadSelected ( object: TvCornerRoad ) {

		if ( this.selectedPoint ) this.onCornerRoadUnselected( this.selectedPoint );

		this.selectedCrosswalk = object.mainObject;

		object?.select();

		this.selectedPoint = object;

		AppInspector.setInspector( DynamicInspectorComponent, object );

	}

	onCornerRoadUnselected ( object: TvCornerRoad ) {

		object?.unselect();

		this.selectedPoint = null;

		AppInspector.clear();

	}

	onObjectUnselected ( object: any ): void {

		console.log( 'onObjectUnselected', object );

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof Crosswalk ) {

			this.onCrosswalkUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		if ( this.selectedCrosswalk ) this.onCrosswalkUnselected( this.selectedCrosswalk );

		this.tool.showRoad( road );

		this.selectedRoad = road;
	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideRoad( road );

		this.selectedRoad = null;
	}

	onCrosswalkSelected ( crosswalk: Crosswalk ) {

		if ( this.selectedCrosswalk ) {
			this.onCrosswalkUnselected( this.selectedCrosswalk );
		}

		this.selectedCrosswalk = crosswalk;

		AppInspector.setInspector( CrosswalkInspectorComponent, crosswalk );
	}

	onCrosswalkUnselected ( crosswalk: Crosswalk ) {

		this.selectedCrosswalk = null;

		AppInspector.clear();

	}

}
