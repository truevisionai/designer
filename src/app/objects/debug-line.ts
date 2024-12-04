/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { INode } from 'app/objects/i-selectable';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Color, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

const DEFAULT_COLOR = COLOR.CYAN;
const HOVERED_COLOR = COLOR.YELLOW;
const SELECTED_COLOR = COLOR.RED;

export class DebugLine<T> extends Line2 implements INode {

	isSelected: boolean;

	tag: string;

	private originalWidth: number;

	constructor ( public target: T, geometry: LineGeometry, material: LineMaterial ) {
		super( geometry, material );
		this.name = 'DebugLine';
		this.renderOrder = 999;
		this.originalWidth = material?.linewidth || 2;
	}

	onMouseOver (): void {

		this.material.color = new Color( HOVERED_COLOR );
		this.material.linewidth = this.originalWidth;
		this.material.needsUpdate = true;

	}

	onMouseOut (): void {

		this.material.color = new Color( DEFAULT_COLOR );
		this.material.linewidth = this.originalWidth;
		this.material.needsUpdate = true;

	}

	select (): void {

		this.isSelected = true;

		this.material.color = new Color( SELECTED_COLOR );
		this.material.needsUpdate = true;

	}

	unselect (): void {

		this.isSelected = false;

		this.material.color = new Color( DEFAULT_COLOR );
		this.material.needsUpdate = true;

	}

	updateGeometry ( positions: Vector3[] ): void {

		this.geometry.setPositions( positions.flatMap( p => [ p.x, p.y, p.z ] ) );

	}

	static create ( points: Vector3[], width: number = 2, color: any = COLOR.CYAN ): DebugLine<any> {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = this.getMaterial( color, width );

		return new DebugLine( null, geometry, material );
	}

	static getMaterial ( color: any = COLOR.CYAN, width: number = 2 ): LineMaterial {

		return new LineMaterial( {
			color: color,
			linewidth: width,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

	}
}
