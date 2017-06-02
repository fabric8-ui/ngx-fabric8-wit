import { async, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';
import { WIT_API_URL } from "../api/wit-api";
import { SpaceTemplateService } from './space-template.service';
import { SpaceTemplate } from './space-template';

describe('Service: SpaceTemplateService', () => {
  let mockService: MockBackend;
  let fakeAuthService: any;
  let service: SpaceTemplateService;
  let loggerMock: any;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('Looger', ['error'])
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return true;
      }
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Logger, useValue: loggerMock
        },
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend,
                       options: BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        {
          provide: WIT_API_URL,
          useValue: "http://example.com"
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        SpaceTemplateService,
        Broadcaster
      ]
    });
  });

  beforeEach(inject(
    [MockBackend, SpaceTemplateService],
    (mock: MockBackend, serviceInjected: SpaceTemplateService) => {
      mockService = mock;
      service = serviceInjected;
    }
  ));

let spaceTemplates = [
  {
    "attributes": {
      "created-at": "0001-01-01T00:00:00Z",
      "description": "Scrum-based planning",
      "name": "Scrum",
      "template": "LS0tC",
      "updated-at": "0001-01-01T00:00:00Z",
      "version": 0
    },
    "id": "aa83de92-33c1-44d1-a6ff-3b9a89ead383",
    "links": {
      "self": "http://localhost:8080/api/spacetemplates/aa83de92-33c1-44d1-a6ff-3b9a89ead383"
    },
    "type": "spacetemplates"
  },
  {
    "attributes": {
      "created-at": "2017-05-29T15:55:47.752546Z",
      "description": "A very simple development methodology focused on the tracking of Issues and the Tasks needed to be completed to resolve a particular Issue.",
      "name": "Issue Tracking",
      "template": "LS0tCW5nIgoBUYXNrIgogICAgdG9wb2xvZ3k6IHRyZWUKLi4u",
      "updated-at": "2017-05-29T15:55:47.752546Z",
      "version": 0
    },
    "id": "018443b8-e204-4913-96f7-1802eec235b4",
    "links": {
      "self": "http://localhost:8080/api/spacetemplates/018443b8-e204-4913-96f7-1802eec235b4"
    },
    "type": "spacetemplates"
  }];
  let response = { data: spaceTemplates, links: {} };

  it('Get Space Templates', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    // when
    service.getSpaceTemplates().subscribe(data => {
      // then
      expect(data[0].id).toEqual(spaceTemplates[0].id);
      expect(data[0].attributes.name).toEqual(spaceTemplates[0].attributes.name);
     });
  }));

  it('Get Space Templates in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    service.getSpaceTemplates().subscribe(data => {
        fail('Get Space Templates in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));
});
