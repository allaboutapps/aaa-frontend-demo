import { observable, action, computed, ObservableMap, autorun } from "mobx";
import { create, persist } from "mobx-persist";
import * as _ from "lodash";

import { IBeer } from "./IBeer";
import authState from "./authState";
import * as config from "../config";

type IBeersInfo = {
    globalLikes: { [id: string]: number },
    globalComments: { [id: string]: { user: string, comment: string }[] }
};


class BeersState {

    @persist("list") @observable beers: IBeer[] = [];
    @persist @observable remainingRequests: number = 0;
    @observable selectedBeer: IBeer | null = null;
    @observable errorText: string | null = null;
    @observable isRehydrated: boolean = false;
    @persist("list") @observable likedBeerIds: number[] = [];
    @persist("map") @observable commentsMap = new ObservableMap<string>();
    @observable isUploading: boolean = false;
    @persist("object") @observable beersInfo: IBeersInfo | null;

    @persist("map") @observable private uriMap = new ObservableMap<boolean>();

    private disableAutofetchLikedBeers = autorun(() => {
        if (this.likedBeerIds.length === this.likedBeers.length) {
            // noop, all beers were loaded.
            return;
        }

        Promise.all(_.map(this.likedBeerIds, (id) => {
            return this.loadBeer(id);
        }));
    });

    @computed get loading(): boolean {
        return _.reduce(this.uriMap.entries(), (sum, [uri, value]) => {
            return value || sum;
        }, this.isUploading);
    }

    @computed get requestCount(): number {
        return _.reduce(this.uriMap.entries(), (sum, [uri, value]) => {
            return value === false ? sum += 1 : sum;
        }, 0);
    }

    @computed get likedBeers(): IBeer[] {
        return _.filter(this.beers, (beer) => {
            return _.includes(this.likedBeerIds, beer.id);
        });
    }

    isLikedBeer = (id: number): boolean => {
        return _.find(this.likedBeers, { id }) ? true : false;
    }

    @action setComment = (id: number, comment: string | null) => {
        if (!_.find(this.beers, { id })) {
            throw new Error("You are not allowed to setComment on beers not within our cache!");
        }

        if (comment) {
            this.commentsMap.set(`${id}`, comment);
        } else {
            this.commentsMap.delete(`${id}`);
        }

        // save state on server.
        this.uploadStateToUserProfile();
    }

    @action loadBeers = async () => {
        this.beers = this.unionAndSortBeers(await this.getBeersApi());
    }

    @action loadBeer = async (id: number) => {
        let beer = _.find(this.beers, { id });

        if (!beer) {
            // we need to load the beer...
            [beer] = await this.getBeersApi(id);

            if (!beer) {
                throw new Error("Beer not found or currently unavailable!");
            }

            // update our collection.
            this.beers = this.unionAndSortBeers([beer]);
        }

        return beer;
    }

    @action selectBeer = async (idFromUrl: string | number) => {

        this.refreshBeersInfo();

        this.dismissError();

        try {
            const id = _.parseInt(idFromUrl.toString());

            if (_.isFinite(id) === false) {
                throw new Error("Beers can only have numeric ids!");
            }

            this.selectedBeer = await this.loadBeer(id);
        } catch (e) {
            console.error("selectBeer error", e);
            this.errorText = e.message;
        }

    }

    @action toggleLikeBeer = (id: number) => {

        if (this.isLikedBeer(id) === false) {
            this.likedBeerIds.push(id);
        } else {
            // remove mutates array, returns the removed entries!
            _.remove(this.likedBeerIds, (item) => item === id);
        }

        // save state on server.
        this.uploadStateToUserProfile();
    }

    @action deselectBeer = async () => {
        this.selectedBeer = null;
    }

    @action dismissError = () => {
        this.errorText = null;
    }

    @action wipe = () => {

        // never wipe likedBeerIds or comments
        // this.likedBeerIds = [];
        // this.commentsMap.clear();

        this.beers = [];
        this.uriMap.clear();
        this.remainingRequests = 0;
    }

    @action refreshBeersInfo = async () => {

        try {
            const res = await fetch(`${config.API_BASE_URL}/app/v1/beers-info`);
            this.beersInfo = await res.json();
            console.log("refreshBeersInfo");
        } catch (e) {
            console.error("refreshBeersInfo error", e);
            this.errorText = `refreshBeersInfo error: ${e.message}`;
        }
    }

    @action private async getBeersApi(id?: number): Promise<IBeer[]> {

        this.dismissError();

        const uri = `https://api.punkapi.com/v2/beers${id ? "/" + id : ""}`;

        try {

            if (this.uriMap.get(uri) === false) {
                return this.beers;
            }

            this.uriMap.set(uri, true);

            const res = await fetch(uri);

            if (res.status !== 200) {
                throw new Error("API returned unexpected response code: " + res.status);
            }

            const beers = await res.json();
            this.remainingRequests = Number.parseInt(res.headers.get("x-ratelimit-remaining") as string);

            this.uriMap.set(uri, false);

            return beers;

        } catch (e) {
            console.error("getBeersApi error", e);
            this.uriMap.delete(uri);
            this.errorText = e.message;
            return []; // no beers.
        }

    }

    @action private async uploadStateToUserProfile() {
        if (authState.isAuthenticated === false) {
            // noop, we are not authenticated with the server and thus cannot save our changes.
            return;
        }

        this.isUploading = true;

        try {
            const res = await fetch(`${config.API_BASE_URL}/app/v1/user/profile`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${authState.credentials!.accessToken}`
                },
                body: JSON.stringify({
                    data: {
                        commentsMap: this.commentsMap.toJS(),
                        likedBeerIds: this.likedBeerIds
                    }
                })
            });

            if (!res.ok) {
                throw Error(`${res.status}: ${res.statusText}`);
            }

            console.log("uploadStateToUserProfile: successfully uploaded information", await res.json());

        } catch (e) {
            console.error("saveBeersStateToUserProfile error", e);
            this.errorText = e.message;
        }

        this.isUploading = false;

        this.refreshBeersInfo();
    }

    private unionAndSortBeers(newBeers: IBeer[]): IBeer[] {
        const unioned = _.unionWith(this.beers, newBeers, (a, b) => { return a.id === b.id; });
        return _.sortBy(unioned, ["name"]);
    }

}

// persist this mobx state through localforage
const hydrate = create({
    storage: require("localforage"),
});

const beersState = new BeersState();

hydrate("beersState", beersState).then(() => {
    console.log("beerState: successfully rehydrated beerState");
    beersState.isRehydrated = true;
}).catch((e) => {
    console.log("beerState: failed to rehydrate beerState");
    beersState.isRehydrated = true;
});

// singleton, expose an instance by default
export default beersState;
