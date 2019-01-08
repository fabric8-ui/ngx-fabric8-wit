import { Injectable, Inject } from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  from as observableFrom,
  Observable,
  of as observableOf,
  throwError as observableThrowError
} from 'rxjs';
import {
  catchError,
  distinct,
  flatMap,
  map,
  switchMap,
  toArray
} from 'rxjs/operators';

import { Logger } from 'ngx-base';
import { User, UserService } from 'ngx-login-client';

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';

@Injectable()
export class SpaceService {

  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  private readonly spacesUrl: string;
  private readonly namedSpacesUrl: string;
  private readonly searchSpacesUrl: string;
  private nextLink: string = null;
  private totalCount: number = -1;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: Logger,
    private readonly userService: UserService,
    @Inject(WIT_API_URL) apiUrl: string) {
    this.spacesUrl = apiUrl + 'spaces';
    this.namedSpacesUrl = apiUrl + 'namedspaces';
    this.searchSpacesUrl = apiUrl + 'search/spaces';
  }

  getSpaces(pageSize: number = 20): Observable<Space[]> {
    if (pageSize <= 0) {
      return observableThrowError('Page limit cannot be less or equal 0');
    }
    const url: string = `${this.spacesUrl}?page[limit]=${pageSize}`;
    return this.getSpacesDelegate(url, true);
  }

  getMoreSpaces(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return observableThrowError('No more spaces found');
    }
  }

  getSpaceByName(userName: string, spaceName: string): Observable<Space> {
    if (!userName) {
      return observableThrowError('User name cannot be empty');
    }
    if (!spaceName) {
      return observableThrowError('Space name cannot be empty');
    }
    const url: string = `${this.namedSpacesUrl}/${encodeURIComponent(userName)}/${encodeURIComponent(spaceName)}`;
    return this.http.get<Space>(url, { headers: this.headers })
      .pipe(
        map((response: any): Space => response.data),
        switchMap((space: Space): Observable<Space> => this.resolveOwner(space)),
        catchError((error: any): Observable<Space> => this.handleError(error))
      );
  }

  getSpacesDelegate(url: string, isAll: boolean, params?: HttpParams): Observable<Space[]> {
    // Set the GET options to include the search params if they are sent, if not then just the headers.
    const options = params ? { headers: this.headers, params: params } : { headers: this.headers };

    return this.http.get(url, options)
      .pipe(
        map((response: any): Space[] => {
          // Extract links from JSON API response.
          // and set the nextLink, if server indicates more resources
          // in paginated collection through a 'next' link.
          const links: any = response.links;
          if (links && links.hasOwnProperty('next')) {
            this.nextLink = links.next;
          } else {
            this.nextLink = null;
          }
          let meta = response.meta;
          if (meta && meta.hasOwnProperty('totalCount')) {
            this.totalCount = meta.totalCount;
          } else {
            this.totalCount = -1;
          }
          // Extract data from JSON API response, and assert to an array of spaces.
          return response.data as Space[];
        }),
        flatMap((spaces: Space[]): Observable<Space[]> => this.resolveOwners(spaces)),
        catchError((error: any): Observable<Space[]> => this.handleError(error))
      );
  }

  create(space: Space): Observable<Space> {
    if (!space) {
      return observableThrowError('Space cannot be undefined');
    }
    const url: string = this.spacesUrl;
    const payload: string = JSON.stringify({ data: space });
    return this.http.post<Space>(url, payload, { headers: this.headers })
      .pipe(
        map((response: any): Space => response.data),
        switchMap((val: Space): Observable<Space> => this.resolveOwner(val)),
        catchError((error: any): Observable<Space> => this.handleError(error))
      );
  }

  update(space: Space): Observable<Space> {
    if (!space) {
      return observableThrowError('Space cannot be undefined');
    }
    const url: string = `${this.spacesUrl}/${space.id}`;
    const payload: string = JSON.stringify({ data: space });
    return this.http.patch<Space>(url, payload, { headers: this.headers })
      .pipe(
        map((response: any): Space => response.data),
        switchMap((val: Space): Observable<Space> => this.resolveOwner(val)),
        catchError((error: any): Observable<Space> => this.handleError(error))
      );
  }

  delete(space: Space, skipCluster: boolean = false): Observable<Space> {
    if (!space) {
      return observableThrowError('Space cannot be undefined');
    }
    const url: string = `${this.spacesUrl}/${space.id}`;
    const options = { headers: this.headers, params: new HttpParams().set('skipCluster', skipCluster.toString()) };
    return this.http.delete(url, options)
      .pipe(
        map(() => {}),
        catchError((error: any): Observable<any> => this.handleError(error))
      );
  }

  search(searchText: string = '*', pageSize: number = 20, pageNumber: number = 0): Observable<Space[]> {
    if (searchText === '') {
      searchText = '*';
    }
    if (!searchText) {
      return observableThrowError('Search query cannot be undefined');
    }
    if (pageSize <= 0) {
      return observableThrowError('Page limit cannot be less or equal 0');
    }
    if (pageNumber < 0) {
      return observableThrowError('Page offset cannot be less than 0');
    }
    const url: string = this.searchSpacesUrl;
    const params: HttpParams = new HttpParams().set('q', searchText)
      .append('page[offset]', (pageSize * pageNumber).toString())
      .append('page[limit]', pageSize.toString());

    return this.getSpacesDelegate(url, false, params);
  }

  getMoreSearchResults(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return observableThrowError('No more spaces found');
    }
  }

  /**
   * @deprecated use SpaceService.getSpacesByName
   */
  getSpacesByUser(userName: string, pageSize: number = 20): Observable<Space[]> {
    return this.getSpacesByName(userName, pageSize);
  }

  // Currently serves to fetch the list of all spaces owned by a user.
  getSpacesByName(userName: string, pageSize: number = 20): Observable<Space[]> {
    if (!userName) {
      return observableThrowError('User name cannot be empty');
    }
    if (pageSize <= 0) {
      return observableThrowError('Page limit cannot be less or equal 0');
    }
    const url: string = `${this.namedSpacesUrl}/${encodeURIComponent(userName)}?page[limit]=${pageSize}`;
    return this.getSpacesDelegate(url, false);
  }

  /**
   * @deprecated use SpaceService.getMoreSpacesByName
   */
  getMoreSpacesByUser(): Observable<Space[]> {
    return this.getMoreSpacesByName();
  }

  getMoreSpacesByName(): Observable<Space[]> {
    if (this.nextLink) {
      return this.getSpacesDelegate(this.nextLink, false);
    } else {
      return observableThrowError('No more spaces found');
    }
  }

  getSpaceById(spaceId: string): Observable<Space> {
    if (!spaceId) {
      return observableThrowError('ID cannot be empty');
    }
    const url: string = `${this.spacesUrl}/${encodeURIComponent(spaceId)}`;
    return this.http.get<Space>(url, { headers: this.headers })
      .pipe(
        map((response: any): Space => response.data),
        switchMap((space: Space): Observable<Space> => this.resolveOwner(space)),
        catchError((error: any): Observable<Space> => this.handleError(error))
      );
  }

  // returns the "meta.totalCount" field of the previous query. -1 if there is no previous query,
  // or if the previous query did not have the totalCount property.
  getTotalCount(): Observable<number> {
    return observableOf(this.totalCount);
  }

  private handleError(error: any): Observable<any> {
    this.logger.error(error);
    return observableThrowError(error.message || error);
  }

  private resolveOwner(space: Space): Observable<Space> {
    space.relationalData = space.relationalData || {};

    if (!space.relationships['owned-by'] || !space.relationships['owned-by'].data) {
      space.relationalData.creator = null;
      return observableThrowError('Relationships in space object not defined');
    }
    return this.userService.getUserByUserId(space.relationships['owned-by'].data.id)
      .pipe(
        map((owner: User): Space => {
          space.relationalData.creator = owner;
          return space;
        }),
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  private resolveOwners(spaces: Space[]): Observable<Space[]> {
    // Get a stream of spaces
    return observableFrom(spaces)
      .pipe(
        // Map to a stream of owner Ids of these spaces
        map((space: Space): string => space.relationships['owned-by'].data.id),
        // Get only the unique owners in this stream of owner Ids
        distinct(),
        // Get the users from the server based on the owner Ids
        // and flatten the resulting stream , observables are returned
        flatMap((ownerId: string): Observable<User> =>
          this.userService.getUserByUserId(ownerId)
            .pipe(
              catchError(error => {
                return this.handleError(error);
              })
            )
        ),
        // map the user objects back to the spaces to return a stream of spaces
        toArray(),
        map((owners: User[]): Space[] => {
          owners.forEach((owner: User): void => {
            spaces
              .filter((space: Space): boolean => space.relationships['owned-by'].data.id === owner.id)
              .forEach((space: Space): void => {
                space.relationalData = space.relationalData || {};
                space.relationalData.creator = owner;
              });
          });
          return spaces;
        })
      );
  }
}
