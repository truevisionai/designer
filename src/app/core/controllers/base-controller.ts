/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from "../inspector";
import { StatusBarService } from "../../services/status-bar.service";
import { Controller } from "./controller";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "three";

export abstract class BaseController<T> implements Controller<T> {

	protected dragStartPosition: Vector3;

	protected currentDragPosition: Vector3;

	protected dragEndPosition: Vector3;

	protected dragDelta: Vector3;

	protected selected = new Set<T>();

	abstract onAdded ( object: T ): void;

	abstract onUpdated ( object: T ): void;

	abstract onRemoved ( object: T ): void;

	abstract showInspector ( object: T ): void;

	abstract onDrag ( object: T, e: PointerEventData ): void;

	abstract onDragEnd ( object: T, e: PointerEventData ): void;

	isSelected ( object: T ): boolean {
		return this.selected.has( object );
	}

	isDraggingSupported (): boolean {
		return false;
	}

	setDragStartPosition ( position: Vector3 ): void {
		this.dragStartPosition = position;
	}

	getDragStartPosition (): Vector3 | undefined {
		return this.dragStartPosition;
	}

	setCurrentDragPosition ( position: Vector3 ): void {
		this.currentDragPosition = position;
	}

	getCurrentDragPosition (): Vector3 | undefined {
		return this.currentDragPosition;
	}

	setDragEndPosition ( position: Vector3 ): void {
		this.dragEndPosition = position;
	}

	getDragEndPosition (): Vector3 | undefined {
		return this.dragEndPosition;
	}

	onDragStart ( object: T, e: PointerEventData ): void {
		// Do nothing by default
	}

	updateDragDelta ( position: Vector3 ): void {
		if ( position && this.currentDragPosition ) {
			this.dragDelta = position.clone().sub( this.currentDragPosition );
		} else {
			this.dragDelta = new Vector3();
		}
	}

	getSelected (): T[] {

		return Array.from( this.selected );

	}

	select ( object: T ): void {

		this.selected.add( object );

		this.onSelected( object );

	}

	onSelected ( object: T ): void {

		// Do nothing by default

	}

	unselect ( object: T ): void {

		this.selected.delete( object );

		this.onUnselected( object );

	}

	onUnselected ( object: T ): void {

		// Do nothing by default

	}

	clearInspector (): void {

		AppInspector.clear();

	}

	setInspector ( data: any ): void {

		AppInspector.setDynamicInspector( data );

	}

	setHint ( msg: string ): void {

		StatusBarService.setHint( msg );

	}

	validate ( object: T ): void {

		// Do nothing by default

	}

	createAt ( object: T, e: PointerEventData ): any | undefined {

		// Do nothing by default

	}

	getDragTip ( object: T ): string | null {

		return;

	}

}
