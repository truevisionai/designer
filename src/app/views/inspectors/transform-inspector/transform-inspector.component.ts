/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Euler, Object3D, Vector3 } from 'three';
import { IComponent } from '../../../core/game-object';
import { SetPositionCommand } from '../../../modules/three-js/commands/set-position-command';
import { SetRotationCommand } from '../../../modules/three-js/commands/set-rotation-command';
import { SetScaleCommand } from '../../../modules/three-js/commands/set-scale-command';
import { CommandHistory } from '../../../services/command-history';
import { Maths } from '../../../utils/maths';

@Component( {
	selector: 'app-transform-inspector',
	templateUrl: './transform-inspector.component.html',
} )
export class TransformInspectorComponent implements OnInit, IComponent {

	@Input() data: Object3D;

	@Input() showPosition = true;
	@Input() showRotation = true;
	@Input() showScale = true;

	public position: Vector3;
	public rotation: Euler;
	public scale: Vector3;

	constructor () {
	}


	ngOnInit (): void {

		this.position = this.data.position.clone();
		this.rotation = this.data.rotation.clone();
		this.scale = this.data.scale.clone();

		this.rotation.x *= Maths.Rad2Deg;
		this.rotation.y *= Maths.Rad2Deg;
		this.rotation.z *= Maths.Rad2Deg;
	}

	positionChanged () {

		CommandHistory.execute( new SetPositionCommand( this.data, this.position ) );

	}

	rotationChanged () {

		const rotation = this.rotation.clone();

		rotation.x *= Maths.Deg2Rad;
		rotation.y *= Maths.Deg2Rad;
		rotation.z *= Maths.Deg2Rad;

		CommandHistory.execute( new SetRotationCommand( this.data, rotation ) );

	}

	scaleChanged () {

		CommandHistory.execute( new SetScaleCommand( this.data, this.scale ) );

	}
}
