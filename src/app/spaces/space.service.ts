import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams, Response, RequestOptionsArgs } from '@angular/http';
import { AuthenticationService, User, UserService } from 'ngx-login-client';
import { Logger } from 'ngx-base';
import { Observable } from 'rxjs';

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';

@Injectable()
export class SpaceService {

  private readonly headers = new Headers({ 'Content-Type': 'application/json' });
  private readonly spacesUrl: string;
  private readonly namedSpacesUrl: string;
  private readonly searchSpacesUrl: string;
  private nextLink: string = null;
  private totalCount: number = -1;

  constructor(
    private readonly http: Http,
    private readonly logger: Logger,
    private readonly auth: AuthenticationService,
    private readonly userService: UserService,
    @Inject(WIT_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.spacesUrl = apiUrl + 'spaces';
    this.namedSpacesUrl = apiUrl + 'namedspaces';
    this.searchSpacesUrl = apiUrl + 'search/spaces';
  }

  getSpaces(pageSize: number = 20): Observable<Space[]> {
    const url: string = `${this.spacesUrl}?page[limit]=${pageSize}`;
    return this.getSpacesDelegate(url, true);
  }

  getMoreSpaces(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return Observable.throw('No more spaces found');
    }
  }

  getSpaceByName(userName: string, spaceName: string): Observable<Space> {
    const url: string = `${this.namedSpacesUrl}/${encodeURIComponent(userName)}/${encodeURIComponent(spaceName)}`;
    return this.http.get(url, { headers: this.headers })
      .map((response: Response): Space => response.json().data)
      .switchMap((space: Space): Observable<Space> => this.resolveOwner(space))
      .catch((error: any): Observable<Space> => this.handleError(error));
  }

  getSpacesDelegate(url: string, isAll: boolean, params?: URLSearchParams): Observable<Space[]> {
    const options: RequestOptionsArgs = {
      headers: this.headers
    };
    if (params) {
      options.search = params;
    }
    return this.http
      .get(url, options)
      .map((response: Response): Space[] => {
        // Extract links from JSON API response.
        // and set the nextLink, if server indicates more resources
        // in paginated collection through a 'next' link.
        const links: any = response.json().links;
        if (links.hasOwnProperty('next')) {
          this.nextLink = links.next;
        } else {
          this.nextLink = null;
        }
        let meta = response.json().meta;
        if (meta && meta.hasOwnProperty('totalCount')) {
          this.totalCount = meta.totalCount;
        } else {
          this.totalCount = -1;
        }
        // Extract data from JSON API response, and assert to an array of spaces.
        return response.json().data as Space[];
      })
      .flatMap((spaces: Space[]): Observable<Space[]> => this.resolveOwners(spaces))
      .catch((error: any): Observable<Space[]> => this.handleError(error));
  }

  create(space: Space): Observable<Space> {
    const url: string = this.spacesUrl;
    const payload: string = JSON.stringify({ data: space });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map((response: Response): Space => response.json().data)
      .switchMap((val: Space): Observable<Space> => this.resolveOwner(val))
      .catch((error: any): Observable<Space> => this.handleError(error));
  }

  update(space: Space): Observable<Space> {
    const url: string = `${this.spacesUrl}/${space.id}`;
    const payload: string = JSON.stringify({ data: space });
    return this.http
      .patch(url, payload, { headers: this.headers })
      .map((response: Response): Space => response.json().data)
      .switchMap((val: Space): Observable<Space> => this.resolveOwner(val))
      .catch((error: any): Observable<Space> => this.handleError(error));
  }

  deleteSpace(space: Space, skipCluster: boolean = false): Observable<Space> {
    const url: string = `${this.spacesUrl}/${space.id}`;
    return this.http
      .delete(url, {
        headers: this.headers,
        params: new URLSearchParams(`skipCluster=${skipCluster}`)
      })
      .map(() => {})
      .catch((error: any): Observable<any> => this.handleError(error));
  }

  search(searchText: string, pageSize: number = 20, pageNumber: number = 0): Observable<Space[]> {
    const url: string = this.searchSpacesUrl;
    const params: URLSearchParams = new URLSearchParams();
    if (searchText === '') {
      searchText = '*';
    }
    params.set('q', searchText);
    params.set('page[offset]', String(pageSize * pageNumber));
    params.set('page[limit]', String(pageSize));

    return this.getSpacesDelegate(url, false, params);
  }

  getMoreSearchResults(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return Observable.throw('No more spaces found');
    }
  }

  // Currently serves to fetch the list of all spaces owned by a user.
  getSpacesByUser(userName: string, pageSize: number = 20): Observable<Space[]> {
    const url: string = `${this.namedSpacesUrl}/${encodeURIComponent(userName)}?page[limit]=${pageSize}`;
    return this.getSpacesDelegate(url, false);
  }

  getMoreSpacesByUser(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return Observable.throw('No more spaces found');
    }
  }

  getSpaceById(spaceId: string): Observable<Space> {
    const url: string = `${this.spacesUrl}/${spaceId}`;
    return this.http.get(url, { headers: this.headers })
      .map((response: Response): Space => response.json().data)
      .switchMap((space: Space): Observable<Space> => this.resolveOwner(space))
      .catch((error: any): Observable<Space> => this.handleError(error));
  }

  // returns the "meta.totalCount" field of the previous query. -1 if there is no previous query,
  // or if the previous query did not have the totalCount property.
  getTotalCount(): Observable<number> {
    return Observable.of(this.totalCount);
  }

  private handleError(error: any): Observable<any> {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

  private resolveOwner(space: Space): Observable<Space> {
    space.relationalData = space.relationalData || {};

    if (!space.relationships['owned-by'] || !space.relationships['owned-by'].data) {
      space.relationalData.creator = null;
      return;
    }
    return this.userService
      .getUserByUserId(space.relationships['owned-by'].data.id)
      .map((owner: User): Space => {
        space.relationalData.creator = owner;
        return space;
      });
  }

  private resolveOwners(spaces: Space[]): Observable<Space[]> {
    return Observable
      // Get a stream of spaces
      .from(spaces)
      // Map to a stream of owner Ids of these spaces
      .map((space: Space): string => space.relationships['owned-by'].data.id)
      // Get only the unique owners in this stream of owner Ids
      .distinct()
      // Get the users from the server based on the owner Ids
      // and flatten the resulting stream , observables are returned
      .flatMap((ownerId: string): Observable<User> =>
        this.userService.getUserByUserId(ownerId).catch(err => {
          console.log('Error fetching user', ownerId, err);
          return Observable.empty<User>();
        }))
      // map the user objects back to the spaces to return a stream of spaces
      .toArray()
      .map((owners: User[]): Space[] => {
        owners.forEach((owner: User): void => {
          spaces
            .filter((space: Space): boolean => space.relationships['owned-by'].data.id === owner.id)
            .forEach((space: Space): void => {
              space.relationalData = space.relationalData || {};
              space.relationalData.creator = owner;
            });
        });
        return spaces;
      });
  }

}
