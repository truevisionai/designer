/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SelectLaneStrategy } from "../../core/snapping/select-strategies/on-lane-strategy";
import { LaneService } from './lane.service';
import { SelectLineStrategy } from 'app/core/snapping/select-strategies/select-line-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { AddObjectCommand } from "../../commands/add-object-command";

export class LaneTool extends BaseTool {

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

	private selectedLane: TvLane;

	constructor (
		private laneService: LaneService
	) {
		super();
	}

	init (): void {

		this.laneService.base.reset();

		this.laneService.base.addSelectionStrategy( new SelectLineStrategy() );

		this.laneService.base.addSelectionStrategy( new SelectLaneStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	disable (): void {

		super.disable();

		this.laneService.base.reset();

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.laneService.base.handleSelection( e, ( selected ) => {

			if ( selected instanceof TvLane ) {

				if ( selected == this.selectedLane ) return;

				this.selectObject( selected, this.selectedLane );

			}

		}, () => {

			if ( this.selectedLane ) {

				this.unselectObject( this.selectedLane );

			}

		} );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.laneService.base.handleSelection( e, ( lane ) => {

			if ( lane instanceof TvLane ) {

				const newId = lane.isLeft ? lane.id + 1 : lane.id - 1;

				const newLane = lane.clone( newId );

				const command = new AddObjectCommand( newLane );

				CommandHistory.execute( command );

			}

		}, () => {

			// do nothing

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneAdded( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.laneService.updateLaneByType( object, object.type );

			this.laneService.updateLane( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneRemoved( object );

		}

	}

	onLaneRemoved ( lane: TvLane ) {

		this.laneService.removeLane( lane );

	}

	onLaneAdded ( lane: TvLane ) {

		this.laneService.addLane( lane );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		}

	}

	onLaneSelected ( object: TvLane ) {

		if ( this.selectedLane === object ) return;

		if ( !this.selectedLane ) this.onLaneUnselected( object );

		this.selectedLane = object;

		this.laneService.showRoad( object.laneSection.road );

		AppInspector.setInspector( DynamicInspectorComponent, object );

		this.setHint( 'use SHIFT + LEFT CLICK to duplicate a lane' );

	}

	onLaneUnselected ( object: TvLane ) {

		this.selectedLane = null;

		this.laneService.hideRoad( object.laneSection.road );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a road/lane' );
	}
}
