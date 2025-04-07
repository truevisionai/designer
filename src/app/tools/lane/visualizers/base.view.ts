import { Object3D } from "three";
import { IView } from "./i-view";
import { Vector3 } from "../../../core/maths";


export abstract class BaseView extends Object3D implements IView {

	isView: boolean = true;

	protected isSelected: boolean = false;

	abstract show (): void;

	abstract hide (): void;

	abstract update (): void;

	abstract onMouseOver?(): void;

	abstract onMouseOut?(): void;

	abstract onClick?(): void;

	abstract onDeselect?(): void;

	setSelected ( selected: boolean ): void {
		this.isSelected = selected;
	}

	getPosition (): Vector3 {
		return this.position;
	}

	setPosition ( position: Vector3 ): void {
		this.position.copy( position );
	}
}
