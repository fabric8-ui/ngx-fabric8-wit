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
  let mockLog: any;

  beforeEach(() => {
    mockLog = jasmine.createSpyObj('Logger', ['error']);
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
          provide: Logger, useValue: mockLog
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
        'version': 0,
        'parent_path': '/',
        'parent_path_resolved': '/'
      },
      'links': null,
      'relationships': null,
      'id': '1',
      'type': 'areas',
    }
  ];
  let response = { data: responseData, links: {} };
  let expectedResponse = cloneDeep(responseData);

  it('Get areas', async(() => {
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
    areaService.getAllBySpaceId('1').subscribe((data: Area[]) => {
      // then
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
    });
  }));

  it('Get areas in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    areaService.getAllBySpaceId('1').subscribe((data: Area[]) => {
      fail('Get areas should be in error');
    }, // then
    error => expect(error).toEqual('some error'));
  }));

  it('Add new area', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 201
        })
      ));
    });
    // when
    areaService.create('1', responseData[0])
      .subscribe((data: Area) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
      });
  }));

  it('Add new area in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    areaService.create('1', responseData[0])
      .subscribe((data: Area) => {
        fail('Add new area should be in error');
      }, // then
    error => expect(error).toEqual('some error'));
  }));

  it('Get a single area by Id', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });
    let areaId = '1';
    // when
    areaService.getById(areaId)
      .subscribe((data: Area) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
      });
  }));

  it('Get a single area by Id in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    let areaId = '1';
    // when
    areaService.getById(areaId)
      .subscribe((data: Area) => {
        fail('Get a single area by Id should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));
});
