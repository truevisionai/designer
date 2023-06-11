/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// helper class to map all unique names in the scenario
export class OscNameDB {

	private story: Map<string, null> = new Map<string, null>();
	private entity: Map<string, null> = new Map<string, null>();
	private act: Map<string, null> = new Map<string, null>();
	private sequence: Map<string, null> = new Map<string, null>();
	private maneuver: Map<string, null> = new Map<string, null>();
	private event: Map<string, null> = new Map<string, null>();
	private action: Map<string, null> = new Map<string, null>();
	private trajectory: Map<string, null> = new Map<string, null>();

	private route: Map<string, null> = new Map<string, null>();
	private driver: Map<string, null> = new Map<string, null>();
	private controller: Map<string, null> = new Map<string, null>();
	private environment: Map<string, null> = new Map<string, null>();
	private trafficDefinition: Map<string, null> = new Map<string, null>();
	// private pedestrian: Map<string, null> = new Map<string, null>();
	// private vehicle: Map<string, null> = new Map<string, null>();
	// private miscObject: Map<string, null> = new Map<string, null>();
	private condition: Map<string, null> = new Map<string, null>();
	private parameters: Map<string, null> = new Map<string, null>();

	clear () {

		this.story.clear();
		this.entity.clear();
		this.act.clear();
		this.sequence.clear();
		this.maneuver.clear();
		this.event.clear();
		this.action.clear();
		this.trajectory.clear();

	}


	public has_story ( name: string ): boolean {
		return this.story.has( name );
	}

	public has_entity ( name: string ): boolean {
		return this.entity.has( name );
	}

	public has_act ( name: string ): boolean {
		return this.act.has( name );
	}

	public has_sequence ( name: string ): boolean {
		return this.sequence.has( name );
	}

	public has_maneuver ( name: string ): boolean {
		return this.maneuver.has( name );
	}

	public has_event ( name: string ): boolean {
		return this.event.has( name );
	}

	public has_action ( name: string ): boolean {
		return this.action.has( name );
	}

	public has_trajectory ( name: string ): boolean {
		return this.trajectory.has( name );
	}


	public add_story ( name: string, value?: any ): void {
		this.story.set( name, value );
	}

	public add_entity ( name: string, value?: any ): void {
		this.entity.set( name, value );
	}

	public add_act ( name: string, value?: any ): void {
		this.act.set( name, value );
	}

	public add_sequence ( name: string, value?: any ): void {
		this.sequence.set( name, value );
	}

	public add_maneuver ( name: string, value?: any ): void {
		this.maneuver.set( name, value );
	}

	public add_event ( name: string, value?: any ): void {
		this.event.set( name, value );
	}

	public add_action ( name: string, value?: any ): void {
		this.action.set( name, value );
	}

	public add_trajectory ( name: string, value?: any ): void {
		this.trajectory.set( name, value );
	}

	public remove_entity ( name: string ) {
		this.entity.delete( name );
	}
}

