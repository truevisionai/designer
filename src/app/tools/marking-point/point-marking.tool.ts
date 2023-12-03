/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadMarkingManager } from 'app/modules/tv-map/services/marking-manager';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { PointMarkingToolService } from './point-marking-tool.service';
import { AppInspector } from 'app/core/inspector';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { Action, SerializedField } from 'app/core/components/serialization';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { CommandHistory } from 'app/services/command-history';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SimpleControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';

export class PointMarkingTool extends BaseTool {

	public name: string = 'Point Marking Tool';

	public toolType = ToolType.PointMarkingTool;

	get selectedRoad () {

		return this.tool.base.selection.getLastSelected<TvRoad>( TvRoad.name );

	}

	get selectedMarking () {

		return this.tool.base.selection.getLastSelected<SimpleControlPoint<TvRoadObject>>( SimpleControlPoint.name );

	}

	constructor ( private tool: PointMarkingToolService ) {

		super();

	}

	get marking () {

		return TvRoadMarkingManager.currentMarking;

	}

	init () {

		super.init();

		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

	}

	enable () {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.hideAllControls();

		this.tool.base.reset();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			if ( this.selectedRoad ) this.onObjectUnselected( this.selectedRoad );

			this.tool.showControls( object );

		} else if ( object instanceof SimpleControlPoint ) {

			if ( this.selectedMarking ) this.onObjectUnselected( this.selectedMarking );

			object.select();

			this.tool.showControls( object.mainObject.road );

			AppInspector.setDynamicInspector( new PointMarkingObject( object.mainObject ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.hideControls( object );

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.setDynamicInspector( null );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof AssetNode ) {

			const position = object.lastPosition ? object.lastPosition : null;

			if ( !position ) return;

			const roadObject = this.tool.createPointMarking( object, position );

			this.executeAddObject( roadObject );

		} else if ( object instanceof TvRoadObject ) {

			this.tool.roadObjectService.addRoadObject( object.road, object );

			this.tool.hideAllControls();

			this.tool.showControls( object.road );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.hideControls( object );

		} else if ( object instanceof TvRoadObject ) {

			this.tool.removePointMarking( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PointMarkingObject ) {

			this.tool.roadObjectService.updateRoadObject( object.roadObject.road, object.roadObject );

			this.tool.updateControls( object.roadObject );

		}

	}

	onDeleteKeyDown (): void {

		if ( !this.selectedMarking ) return;

		this.tool.removePointMarking( this.selectedMarking.mainObject );

	}

	onDuplicateKeyDown (): void {

		if ( !this.selectedMarking ) return;

		const clone = this.tool.roadObjectService.clone( this.selectedMarking.mainObject );

		clone.s += 5;

		this.executeAddObject( clone );

	}

}

class PointMarkingObject {

	constructor ( public roadObject: TvRoadObject ) { }

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s () {
		return this.roadObject.s;
	}

	set s ( value ) {
		this.roadObject.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t () {
		return this.roadObject.t;
	}

	set t ( value ) {
		this.roadObject.t = value;
	}

	@SerializedField( { 'type': 'float', label: 'Z Offset' } )
	get zOffset () {
		return this.roadObject.zOffset;
	}

	set zOffset ( value ) {
		this.roadObject.zOffset = value;
	}

	@SerializedField( { 'type': 'vector3', label: 'Rotation' } )
	get rotation () {
		return this.roadObject.rotation;
	}

	set rotation ( value ) {
		this.roadObject.rotation = value;
	}

	@SerializedField( { 'type': 'vector3', label: 'Scale' } )
	get scale () {
		return this.roadObject.scale;
	}

	set scale ( value ) {
		this.roadObject.scale = value;
	}

	@Action( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.roadObject ) );

	}

}
