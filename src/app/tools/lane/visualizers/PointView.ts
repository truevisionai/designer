import { EventEmitter } from "app/events/event-emitter";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Points, BufferGeometry, PointsMaterial, Vector3, Float32BufferAttribute } from "three";
import { IView } from "./IView";
import { OdTextures } from "app/deprecated/od.textures";


export class PointView extends Points implements IView {

	isView: boolean = true;

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
		this.material.color.set( COLOR.YELLOW );
		this.mouseOver.emit( 'mouseOver', this );
	}

	onMouseOut?(): void {
		this.material.color.set( COLOR.CYAN );
		this.mouseOut.emit( 'mouseOut', this );
	}

	onClick?(): void {
		this.material.color.set( COLOR.RED );
		this.clicked.emit( 'clicked', this );
	}

	static create ( position: Vector3 ): PointView {

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [ position.x, position.y, position.z ], 3 ) );

		// const geometry = new BufferGeometry();
		// geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const material = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		return new PointView( geometry, material );

	}

}
