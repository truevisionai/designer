import { EventEmitter } from "app/events/event-emitter";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Points, BufferGeometry, PointsMaterial, Vector3, Float32BufferAttribute } from "three";
import { IView } from "./IView";


export class PointView extends Points implements IView {

	public clicked = new EventEmitter<this>();
	public mouseOver = new EventEmitter<this>();
	public mouseOut = new EventEmitter<this>();

	private constructor ( public geometry: BufferGeometry, public material: PointsMaterial ) {
		super();
	}

	show (): void {
		this.visible = true;
	}

	hide (): void {
		this.visible = false;
	}

	update (): void {
		// do nothing
	}

	onMouseOver?(): void {
		this.material.color.set( COLOR.BLUE );
		this.mouseOver.emit( 'mouseOver', this );
	}

	onMouseOut?(): void {
		this.material.color.set( COLOR.RED );
		this.mouseOut.emit( 'mouseOut', this );
	}

	onClick?(): void {
		this.material.color.set( COLOR.GREEN );
		this.clicked.emit( 'clicked', this );
	}

	static create ( position: Vector3 ): PointView {

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [ position.x, position.y, position.z ], 3 ) );

		const material = new PointsMaterial( { color: COLOR.RED, size: 0.1 } );

		return new PointView( geometry, material );

	}

}
