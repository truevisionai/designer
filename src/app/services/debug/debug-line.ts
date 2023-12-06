import { INode } from 'app/modules/three-js/objects/i-selectable';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Color } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export class DebugLine<T> extends Line2 implements INode {

	isSelected: boolean;

	private DEFAULT_COLOR = COLOR.CYAN;
	private HOVERED_COLOR = COLOR.YELLOW;
	private SELECTED_COLOR = COLOR.RED;


	constructor ( public target: T, geometry: LineGeometry, material: LineMaterial ) {
		super( geometry, material );
		this.name = 'DebugLine';
		this.renderOrder = 999;
	}

	onMouseOver () {

		this.material.color = new Color( this.HOVERED_COLOR );
		this.material.linewidth = 4;
		this.material.needsUpdate = true;

	}

	onMouseOut () {

		this.material.color = new Color( this.DEFAULT_COLOR );
		this.material.linewidth = 2;
		this.material.needsUpdate = true;

	}

	select () {

		this.isSelected = true;

		this.material.color = new Color( this.SELECTED_COLOR );
		this.material.needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		this.material.color = new Color( this.DEFAULT_COLOR );
		this.material.needsUpdate = true;

	}

}
