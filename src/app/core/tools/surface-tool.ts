/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { SetPositionCommand } from 'app/modules/three-js/commands/set-position-command';
import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { CommandHistory } from 'app/services/command-history';
import { Subscription } from 'rxjs';
import { AddSurfaceControlPointCommand } from '../commands/add-surface-control-point-command';
import { CallFunctionCommand } from '../commands/call-function-command';
import { CreateSurfaceCommand } from '../commands/create-surface-command';
import { DeleteSurfaceCommand } from '../commands/delete-surface-command';
import { PointEditor } from '../editors/point-editor';
import { KeyboardInput } from '../input';
import { BaseTool } from './base-tool';

export class SurfaceTool extends BaseTool {

	public name: string = 'SurfaceTool';

	public shapeEditor: PointEditor;

	private cpAddedSub: Subscription;
	private cpMovedSub: Subscription;
	private cpUpdatedSub: Subscription;
	private cpSelectedSub: Subscription;
	private cpUnselectedSub: Subscription;
	private keyDownSub: Subscription;

	private _surface: TvSurface;

	public get surface (): TvSurface {
		return this._surface;
	}

	public set surface ( value: TvSurface ) {
		this._surface = value;
	}

	constructor () {

		super();

	}

	public init () {

		super.init();

		this.shapeEditor = new PointEditor( 100 );
	}

	public enable () {

		super.enable();

		this.map.surfaces.forEach( surface => {

			surface.update();

			surface.showControlPoints();

			surface.showCurve();

			surface.spline.controlPoints.forEach( cp => {

				cp.mainObject = surface;

				this.shapeEditor.controlPoints.push( cp );

			} );
		} );

		this.keyDownSub = KeyboardInput.keyDown
			.subscribe( e => this.onDeletePressed( e ) );

		this.cpAddedSub = this.shapeEditor.controlPointAdded
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointAdded( cp ) );

		this.cpMovedSub = this.shapeEditor.controlPointMoved
			.subscribe( () => this.onControlPointMoved() );

		this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
			.subscribe( ( point ) => this.onControlPointUpdated( point ) );

		this.cpSelectedSub = this.shapeEditor.controlPointSelected
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointSelected( cp ) );

		this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
			.subscribe( () => this.onControlPointUnselected() );

	}

	public disable (): void {

		super.disable();

		this.map.surfaces.forEach( surface => {

			surface.hideCurve();
			surface.hideControlPoints();

		} );

		this.keyDownSub.unsubscribe();
		this.cpAddedSub.unsubscribe();
		this.cpMovedSub.unsubscribe();
		this.cpUpdatedSub.unsubscribe();
		this.cpSelectedSub.unsubscribe();
		this.cpUnselectedSub.unsubscribe();

		this.shapeEditor.destroy();
	}

	public onPointerClicked ( e: PointerEventData ) {

		for ( let i = 0; i < e.intersections.length; i++ ) {

			const intersection = e.intersections[ i ];

			if ( intersection.object && intersection.object[ 'tag' ] === TvSurface.tag ) {

				this.surface = intersection.object.userData.surface;

				this.surface.showControlPoints();

				break;
			}
		}
	}

	private onControlPointSelected ( cp: AnyControlPoint ) {

		this.surface = cp.mainObject;

		this.surface.showControlPoints();

	}

	private onControlPointUnselected () {

		this.surface = null;

	}

	private onControlPointAdded ( cp: AnyControlPoint ) {

		if ( !this.surface ) {

			CommandHistory.execute( new CreateSurfaceCommand( this, cp ) );

		} else {

			CommandHistory.execute( new AddSurfaceControlPointCommand( this, this.surface, cp ) );

		}

	}

	private onControlPointUpdated ( point: BaseControlPoint ) {

		const oldPosition = this.shapeEditor.pointerDownAt;

		const newPosition = point.position.clone();

		if ( oldPosition.equals( newPosition ) ) {

			console.error( 'No change in position' );

			return;
		}

		CommandHistory.executeMany(

			new SetPositionCommand( point, newPosition, oldPosition ),

			new CallFunctionCommand( this.surface, this.surface.update, [], this.surface.update, [] )

		);

	}

	private onControlPointMoved () {

		this.surface.spline.update();

	}

	private onDeletePressed ( e: KeyboardEvent ) {

		if ( !this.surface ) return;

		if ( e.key === 'Delete' || e.key === 'Backspace' ) {

			CommandHistory.execute( new DeleteSurfaceCommand( this, this.surface ) );

		}

	}

}
