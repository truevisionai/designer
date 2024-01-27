/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { PolePropToolService } from "./pole-prop.tool.service";
import { PointerEventData } from "app/events/pointer-event-data";
import { RoadCoordStrategy } from "app/core/strategies/select-strategies/road-coord-strategy";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { AppInspector } from "app/core/inspector";
import { TvObjectRepeat } from "app/map/models/objects/tv-object-repeat";
import { PolePropInspector } from "./pole-prop.inspector";

export class PolePropTool extends BaseTool<any>{

	name: string = 'Prop Barrier';

	toolType: ToolType = ToolType.PolePropTool;

	pole: TvRoadObject;

	constructor ( private tool: PolePropToolService ) {

		super();

	}

	init (): void {

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.handleCreation( e, ( position ) => {

			const pole = this.tool.createSmallPole( position );

			this.executeAddObject( pole );

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.objectService.addRoadObject( object.road, object );

			this.onObjectSelected( object );

		} else if ( object instanceof TvObjectRepeat ) {

			this.tool.objectService.addRepeatObject( this.pole, object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.objectService.removeRoadObject( object.road, object );

			this.onObjectUnselected( object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.pole = object;

			AppInspector.setDynamicInspector( new PolePropInspector( object ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.pole = null;

			AppInspector.clear();

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.objectService.updateRoadObject( object.road, object );

		} else if ( object instanceof PolePropInspector ) {

			this.tool.objectService.updateRoadObject( object.roadObject.road, object.roadObject );

		}

	}

	onDuplicateKeyDown (): void {

		if ( this.pole ) {

			const pole = this.tool.objectService.clone( this.pole );

			pole.s += 5;

			this.executeAddObject( pole );

		}

	}

}
