/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractShapeEditor } from 'app/core/editors/abstract-shape-editor';
import { PolyLineEditor } from 'app/core/editors/polyline-editor';
import { Debug } from 'app/core/utils/debug';
import { CatmullRomCurve3, Points } from 'three';
import { AbstractPosition } from '../../models/osc-interfaces';
import { PolylineShape, Trajectory, Vertex } from '../../models/osc-trajectory';
import { WorldPosition } from '../../models/positions/osc-world-position';

@Component( {
	selector: 'app-osc-trajectory-inspector',
	templateUrl: './osc-trajectory-inspector.component.html',
	styleUrls: [ './osc-trajectory-inspector.component.css' ]
} )
export class TrajectoryInspectorComponent implements OnInit, OnDestroy, OnChanges {

	@Input() trajectory: Trajectory;

	@Input() display: boolean = true;
	@Input() disableEditing: boolean = false;

	private shapeEditor: AbstractShapeEditor;

	constructor () {
	}

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

			let position = new WorldPosition( e.position.x, e.position.y, e.position.z );

			let vertex = new Vertex( reference, position, new PolylineShape );

			this.trajectory.vertices.push( vertex );

		} );

	}

	ngOnDestroy (): void {

		this.shapeEditor.destroy();

	}

	drawTrajectory () {

		this.trajectory.vertices.forEach( vertex => {

			// Important! Need to set the vector3
			vertex.position.vector3 = vertex.position.toVector3();

			this.shapeEditor.addControlPoint( vertex.position.toVector3() );

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
