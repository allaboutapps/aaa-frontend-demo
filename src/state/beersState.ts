import { observable, action } from "mobx";
import * as _ from "lodash";

import { IBeer } from "./IBeer";

class BeersState {

    @observable loading: boolean = false;
    @observable beers: IBeer[] = [];
    @observable remainingRequests: number = 0;
    @observable selectedBeer: IBeer | null = null;

    @action loadBeers = async () => {
        this.beers = this.unionAndSortBeers(await this.getBeersApi());
    }

    @action selectBeer = async (id: number) => {

        let beer = _.find(this.beers, { id });

        if (!beer) {
            // we need to load the beer...
            [ beer ] = await this.getBeersApi(id);

            // update our collection.
            this.beers = this.unionAndSortBeers([ beer ]);
        }

        this.selectedBeer = beer;
    }

    @action deselectBeer = async () => {
        this.selectedBeer = null;
    }

    @action private async getBeersApi(id?: number): Promise<IBeer[]> {
        const uri = `https://api.punkapi.com/v2/beers${id ? "/" + id : ""}`;

        this.loading = true;

        const res = await fetch(uri);
        const beers = await res.json();
        
        this.remainingRequests = Number.parseInt(res.headers.get("x-ratelimit-remaining") as string);

        this.loading = false;

        return beers;

    }

    private unionAndSortBeers(newBeers: IBeer[]): IBeer[] {
        const unioned = _.unionWith(this.beers, newBeers, (a, b) => { return a.id === b.id; });
        return _.sortBy(unioned, ["name"]);
    }

}

// singleton, expose an instance by default
export default new BeersState();