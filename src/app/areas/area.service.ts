import { Injectable, Inject } from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpParams,
  HttpResponse
} from '@angular/common/http';

import {
  Observable,
  throwError as observableThrowError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import { AuthenticationService } from 'ngx-login-client';
import { Logger } from 'ngx-base';

import { WIT_API_URL } from '../api/wit-api';
import { Area } from '../models/area';

@Injectable()
export class AreaService {

  spacesUrl: string;
  areasUrl: string;

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(
    private http: HttpClient,
    private logger: Logger,
    private auth: AuthenticationService,
    @Inject(WIT_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.spacesUrl = apiUrl + 'spaces';
    this.areasUrl = apiUrl + 'areas';
  }

  getById(areaId: string): Observable<Area> {
    let url = `${this.areasUrl}/${areaId}`;
    return this.http.get<Area>(url, { headers: this.headers })
      .pipe(
        map((response: any) => {
          return response.data as Area;
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getAllBySpaceId(spaceId: string): Observable<Area[]> {
    let url = this.spacesUrl + '/' + spaceId + '/areas';
    return this.http.get<Area[]>(url, { headers: this.headers })
      .pipe(
        map((response: any) => {
          let newAreas: Area[] = response.data as Area[];
          return newAreas;
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  create(parentId: string, area: Area): Observable<Area> {
    let url = this.areasUrl + '/' + parentId;
    let payload = JSON.stringify({ data: area });
    return this.http.post<Area>(url, payload, { headers: this.headers })
      .pipe(
        map((response: any) => {
          return response.data as Area;
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  private handleError(error: any) {
    this.logger.error(error);
    return observableThrowError(error.message || error);
  }

}
