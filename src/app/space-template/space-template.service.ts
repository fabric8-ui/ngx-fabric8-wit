import { Injectable, Inject } from '@angular/core';
import { Headers, Http, URLSearchParams, Response } from '@angular/http';
import { AuthenticationService } from 'ngx-login-client';
import { Logger } from 'ngx-base';
import { Observable } from 'rxjs';
import { SpaceTemplate } from './space-template';
import { WIT_API_URL } from '../api/wit-api';

@Injectable()
export class SpaceTemplateService {

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesTemplatesUrl: string;

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService,
    @Inject(WIT_API_URL) apiUrl: string
  ) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.spacesTemplatesUrl = apiUrl + 'spacetemplates';
  }


  getSpaceTemplates(): Observable<SpaceTemplate[]> {
    return this.http.get(this.spacesTemplatesUrl, { headers: this.headers })
      .map((response) => {
        let templates = response.json().data;
        return templates as SpaceTemplate[];
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }

}
