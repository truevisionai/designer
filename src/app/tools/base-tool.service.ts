import { Injectable } from '@angular/core';
import { SelectObjectCommandv2, UnselectObjectCommandv2 } from 'app/commands/select-point-command';
import { MovingStrategy } from 'app/core/snapping/move-strategies/move-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Position } from 'app/modules/scenario/models/position';
import { CommandHistory } from 'app/services/command-history';
import { StatusBarService } from 'app/services/status-bar.service';


@Injectable( {
	providedIn: 'root'
} )
export class BaseToolService {

	private selectionStratgies: SelectStrategy<any>[] = [];
	private movingStrategies: MovingStrategy[] = [];
	private previous: any;

	constructor (
		public statusBar: StatusBarService,
	) { }

	public addSelectionStrategy ( strategy: SelectStrategy<any> ) {

		this.selectionStratgies.push( strategy );

	}

	public getSelectionStrategies (): SelectStrategy<any>[] {

		return this.selectionStratgies;

	}

	public addMovingStrategy ( strategy: MovingStrategy ) {

		this.movingStrategies.push( strategy );

	}

	public getMovingStrategies (): MovingStrategy[] {

		return this.movingStrategies;

	}

	select ( e: PointerEventData ): void {

		for ( let i = 0; i < this.selectionStratgies.length; i++ ) {

			const element = this.selectionStratgies[ i ];

			const result = element.select( e );

			if ( result ) {

				CommandHistory.execute( new SelectObjectCommandv2( result, this.previous ) );

				this.previous = result;

				return;
			}

		}

		if ( this.previous ) {

			CommandHistory.execute( new UnselectObjectCommandv2( this.previous ) );

			this.previous = null;

		}

	}

	move ( e: PointerEventData ): Position {

		for ( let i = 0; i < this.movingStrategies.length; i++ ) {

			const position = this.movingStrategies[ i ].getPosition( e );

			if ( position ) return position;

		}

	}

	clearStrategies () {

		this.selectionStratgies.forEach( s => s.dispose() );
		// this.movingStrategies.forEach( s => s.dispose() );

		this.selectionStratgies = [];
		this.movingStrategies = [];
	}

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	clearHint () {

		StatusBarService.clearHint();

	}

}
