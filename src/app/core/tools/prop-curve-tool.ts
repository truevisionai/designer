/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import {
	PropCurveInspectorComponent,
	PropCurveInspectorData
} from 'app/views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
import { Subscription } from 'rxjs';
import { PointEditor } from '../editors/point-editor';
import { KeyboardInput } from '../input';
import { AppInspector } from '../inspector';
import { PropModel } from '../models/prop-model.model';
import { BaseTool } from './base-tool';
import { CommandHistory } from 'app/services/command-history';
import { CreatePropCurveCommand } from '../commands/create-prop-curve-command';
import { AddPropCurvePointCommand } from '../commands/add-prop-curve-point-command.ts';

export class PropCurveTool extends BaseTool {

	public name: string = 'PropCurveTool';

	public shapeEditor: PointEditor;

	private cpSubscriptions: Subscription[] = [];

	private cpAddedSub: Subscription;
	private cpMovedSub: Subscription;
	private cpUpdatedSub: Subscription;
	private cpSelectedSub: Subscription;
	private cpUnselectedSub: Subscription;

	public curve: PropCurve;
	public point: AnyControlPoint;

	constructor () {

		super();

	}

	private get curves () {
		return this.map.propCurves;
	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel( prop.guid, prop.data.rotationVariance, prop.data.scaleVariance );

		}

	}

	public init () {

		super.init();

		this.shapeEditor = new PointEditor( 100 );
	}

	public enable () {

		super.enable();

		this.curves.forEach( curve => curve.show( this.shapeEditor ) );

		this.cpAddedSub = this.shapeEditor.controlPointAdded
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointAdded( cp ) );

		this.cpMovedSub = this.shapeEditor.controlPointMoved
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointMoved( cp ) );

		this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointUpdated( cp ) );

		this.cpSelectedSub = this.shapeEditor.controlPointSelected
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointSelected( cp ) );

		this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointUnselected() );

	}

	public disable (): void {

		super.disable();

		this.curves.forEach( curve => curve.hide() );

		this.cpAddedSub.unsubscribe();
		this.cpMovedSub.unsubscribe();
		this.cpUpdatedSub.unsubscribe();
		this.cpSelectedSub.unsubscribe();
		this.cpUnselectedSub.unsubscribe();

		this.shapeEditor.destroy();

		this.unsubscribeFromControlPoints();
	}

	public onPointerClicked ( e: PointerEventData ) {

		let hasInteracted = false;

		// first check for any point intersections
		for ( const i of e.intersections ) {

			if ( i.object != null && i.object.type === 'Points' ) {

				hasInteracted = true;

				this.point = ( i.object as AnyControlPoint );

				this.curve = this.point.mainObject as PropCurve;

				this.showInspector( this.curve, this.point );

				break;
			}

		}

		// if not point intersections then check for curve intersections
		for ( const i of e.intersections ) {

			if ( i.object != null && i.object[ 'tag' ] === 'curve' && !hasInteracted ) {

				hasInteracted = true;

				this.curve = i.object.userData.parent;

				this.point = null;

				this.showInspector( this.curve, this.point );

				break;

			}
		}

		if ( hasInteracted ) return;

		// Finally, If no objects were intersected then clear the inspector
		if ( !KeyboardInput.isShiftKeyDown ) {

			// unselect the curve in second click
			if ( !this.point ) {

				this.curve = null;

				this.showInspector( this.curve, this.point );

			} else {

				// in first click, remove focus from control point and hide tangent
				this.point = null;

				this.showInspector( this.curve, this.point );
			}
		}
	}

	private onControlPointSelected ( cp: AnyControlPoint ) {

		this.point = cp;

		if ( cp.mainObject ) {

			this.curve = cp.mainObject;

			this.showInspector( this.curve, this.point );

		}
	}

	private onControlPointUnselected () {

	}

	private showInspector ( curve: PropCurve, point: AnyControlPoint ) {

		if ( curve == null && point == null ) {

			AppInspector.clear();

		} else {

			const data = new PropCurveInspectorData( point, curve );

			AppInspector.setInspector( PropCurveInspectorComponent, data );
		}
	}

	private onControlPointAdded ( point: AnyControlPoint ) {

		if ( this.prop ) {

			if ( !this.curve ) {

				CommandHistory.execute( new CreatePropCurveCommand( this, this.prop, point ) );

			} else {

				CommandHistory.execute( new AddPropCurvePointCommand( this, this.curve, point ) );

			}

		} else {

			SnackBar.error( 'Select a prop from the project browser' );

			point.visible = false;

			setTimeout( () => {

				this.shapeEditor.removeControlPoint( point );

			}, 100 );

		}

	}

	private onControlPointUpdated ( cp: AnyControlPoint ) {

		if ( cp.mainObject ) {

			this.curve = cp.mainObject;

			this.curve.update();

			this.curve?.update();

		}
	}

	private onControlPointMoved ( cp: AnyControlPoint ) {

		if ( cp.mainObject ) {

			this.curve = cp.mainObject;

			this.curve.update();

		}

	}

	private unsubscribeFromControlPoints () {

		this.cpSubscriptions.forEach( sub => {

			sub.unsubscribe();

		} );

	}
}
