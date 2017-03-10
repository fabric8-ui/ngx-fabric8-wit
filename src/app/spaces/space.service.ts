import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService, Logger, User, UserService } from 'ngx-login-client';
import { Observable } from "rxjs";

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';

@Injectable()
export class SpaceService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesUrl: string;
  private namedSpacesUrl: string;
  private searchSpacesUrl: string;
  private nextLink: string = null;

  // Array of all spaces that have been retrieved from the REST API.
  private spaces: Space[] = [];
  // Map of space instances with key = spaceId, and
  // value = array index of space in spaces array instance.
  private spaceIdIndexMap: { [spaceId:string] : number } = {};

  // Map to store all user Ids
  private userIdMap: { [userId:string] : User } = {};

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService,
    private userService: UserService,
    @Inject(WIT_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.spacesUrl = apiUrl + 'spaces';
    this.namedSpacesUrl = apiUrl + 'namedspaces';
    this.searchSpacesUrl = apiUrl + 'search/spaces';
  }

  getSpaces(pageSize: number = 20): Observable<Space[]> {
    let url = this.spacesUrl + '?page[limit]=' + pageSize;
    let isAll = true;
    return this.getSpacesDelegate(url, isAll);
  }

  getMoreSpaces(): Observable<Space[]> {
    if (this.nextLink) {
      let isAll = false;
      return this.getSpacesDelegate(this.nextLink, isAll);
    } else {
      return Observable.throw('No more spaces found');
    }
  }

  getSpaceByName(userName: string, spaceName: string): Observable<Space> {
    let result = this.spaces.find(space => space.attributes.name === spaceName);
    if (result == null) {
      let url = `${this.namedSpacesUrl}/${userName}/${spaceName}`;
      return this.http.get(url, { headers: this.headers } )
        .map((response) => {
          this.buildUserIdMap();
          let space: Space = response.json().data as Space;
          this.resolveUsersForSpace(space);
          this.spaces.splice(this.spaces.length, 0, space);
          this.buildSpaceIndexMap();
          return space;
        })
        .catch((error) => {return this.handleError(error)});
    } else {
      return Observable.from([result]);
    }
  }

  getSpacesDelegate(url: string, isAll: boolean): Observable<Space[]> {
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {
        this.buildUserIdMap();
        // Extract links from JSON API response.
        // and set the nextLink, if server indicates more resources
        // in paginated collection through a 'next' link.
        let links = response.json().links;
        if (links.hasOwnProperty('next')) {
          this.nextLink = links.next;
        } else {
          this.nextLink = null;
        }
        // Extract data from JSON API response, and assert to an array of spaces.
        let newSpaces: Space[] = response.json().data as Space[];
        newSpaces.forEach((newSpace) => {
          this.resolveUsersForSpace(newSpace);
        });
        let newItems = cloneDeep(newSpaces);
        // Update the existing spaces list with new data
        this.updateSpacesList(newItems);
        if (isAll) {
          return this.spaces;
        } else {
          return newSpaces;
        }
      })
      .catch((error) => { return this.handleError(error)});
  }

  create(space: Space): Observable<Space> {
    let url = this.spacesUrl;
    let payload = JSON.stringify({ data: space });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map(response => {
        this.buildUserIdMap();
        let newSpace: Space = response.json().data as Space;
        this.resolveUsersForSpace(newSpace);
        // Add the newly created space at the top of the spaces list.
        this.spaces.splice(0, 0, newSpace);
        // Rebuild the map after updating the list
        this.buildSpaceIndexMap();
        return newSpace;
      })
      .catch((error) => { return this.handleError(error)});
  }

  update(space: Space): Observable<Space> {
    let url = `${this.spacesUrl}/${space.id}`;
    let payload = JSON.stringify({data: space});
    return this.http
      .patch(url, payload, {headers: this.headers})
      .map(response => {
        this.buildUserIdMap();
        let updatedSpace = response.json().data as Space;
        this.resolveUsersForSpace(updatedSpace);
        // Find the index in the big list
        let updateIndex = this.spaces.findIndex(item => item.id == updatedSpace.id);
        if (updateIndex > -1) {
          // Update space attributes
          this.spaces[updateIndex].attributes = updatedSpace.attributes;
        }
        return updatedSpace;
      })
      .catch((error) => { return this.handleError(error)});
  }

  search(searchText: string): Observable<Space[]> {
    let url = this.searchSpacesUrl;
    let params: URLSearchParams = new URLSearchParams();
    if (searchText == '') {
      searchText = '*';
    }
    params.set("q", searchText);

    return this.http
      .get(url, {search: params, headers: this.headers})
      .map(response => {
        this.buildUserIdMap();
        // Extract data from JSON API response, and assert to an array of spaces.
        let newSpaces: Space[] = response.json().data as Space[];
        newSpaces.forEach((newSpace) => {
          this.resolveUsersForSpace(newSpace);
        });
        return newSpaces;
      })
      .catch((error) => { return this.handleError(error)});
  }


  // Adds or updates the client-local list of spaces,
  // with spaces retrieved from the server, usually as a page in a paginated collection.
  // If a space already exists in the client-local collection,
  // then it's attributes are updated to the values fetched from the server.
  // If a space did not exist in the client-local collection, then the space is inserted.
  private updateSpacesList(spaces: Space[]): void {
    spaces.forEach((space) => {
      if (space.id in this.spaceIdIndexMap) {
        this.spaces[this.spaceIdIndexMap[space.id]].attributes =
          cloneDeep(space.attributes);
      } else {
        this.spaces
          .splice(this.spaces.length, 0, space);
      }
    });
    // Re-build the map once done updating the list
    this.buildSpaceIndexMap();
  }

  private buildSpaceIndexMap(): void {
    this.spaces.forEach((space, index) => {
      this.spaceIdIndexMap[space.id] = index;
    });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

  private resolveUsersForSpace(space: Space): void {
    if (!space.hasOwnProperty('relationalData')) {
      space.relationalData = {};
    }
    this.resolveOwner(space);
  }

  private resolveOwner(space: Space) {
    if (!space.relationships.hasOwnProperty('owned-by') || !space.relationships['owned-by']) {
      space.relationalData.creator = null;
      return;
    }
    if (!space.relationships['owned-by'].hasOwnProperty('data')) {
      space.relationalData.creator = null;
      return;
    }
    if (!space.relationships['owned-by'].data) {
      space.relationalData.creator = null;
      return;
    }
    space.relationalData.creator = this.getUserById(space.relationships['owned-by'].data.id);
  }

  private getUserById(userId: string): User {
    if (userId in this.userIdMap) {
      return this.userIdMap[userId];
    } else {
      return null;
    }
  }

  /**
   * Usage: Build a ID-User map to dynamically access list of users
   * This method takes the locally saved list of users from User Service
   * The method assumes the users to have been fetched before hand using the UserService.
   */
  buildUserIdMap(): void {
    // Fetch the current updated locally saved user list
    let users: User[] = this.userService.getLocallySavedUsers() as User[];
    // Check if the map is outdated or not and if yes then rebuild it
    if (Object.keys(this.userIdMap).length < users.length) {
      this.userIdMap = {};
      users.forEach((user) => {
        this.userIdMap[user.id] = user;
      });
    }
  }
}
