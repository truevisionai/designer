import { Object3D } from "three";
import { IView } from "./IView";


export abstract class BaseView extends Object3D implements IView {

	isView: boolean = true;

	abstract show (): void;

	abstract hide (): void;

	abstract update (): void;

	abstract onMouseOver?(): void;

	abstract onMouseOut?(): void;

	abstract onClick?(): void;

	abstract onDeselect?(): void;

}
