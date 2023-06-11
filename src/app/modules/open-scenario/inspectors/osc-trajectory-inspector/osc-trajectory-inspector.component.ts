import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { OscTrajectory, OscVertex, OscPolylineShape } from '../../models/osc-trajectory';
import { PolygonEditor } from 'app/core/editors/polygon-editor';
import { AbstractShapeEditor } from 'app/core/editors/abstract-shape-editor';
import { PolyLineEditor } from 'app/core/editors/polyline-editor';
import { CatmullRomCurve3, Vector3, Points } from 'three';
import { AbstractPosition } from '../../models/osc-interfaces';
import { OscWorldPosition } from '../../models/positions/osc-world-position';
import { Debug } from 'app/core/utils/debug';
@Component( {
	selector: 'app-osc-trajectory-inspector',
	templateUrl: './osc-trajectory-inspector.component.html',
	styleUrls: [ './osc-trajectory-inspector.component.css' ]
} )
export class OscTrajectoryInspectorComponent implements OnInit, OnDestroy, OnChanges {

	@Input() trajectory: OscTrajectory;

	@Input() display: boolean = true;
	@Input() disableEditing: boolean = false;

	private shapeEditor: AbstractShapeEditor;

	constructor () { }

	ngOnInit () {

		this.shapeEditor = new PolyLineEditor;

		this.drawTrajectory();

		this.addVertexAddedListener();

		this.addGeometryChangeListener();

	}

	ngOnChanges ( changes: SimpleChanges ): void {

		if ( this.shapeEditor == null ) return;

		if ( this.disableEditing ) {

			this.shapeEditor.removeHighlight();

			this.shapeEditor.disable();

			Debug.log( 'disable', this.trajectory.name );

		} else {

			this.shapeEditor.highlight();

			this.shapeEditor.enable();

			Debug.log( 'enabld', this.trajectory.name );

		}

	}

	addVertexAddedListener () {

		this.shapeEditor.controlPointAdded.subscribe( ( e: Points ) => {

			if ( this.disableEditing ) return;

			let reference = this.trajectory.vertices.length;

			let position = new OscWorldPosition( e.position.x, e.position.y, e.position.z );

			let vertex = new OscVertex( reference, position, new OscPolylineShape );

			this.trajectory.vertices.push( vertex );

		} );

	}

	ngOnDestroy (): void {

		this.shapeEditor.destroy();

	}

	drawTrajectory () {

		this.trajectory.vertices.forEach( vertex => {

			// Important! Need to set the vector3
			vertex.position.vector3 = vertex.position.getPosition();

			this.shapeEditor.addControlPoint( vertex.position.getPosition() );

		} );

		this.shapeEditor.draw();
	}

	addGeometryChangeListener () {

		this.shapeEditor.curveGeometryChanged.subscribe( ( curve: CatmullRomCurve3 ) => {

			if ( this.disableEditing ) return;

			curve.points.forEach( ( point, i ) => {

				this.trajectory.vertices[ i ].position.setPosition( point );

			} );

		} );

	}

	onPositionModified ( position: AbstractPosition ) {

		throw new Error( 'not implemented' );

		// this.shapeEditor.removeAll();

		// this.drawTrajectory();

	}


}
