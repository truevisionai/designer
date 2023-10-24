import { Manager } from "./manager";

export class ManagerRegistry {

	private static managers = new Map<string, Manager>();

	public static registerManager<T extends Manager> ( ctor: new () => T ): T {

		const instance = new ctor();

		this.managers.set( ctor.name, instance );

		return instance;

	}

	public static getManager<T extends Manager> ( name: string ): T {

		return this.managers.get( name ) as T;

	}

	public static initManagers () {

		this.managers.forEach( manager => {

			manager.init();

		} );
	}

}

