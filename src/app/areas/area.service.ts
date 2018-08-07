import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';

import { AuthenticationService } from 'ngx-login-client';
import { Logger } from 'ngx-base';
import { Observable, throwError as observableThrowError } from 'rxjs';

import { WIT_API_URL } from '../api/wit-api';
import { Area } from '../models/area';

@Injectable()
export class AreaService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesUrl: string;
  private areasUrl: string;

  constructor(
    private http: Http,
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
    return this.http.get(url, { headers: this.headers })
      .map((response) => {
        return response.json().data as Area;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  getAllBySpaceId(spaceId: string): Observable<Area[]> {
    let url = this.spacesUrl + '/' + spaceId + '/areas';
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {
        let newAreas: Area[] = response.json().data as Area[];
        return newAreas;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  create(parentId: string, area: Area): Observable<Area> {
    let url = this.areasUrl + '/' + parentId;
    let payload = JSON.stringify({ data: area });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as Area;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return observableThrowError(error.message || error);
  }

}
