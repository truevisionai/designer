/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseViewModel } from "../lane/visualizers/i-view-model";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { PointView } from "../lane/visualizers/point.view";
import { BaseVMInspector, RoadObjectViewModelInspector } from "./point-marking.inspector";
import { PointerEventData } from "../../events/pointer-event-data";
import { Commands } from "../../commands/commands";
import { RoadObjectService } from "app/map/road-object/road-object.service";

export class RoadObjectViewModel extends BaseViewModel<TvRoadObject, PointView> {

	constructor ( public object: TvRoadObject, private roadObjectService: RoadObjectService ) {

		super( object, PointView.create( object.getObjectPosition().toVector3() ) );

	}

	render (): void {

		super.render();

		this.roadObjectService.addRoadObject( this.object.road, this.object );

		this.rebuild();

	}

	update (): void {

		this.view.setPosition( this.object.getObjectPosition().toVector3() );

		this.rebuild();

	}

	onViewUpdated (): void {

		this.object.setPosition( this.view.getPosition() );

		this.rebuild();

	}

	remove (): void {

		super.remove();

		this.roadObjectService.removeRoadObject( this.object.road, this.object );

	}

	getInspector (): BaseVMInspector<any> {

		return new RoadObjectViewModelInspector( this );

	}

	protected override onDrag ( event: PointerEventData ): void {

		if ( !this.object.road.isPointOnRoad( event.point ) ) return;

		this.object.setPosition( event.point );

		this.view.setPosition( event.point );

		this.rebuild();

	}

	protected override onDragEnd ( event: PointerEventData ): void {

		Commands.SetPosition( this.object, this.view.getPosition(), this.dragStartAt );

		this.rebuild();

		super.onDragEnd( event );

	}

	private rebuild (): void {

		this.roadObjectService.updateRoadObjectMesh( this.object.road, this.object );

	}
}
