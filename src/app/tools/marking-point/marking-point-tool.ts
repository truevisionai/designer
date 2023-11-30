/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetPositionCommand } from 'app/commands/set-position-command';
import { SetValueCommand } from 'app/commands/set-value-command';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { MarkingTypes, TvRoadMarkingManager, TvRoadMarking } from 'app/modules/tv-map/services/marking-manager';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { Subscription } from 'rxjs';
import { AbstractShapeEditor } from '../../core/editors/abstract-shape-editor';
import { PointEditor } from '../../core/editors/point-editor';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
// import { CreateMarkingPointCommand } from './create-marking-point-command';
import { AnyControlPoint } from "../../modules/three-js/objects/any-control-point";

export abstract class BaseMarkingTool extends BaseTool {

}

export class MarkingPointTool extends BaseMarkingTool {

	public name: string = 'MarkingPointTool';
	public toolType = ToolType.MarkingPoint;

	public shapeEditor: AbstractShapeEditor;
	public currentMarking: TvRoadMarking;
	private hasSignal = false;
	private selectedSignal: TvRoadSignal;
	private cpSubscriptions: Subscription[] = [];
	private cpAddedSub: Subscription;
	private cpSelectedSub: Subscription;
	private cpUnselectedSub: Subscription;
	private cpMovedSub: Subscription;
	private cpUpdatedSub: Subscription;

	constructor () {

		super();

	}

	get marking () {

		return TvRoadMarkingManager.currentMarking;

	}

	init () {

		super.init();

		this.shapeEditor = new PointEditor();

	}

	enable () {

		super.enable();

		// this.cpAddedSub = this.shapeEditor.controlPointAdded
		// 	.subscribe( point => this.onControlPointAdded( point ) );

		// this.cpSelectedSub = this.shapeEditor.controlPointSelected
		// 	.subscribe( point => this.onControlPointSelected( point ) );

		// this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
		// 	.subscribe( point => this.onControlPointUnselected( point ) );

		// this.cpMovedSub = this.shapeEditor.controlPointMoved
		// 	.subscribe( ( point ) => this.onControlPointMoved( point ) );

		// this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
		// 	.subscribe( ( point ) => this.onControlPointUpdated( point ) );
	}


	disable (): void {

		super.disable();

		// this.cpAddedSub.unsubscribe();
		// this.cpSelectedSub.unsubscribe();
		// this.cpUnselectedSub.unsubscribe();
		// this.cpMovedSub?.unsubscribe();
		// this.cpUpdatedSub?.unsubscribe();

		// this.shapeEditor.destroy();

	}

	// private onControlPointAdded ( point: AnyControlPoint ) {

	// 	if ( this.marking && this.marking.type === MarkingTypes.point ) {

	// 		CommandHistory.execute( new CreateMarkingPointCommand( this, this.marking, point ) );

	// 	} else {

	// 		SnackBar.warn( 'Select a marking from project browser' );

	// 		point.visible = false;

	// 		setTimeout( () => {

	// 			this.shapeEditor.removeControlPoint( point );

	// 		}, 100 );

	// 	}

	// }

	// private onControlPointSelected ( point: AnyControlPoint ) {

	// 	if ( this.currentMarking == null || point == null ) return;

	// 	if ( this.currentMarking === point.mainObject ) return;

	// 	CommandHistory.executeMany(
	// 		new SetValueCommand( this, 'currentMarking', point.mainObject )
	// 	);

	// }

	// private onControlPointMoved ( point: AnyControlPoint ) {

	// 	if ( point.mainObject == null ) return;

	// 	this.currentMarking = point.mainObject;

	// 	this.currentMarking?.mesh.position.copy( point.position );

	// }

	// private onControlPointUpdated ( point: AnyControlPoint ): void {

	// 	if ( !this.currentMarking ) return;

	// 	const oldPosition = this.shapeEditor.pointerDownAt;

	// 	const newPosition = point.position;

	// 	if ( oldPosition == null || newPosition == null ) return;

	// 	if ( oldPosition.equals( newPosition ) ) return;

	// 	CommandHistory.executeMany(
	// 		new SetPositionCommand( this.currentMarking.mesh, newPosition, oldPosition ),

	// 		new SetPositionCommand( point, newPosition, oldPosition ),
	// 	);
	// }

	// private onControlPointUnselected ( point: AnyControlPoint ): void {

	// 	this.currentMarking = null;

	// }

}
