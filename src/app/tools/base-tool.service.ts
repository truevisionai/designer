import { Injectable } from '@angular/core';
import { IMovingStrategy } from 'app/core/snapping/move-strategies/move-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/modules/scenario/models/position';
import { CommandHistory } from 'app/services/command-history';
import { StatusBarService } from 'app/services/status-bar.service';
import { UnselectObjectCommand } from "../commands/unselect-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { SelectionService } from './selection.service';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class BaseToolService {

	private creationStrategies: SelectStrategy<any>[] = [];
	private selectionStrategies: SelectStrategy<any>[] = [];
	private movingStrategies: IMovingStrategy[] = [];
	private currentSelected: any;

	constructor (
		public statusBar: StatusBarService,
		public selection: SelectionService,
	) { }

	addSelectionStrategy ( strategy: SelectStrategy<any> ) {

		this.selectionStrategies.push( strategy );

	}

	getSelectionStrategies () {

		return this.selectionStrategies;

	}

	addCreationStrategy ( strategy: SelectStrategy<any> ) {

		this.creationStrategies.push( strategy );

	}

	addMovingStrategy ( strategy: IMovingStrategy ) {

		this.movingStrategies.push( strategy );

	}

	setSelected ( object: any ) {

		this.currentSelected = object;

	}

	/**
	 * @deprecated use handleSelection or handleCreation instead
	 * @param e
	 */
	select ( e: PointerEventData ): void {

		this.handleSelection( e, ( object ) => {

			if ( object === this.currentSelected ) return;

			CommandHistory.execute( new SelectObjectCommand( object, this.currentSelected ) );

			this.currentSelected = object;

		}, () => {

			if ( this.currentSelected ) {

				CommandHistory.execute( new UnselectObjectCommand( this.currentSelected ) );

				this.currentSelected = null;

			}

		} )

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

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	setWarning ( msg: string ) {

		StatusBarService.setHint( msg );
		// this.snackBar.warn( msg );

	}

	clearHint () {

		StatusBarService.clearHint();

	}

	reset () {

		this.clearStrategies();

		this.selection.reset();

		this.currentSelected = null;

	}

}
