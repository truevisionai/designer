/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetPositionCommand } from 'app/modules/three-js/commands/set-position-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { AssetDatabase } from 'app/services/asset-database';
import { CommandHistory } from 'app/services/command-history';
import { ModelImporterService } from 'app/services/model-importer.service';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropInstanceInspectorComponent } from 'app/views/inspectors/prop-instance-inspector/prop-instance-inspector.component';
import { Subscription } from 'rxjs';
import { CreatePropPointCommand } from '../commands/create-prop-point-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { PointEditor } from '../editors/point-editor';
import { InspectorFactoryService, InspectorType } from '../factories/inspector-factory.service';
import { AppInspector } from '../inspector';
import { PropInstance } from '../models/prop-instance.model';
import { BaseTool } from './base-tool';

/**
 * Prop point tool
 *
 * Steps
 * 1. Select a prop (fbx, gltf) from library browser
 * 2. SHIFT + LEFT-CLICK to drop it in the scene
 *
 * Requires an instance of prop to be able to drop them in the scene
 *
 *
 */
export class PropPointTool extends BaseTool {

	public name: string = 'PropPointTool';

	public shapeEditor: PointEditor;

	private cpAddedSub: Subscription;
	private cpSelectedSub: Subscription;
	private cpUnselectedSub: Subscription;
	private cpMovedSub: Subscription;
	private cpUpdatedSub: Subscription;

	public currentPoint: BaseControlPoint;

	get currentProp (): PropInstance {
		return this.currentPoint?.mainObject;
	}

	constructor () {

		super();

	}

	get prop (): PropInstance {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropInstance( prop.guid, AssetDatabase.getInstance( prop.guid ) );

		}

	}

	init () {

		super.init();

		this.shapeEditor = new PointEditor( 100, 1 );

	}

	enable () {

		super.enable();

		this.map.props.forEach( ( prop: PropInstance ) => {

			const cp = this.shapeEditor.addControlPoint( prop.object.position );

			cp.mainObject = prop;

		} );

		this.cpAddedSub = this.shapeEditor.controlPointAdded
			.subscribe( point => this.onControlPointAdded( point ) );

		this.cpSelectedSub = this.shapeEditor.controlPointSelected
			.subscribe( point => this.onControlPointSelected( point ) );

		this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
			.subscribe( point => this.onControlPointUnselected( point ) );

		this.cpMovedSub = this.shapeEditor.controlPointMoved
			.subscribe( ( point ) => this.onControlPointMoved( point ) );

		this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
			.subscribe( ( point ) => this.onControlPointUpdated( point ) );

	}



	disable (): void {

		super.disable();

		this.cpAddedSub.unsubscribe();
		this.cpSelectedSub.unsubscribe();
		this.cpUnselectedSub.unsubscribe();
		this.cpMovedSub?.unsubscribe();
		this.cpUpdatedSub?.unsubscribe();

		this.shapeEditor.destroy();

	}

	private onControlPointSelected ( point: BaseControlPoint ) {

		// console.log( 'onControlPointSelected', point );

		if ( this.currentPoint == null || point == null ) return;

		if ( this.currentPoint === point ) return;

		CommandHistory.executeMany(

			new SetValueCommand( this, 'currentPoint', point ),

			// new SetInspectorCommand( PropInstanceInspectorComponent, point.mainObject )

		)

	}

	private onControlPointUnselected ( point: BaseControlPoint ) {

		// console.log( 'onControlPointUnselected', point );

		this.currentPoint = null;

		// if ( this.currentPoint == null || point == null ) return;

		// if ( this.currentPoint === point ) return;

		// CommandHistory.executeMany(

		// 	new SetValueCommand( this, 'currentPoint', null )

		// 	// new SetInspectorCommand( null, null ),

		// );

	}

	private onControlPointAdded ( point: BaseControlPoint ) {

		if ( this.prop ) {

			CommandHistory.execute( new CreatePropPointCommand( this, this.prop, point ) )

		} else {

			SnackBar.error( 'Select a prop from the project browser' );

			point.visible = false;

			setTimeout( () => {

				this.shapeEditor.removeControlPoint( point );

			}, 100 );

		}

	}

	onControlPointUpdated ( point: BaseControlPoint ): void {

		if ( !this.currentProp ) return;

		const oldPosition = this.shapeEditor.pointerDownAt;

		const newPosition = point.position;

		if ( oldPosition == null || newPosition == null ) return;

		if ( oldPosition.equals( newPosition ) ) return;

		CommandHistory.executeMany(

			new SetPositionCommand( this.currentProp.object, newPosition, oldPosition ),

			new SetPositionCommand( this.currentPoint, newPosition, oldPosition )

		);
	}

	onControlPointMoved ( point: BaseControlPoint ): void {

		if ( point.mainObject == null ) return;

		this.currentPoint = point;

		this.currentProp?.object.position.copy( point.position );

	}

}
