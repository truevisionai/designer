import { Vector2, WebGLRenderer } from 'three';

export class SelectionHelper {

	private element: HTMLDivElement;
	private startPoint: Vector2;
	private pointTopLeft: Vector2;
	private pointBottomRight: Vector2;
	private enabled: boolean;

	private renderer: WebGLRenderer;

	constructor ( renderer: WebGLRenderer, cssClassName: string ) {

		this.element = document.createElement( 'div' );
		this.element.classList.add( cssClassName );
		this.element.style.pointerEvents = 'none';

		this.renderer = renderer;

		this.startPoint = new Vector2();
		this.pointTopLeft = new Vector2();
		this.pointBottomRight = new Vector2();

		this.enabled = true;

	}

	public onSelectStart ( event: MouseEvent ): void {
		this.element.style.display = 'none';

		this.renderer.domElement.parentElement?.appendChild( this.element );

		this.element.style.left = `${ event.clientX }px`;
		this.element.style.top = `${ event.clientY }px`;
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x = event.clientX;
		this.startPoint.y = event.clientY;
	}

	public onSelectMove ( event: MouseEvent ): void {
		this.element.style.display = 'block';

		this.pointBottomRight.x = Math.max( this.startPoint.x, event.clientX );
		this.pointBottomRight.y = Math.max( this.startPoint.y, event.clientY );
		this.pointTopLeft.x = Math.min( this.startPoint.x, event.clientX );
		this.pointTopLeft.y = Math.min( this.startPoint.y, event.clientY );

		this.element.style.left = `${ this.pointTopLeft.x }px`;
		this.element.style.top = `${ this.pointTopLeft.y }px`;
		this.element.style.width = `${ this.pointBottomRight.x - this.pointTopLeft.x }px`;
		this.element.style.height = `${ this.pointBottomRight.y - this.pointTopLeft.y }px`;
	}

	public onSelectOver (): void {
		this.element.parentElement?.removeChild( this.element );
		this.element.style.display = 'none';
	}

	public disable (): void {
		this.enabled = false;
		this.element.style.display = 'none';
	}
}
