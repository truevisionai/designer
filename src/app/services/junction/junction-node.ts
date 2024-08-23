import { TvRoadLink } from "app/map/models/tv-road-link";
import { ISelectable, Highlightable } from "app/objects/i-selectable";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Color } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";


export class JunctionNode extends Line2 implements ISelectable, Highlightable {

	static tag = 'JunctionNode';
	tag = 'JunctionNode';
	isSelected: boolean;
	defaulColor = COLOR.CYAN;

	constructor ( public link: TvRoadLink, public geometry: LineGeometry, public material: LineMaterial ) {
		super( geometry, material );
	}

	select (): void {
		this.isSelected = true;
		this.material.color = new Color( COLOR.RED );
		this.renderOrder = 5;
	}

	unselect (): void {
		this.isSelected = false;
		this.material.color = new Color( this.defaulColor );
		this.renderOrder = 3;
	}

	onMouseOver (): void {
		if ( this.isSelected ) return;
		this.material.color = new Color( COLOR.YELLOW );
		this.material.needsUpdate = true;
	}

	onMouseOut (): void {
		if ( this.isSelected ) return;
		this.material.color = new Color( this.defaulColor );
		this.material.needsUpdate = true;
	}
}
