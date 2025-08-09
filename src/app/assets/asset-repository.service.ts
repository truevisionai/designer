import { Injectable } from '@angular/core';
import { Metadata } from './metadata.model';

export interface IAssetRepository {
	getMetadata ( id: string ): Metadata | undefined;
	setMetadata ( id: string, metadata: Metadata ): void;
	getInstance<T> ( id: string ): T | undefined;
	setInstance<T> ( id: string, instance: T ): void;
	remove ( id: string ): void;
	removeMetadata ( id: string ): void;
	removeInstance ( id: string ): void;
	has ( id: string ): boolean;
}

@Injectable( { providedIn: 'root' } )
export class AssetRepositoryService implements IAssetRepository {
	private metadata = new Map<string, Metadata>();
	private instances = new Map<string, any>();

	getMetadata ( id: string ): Metadata | undefined {
		return this.metadata.get( id );
	}

	setMetadata ( id: string, metadata: Metadata ): void {
		this.metadata.set( id, metadata );
	}

	getInstance<T> ( id: string ): T | undefined {
		return this.instances.get( id );
	}

	setInstance<T> ( id: string, instance: T ): void {
		this.instances.set( id, instance );
	}

	remove ( id: string ): void {
		this.metadata.delete( id );
		this.instances.delete( id );
	}

	removeMetadata ( id: string ): void {
		this.metadata.delete( id );
	}

	removeInstance ( id: string ): void {
		this.instances.delete( id );
	}

	has ( id: string ): boolean {
		return this.instances.has( id );
	}
}

export class InMemoryAssetRepository implements IAssetRepository {
	private metadata = new Map<string, Metadata>();
	private instances = new Map<string, any>();

	getMetadata ( id: string ): Metadata | undefined {
		return this.metadata.get( id );
	}

	setMetadata ( id: string, metadata: Metadata ): void {
		this.metadata.set( id, metadata );
	}

	getInstance<T> ( id: string ): T | undefined {
		return this.instances.get( id );
	}

	setInstance<T> ( id: string, instance: T ): void {
		this.instances.set( id, instance );
	}

	remove ( id: string ): void {
		this.metadata.delete( id );
		this.instances.delete( id );
	}

	removeMetadata ( id: string ): void {
		this.metadata.delete( id );
	}

	removeInstance ( id: string ): void {
		this.instances.delete( id );
	}

	has ( id: string ): boolean {
		return this.instances.has( id );
	}
}

