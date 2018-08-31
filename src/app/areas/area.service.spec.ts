import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService, UserService, AUTH_API_URL } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from '../api/wit-api';
import { Area } from '../models/area';
import { AreaService } from './area.service';

describe('Service: AreaService', () => {

  let areaService: AreaService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
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
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: Logger, useValue: mockLog
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        AreaService,
        {
          provide: WIT_API_URL,
          useValue: 'http://example.com/'
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        {
          provide: UserService,
          deps: [HttpClient, Logger, Broadcaster, AUTH_API_URL]
        },
        Broadcaster
      ]
    });

    areaService = TestBed.get(AreaService);
    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    // httpTestingController.verify();
  });

  let responseDataA: Area[] = [
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
      'type': 'areas'
    }
  ];
  let responseA = { data: responseDataA, links: {} };
  let responseData: Area = {
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
    'type': 'areas'
  };
  let response = { data: responseData, links: {} };

  describe('#getAllBySpaceId', () => {
    it('should get areas', (done: DoneFn) => {
      // when
      areaService.getAllBySpaceId('1')
        .subscribe((data: Area[]) => {
          // then
          expect(data[0].id).toEqual(responseDataA[0].id);
          expect(data[0].attributes.name).toEqual(responseDataA[0].attributes.name);
        },
        fail
      );
      // AreaService should have made one request to GET area from expected URL
      const req = httpTestingController.expectOne(areaService.spacesUrl + '/1/areas');
      expect(req.request.method).toEqual('GET');

      // Respond with the mock area
      req.flush(responseA);
      httpTestingController.verify();
      done();
    });

    it('can test for network error', () => {
      const emsg = 'simulated network error';

      httpClient.get<Area[]>(areaService.spacesUrl + '/1/areas').subscribe(
        data => fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.error.message).toEqual(emsg, 'message');
        }
      );

      const req = httpTestingController.expectOne(areaService.spacesUrl + '/1/areas');

      // Create mock ErrorEvent, raised when something goes wrong at the network level.
      // Connection timeout, DNS error, offline, etc
      const mockError = new ErrorEvent('Network error', {
        message: emsg,
        // The rest of this is optional and not used.
        // Just showing that you could provide this too.
        filename: 'AreaService.ts',
        lineno: 42,
        colno: 21
      });

      // Respond with mock error
      req.error(mockError);
    });

    xit('should get areas in error', (done: DoneFn) => {
      const emsg: string = 'simulated network error';
      // when
      areaService.getAllBySpaceId('1').subscribe((data: Area[]) =>
          fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.message).toEqual(emsg, 'message');
        });

      const req = httpTestingController.expectOne(areaService.spacesUrl + '/1/areas');

      // Create mock ErrorEvent, raised when something goes wrong at the network level.
      // Connection timeout, DNS error, offline, etc
      const mockError = new ErrorEvent('Network error', {
        message: emsg,
        // The rest of this is optional and not used.
        // Just showing that you could provide this too.
        filename: 'AreaService.ts'
      });

      // Respond with mock area
      req.error(mockError);
      httpTestingController.verify();
      done();
    });
  });

  describe('#create', () => {
    it('should add new area', (done: DoneFn) => {
      // when
      areaService.create('1', responseData)
        .subscribe((data: Area) => {
          // then
          expect(data.id).toEqual(responseData.id);
          expect(data.attributes.name).toEqual(responseData.attributes.name);
          },
          fail
        );
      // AreaService should have made one request to GET area from expected URL
      const req = httpTestingController.expectOne(areaService.areasUrl + '/1');
      expect(req.request.method).toEqual('POST');

      // Respond with the mock area
      req.flush(response);
      httpTestingController.verify();
      done();
    });

    xit('should add new area in error', (done: DoneFn) => {
      // when
      areaService.create('1', responseData)
        .subscribe((data: Area) => {
          fail('Add new area should be in error');
        }, // then
      error => expect(error).toEqual('some error'));
      done();
    });
  });

  describe('#getById', () => {
    it('should get a single area by Id', (done: DoneFn) => {
      let areaId = '1';
      // when
      areaService.getById(areaId)
        .subscribe((data: Area) => {
          // then
          expect(data.id).toEqual(responseData.id);
          expect(data.attributes.name).toEqual(responseData.attributes.name);
          },
          fail
        );
      // AreaService should have made one request to GET area from expected URL
      const req = httpTestingController.expectOne(areaService.areasUrl + '/1');
      expect(req.request.method).toEqual('GET');

      // Respond with the mock area
      req.flush(response);
      httpTestingController.verify();
      done();
    });

    xit('should get a single area by Id in error', (done: DoneFn) => {
      let areaId = '1';
      // when
      areaService.getById(areaId)
        .subscribe((data: Area) => {
          fail('Get a single area by Id should be in error');
        }, // then
        error => expect(error).toEqual('some error'));
      done();
    });
  });
});
