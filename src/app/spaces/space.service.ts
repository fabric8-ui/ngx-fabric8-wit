import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { cloneDeep } from 'lodash';
import { AuthenticationService, Logger, User, UserService } from 'ngx-login-client';
import { Observable } from 'rxjs';

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';

@Injectable()
export class SpaceService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesUrl: string;
  private namedSpacesUrl: string;
  private searchSpacesUrl: string;
  private nextLink: string = null;

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
    let url = `${this.namedSpacesUrl}/${userName}/${spaceName}`;
    return this.http.get(url, { headers: this.headers })
      .map((response) => {
        return response.json().data as Space;
      })
      .switchMap(val => this.resolveOwner(val))
      .catch((error) => {
        return this.handleError(error);
      });
  }

  getSpacesDelegate(url: string, isAll: boolean): Observable<Space[]> {
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {
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
        return newSpaces;
      })
      .switchMap(val => {
        return Observable.forkJoin(
          val.map(space => this.resolveOwner(space))
        );
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  create(space: Space): Observable<Space> {
    let url = this.spacesUrl;
    let payload = JSON.stringify({ data: space });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as Space;
      })
      .switchMap(val => {
        return this.resolveOwner(val);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  update(space: Space): Observable<Space> {
    let url = `${this.spacesUrl}/${space.id}`;
    let payload = JSON.stringify({ data: space });
    return this.http
      .patch(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as Space;
      })
      .switchMap(val => {
        return this.resolveOwner(val);
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  search(searchText: string): Observable<Space[]> {
    let url = this.searchSpacesUrl;
    let params: URLSearchParams = new URLSearchParams();
    if (searchText === '') {
      searchText = '*';
    }
    params.set('q', searchText);

    return this.http
      .get(url, { search: params, headers: this.headers })
      .map(response => {
        // Extract data from JSON API response, and assert to an array of spaces.
        return response.json().data as Space[];
      })
      .switchMap(val => {
        return Observable.forkJoin(
          val.map(space => this.resolveOwner(space))
        );
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

  private resolveOwner(space: Space): Observable<Space> {
    space.relationalData = space.relationalData || {};

    if (!space.relationships['owned-by'] || !space.relationships['owned-by'].data) {
      space.relationalData.creator = null;
      return;
    }
    return this
      .getUserById(space.relationships['owned-by'].data.id)
      .map(owner => {
        space.relationalData.creator = owner;
        return space;
      });
  }

  private getUserById(userId: string): Observable<User> {
    return this.userService.getAllUsers().map(val => {
      for (let u of val) {
        if (userId === u.id) {
          return u;
        }
      }
      return {} as User;
    });
  }

}
