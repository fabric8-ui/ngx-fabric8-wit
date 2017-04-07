import { async, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, UserService, AUTH_API_URL } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from "../api/wit-api";
import { Area } from '../models/area';
import { AreaService } from './area.service';

describe('Service: AreaService', () => {

  let areaService: AreaService;
  let mockService: MockBackend;
  let fakeAuthService: any;

  beforeEach(() => {
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
        Logger,
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
        AreaService,
        {
          provide: WIT_API_URL,
          useValue: "http://example.com"
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        UserService,
        Broadcaster
      ]
    });
  });

  beforeEach(inject(
    [AreaService, MockBackend],
    (service: AreaService, mock: MockBackend) => {
      areaService = service;
      mockService = mock;
    }
  ));

  let responseData: Area[] = [
    {
      'attributes': {
        'name': 'TestArea',
        'created-at': null,
        'updated-at': null,
        'version': 0
      },
      'id': '1',
      'type': 'areas',
    }
  ];
  let response = { data: responseData, links: {} };
  let expectedResponse = cloneDeep(responseData);


  it('Get areas', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    areaService.getAllBySpaceId('1').subscribe((data: Area[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
    });
  }));

  it('Add new area', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 201
        })
      ));
    });

    areaService.create('1', responseData[0])
      .subscribe((data: Area) => {
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
      });
  }));

  it('Get a single area by Id', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });

    let areaId = '1';

    areaService.getById(areaId)
      .subscribe((data: Area) => {
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
      });
  }));

});
