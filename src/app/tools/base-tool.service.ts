/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from '@angular/core';
import { IMovingStrategy } from 'app/core/strategies/move-strategies/move-strategy';
import { SelectStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/scenario/models/position';
import { SelectionService } from './selection.service';
import { Vector3 } from 'three';
import { ViewControllerService } from "../views/editor/viewport/view-controller.service";
import { CursorService } from 'app/services/editor/cursor.service';

@Injectable( {
	providedIn: 'root'
} )
export class BaseToolService {

	private creationStrategies: SelectStrategy<any>[] = [];

	private selectionStrategies: SelectStrategy<any>[] = [];

	private movingStrategies: IMovingStrategy[] = [];

	constructor (
		public injector: Injector,
		public selection: SelectionService,
		private viewController: ViewControllerService,
		private cursorService: CursorService,
	) {
	}

	addSelectionStrategy ( strategy: SelectStrategy<any> ) {

		this.selectionStrategies.push( strategy );

	}

	addCreationStrategy ( strategy: SelectStrategy<any> ) {

		this.creationStrategies.push( strategy );

	}

	addMovingStrategy ( strategy: IMovingStrategy ) {

		this.movingStrategies.push( strategy );

	}

	setSelected ( object: any ) {


	}

	handleSelection ( e: PointerEventData, selectCallback: ( object: any ) => void, unselectCallback: () => void = null ): void {

		for ( let i = 0; i < this.selectionStrategies.length; i++ ) {

			const element = this.selectionStrategies[ i ];

			const result = element.select( e );

			if ( result ) {

				selectCallback( result );

				return;
			}

		}

		if ( unselectCallback ) unselectCallback();

	}

	handleCreation ( e: PointerEventData, creationCallback: ( position: any ) => void, noneFn?: ( position: Vector3 ) => void ): void {

		for ( let i = 0; i < this.creationStrategies.length; i++ ) {

			const element = this.creationStrategies[ i ];

			const result = element.select( e );

			if ( result ) {

				creationCallback( result );

				return;
			}

		}

		if ( noneFn ) noneFn( e.point );

	}

	onPointerDown ( e: PointerEventData ) {

		for ( let i = 0; i < this.selectionStrategies.length; i++ ) {

			const element = this.selectionStrategies[ i ];

			const result = element.select( e );

			if ( result ) return result;

		}

	}

	highlight ( e: PointerEventData ) {

		for ( let i = 0; i < this.selectionStrategies.length; i++ ) {

			const element = this.selectionStrategies[ i ];

			const result = element.onPointerMoved( e );

			if ( result ) return result;

		}

	}

	move ( e: PointerEventData ): Position {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const position = this.movingStrategies[ i ].getPosition( e );

			if ( position ) return position;

		}

	}

	handleMovement ( e: PointerEventData, successFn: ( position: Position ) => void, noneFn: () => void = null ): void {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const strategy = this.movingStrategies[ i ];

			const position = strategy.getPosition( e );

			if ( position ) {

				successFn( position );

				return;

			}

		}

		if ( noneFn ) noneFn();

	}

	handleTargetMovement ( e: PointerEventData, target: any, callback: ( position: Position ) => void ): void {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const strategy = this.movingStrategies[ i ];

			const position = strategy.getPosition( e, target );

			if ( position ) {

				callback( position );

			}

		}

	}

	clearStrategies () {

		this.selectionStrategies.forEach( s => s.dispose() );
		this.creationStrategies.forEach( s => s.dispose() );

		this.selectionStrategies = [];
		this.movingStrategies = [];
		this.creationStrategies = [];
	}

	reset () {

		this.clearStrategies();


	}

	enableControls () {

		this.viewController.enableControls();

	}

	disableControls () {

		this.viewController.disableControls();

	}

	setCursor ( hint: string ) {

		this.cursorService.setCursor( hint );

	}

}
