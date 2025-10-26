/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ICommand } from 'app/commands/command';
import { CommandHistory } from 'app/commands/command-history';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';

export interface BoxSelectionDeletionHandler<T = any> {

	handleDelete ( selection: T[] ): boolean;

}

export interface ScopedDeletionRequest<T = any> {
	target: T;
	/**
	 * Lower values are executed first (e.g. parent objects before children).
	 */
	priority: number;
	/**
	 * Stable ordering within the same priority bucket.
	 */
	order: number;
}

export abstract class ScopedDeletionHandler<T = any> implements BoxSelectionDeletionHandler<T> {

	protected constructor ( private readonly fireUnselectEvent = true ) {
	}

	handleDelete ( selection: T[] ): boolean {

		if ( !selection || selection.length === 0 ) return false;

		const requests = this.buildRequests( selection );

		if ( requests.length === 0 ) return false;

		const sortedRequests = this.sortRequests( requests );

		const command = this.createCommand( sortedRequests );

		if ( !command ) return false;

		CommandHistory.execute( command );

		return true;
	}

	protected sortRequests ( requests: ScopedDeletionRequest<T>[] ): ScopedDeletionRequest<T>[] {

		return [ ...requests ].sort( ( a, b ) => {

			if ( a.priority === b.priority ) {
				return a.order - b.order;
			}

			return a.priority - b.priority;

		} );

	}

	protected createCommand ( requests: ScopedDeletionRequest<T>[] ): ICommand | undefined {

		const orderedTargets = requests.map( request => request.target );

		if ( orderedTargets.length === 0 ) return undefined;

		return new RemoveObjectCommand( orderedTargets, this.fireUnselectEvent );
	}

	protected abstract buildRequests ( selection: T[] ): ScopedDeletionRequest<T>[];

}

