import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { RoadLinker } from "../link/road-linker";
import { TvJunction } from "./junctions/tv-junction";
import { LinkFactory } from "./link-factory";
import { TvContactPoint } from "./tv-common";
import { TvLink, TvLinkType } from "./tv-link";
import { TvRoadLinkNeighbor } from "./tv-road-link-neighbor";
import { TvRoad } from "./tv-road.model";

export class TvRoadRelations {

	private successor?: TvLink;

	private predecessor?: TvLink;

	private neighbors: TvRoadLinkNeighbor[] = [];

	constructor ( private road: TvRoad ) { }

	setSuccessorRoad ( road: TvRoad, contactPoint: TvContactPoint ): void {
		this.setSuccessorLink( TvLinkType.ROAD, road, contactPoint );
	}

	setSuccessorLink ( type: TvLinkType, element: TvRoad | TvJunction, contact?: TvContactPoint ): void {
		this.setSuccessor( LinkFactory.createLink( type, element, contact ) );
	}

	setSuccessor ( link: TvLink ): void {
		if ( link?.equals( this.road ) ) {
			throw new Error( "A road cannot be its own successor." );
		}
		this.successor = link;
	}

	removeSuccessor (): void {
		this.successor?.removeLinks();
		this.road.getLaneProfile().getLastLaneSection()?.removeSuccessorLinks();
		this.successor = null;
	}

	setPredecessorRoad ( road: TvRoad, contactPoint: TvContactPoint ): void {
		this.setPredecessorLink( TvLinkType.ROAD, road, contactPoint );
	}

	setPredecessorLink ( type: TvLinkType, element: TvRoad | TvJunction, contact?: TvContactPoint ): void {
		this.setPredecessor( LinkFactory.createLink( type, element, contact ) );
	}

	setPredecessor ( link: TvLink ): void {
		if ( link?.equals( this.road ) ) {
			throw new Error( "A road cannot be its own predecessor." );
		}
		this.predecessor = link;
	}

	removePredecessor (): void {
		this.predecessor?.removeLinks();
		this.predecessor = null;
		this.road.getLaneProfile().getFirstLaneSection()?.removePredecessorLinks();
	}

	linkSuccessorRoad ( road: TvRoad, contact: TvContactPoint ): void {
		RoadLinker.instance.linkSuccessorRoad( this.road, road, contact );
	}

	linkSuccessor (): void {
		if ( !this.successor || this.successor.isRoad ) return;
		this.linkSuccessorRoad( this.successor.getElement<TvRoad>(), this.successor.contactPoint );
	}

	linkPredecessorRoad ( road: TvRoad, contact: TvContactPoint ): void {
		RoadLinker.instance.linkPredecessorRoad( this.road, road, contact );
	}

	linkPredecessor (): void {
		if ( !this.predecessor || this.predecessor.isRoad ) return;
		this.linkPredecessorRoad( this.predecessor.getElement<TvRoad>(), this.predecessor.contactPoint );
	}

	linkJunction ( junction: TvJunction, contact: TvContactPoint ): void {
		if ( contact == TvContactPoint.START ) {
			this.setPredecessorLink( TvLinkType.JUNCTION, junction, contact );
		} else {
			this.setSuccessorLink( TvLinkType.JUNCTION, junction, contact );
		}
	}

	getSuccessorSpline (): AbstractSpline | undefined {
		return this.successor?.getSpline();
	}

	getSuccessor (): TvLink {
		return this.successor;
	}

	getPredecessor (): TvLink {
		return this.predecessor;
	}

	getPredecessorSpline (): AbstractSpline | undefined {
		return this.predecessor?.getSpline();
	}

}
