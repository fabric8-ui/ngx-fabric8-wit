import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from '../api/wit-api';
import { CollaboratorService } from './collaborator.service';
import { concatMap } from 'rxjs/operators';

describe('Service: CollaboratorService', () => {

  let collaboratorService: CollaboratorService;
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
        CollaboratorService,
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

    collaboratorService = TestBed.get(CollaboratorService);

    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

  });

  let responseData: User[] = [
    {
      'attributes': {
        'bio': '',
        'email': 'user@gmail.com',
        'fullName': 'user name',
        'imageURL': 'https://www.gravatar.com/avatar/asdf.jpg',
        'url': 'https://user.github.io',
        'username': 'useruser'
      },
      'id': '6abd2970-9407-469d-a8ad-9e18706d732c',
      'links': {
        'self': 'https://api.openshift.io/api/users/6abd2970-9407-469d-a8ad-9e18706d732c'
      },
      'type': 'identities'
    }
  ];
  let response = { data: responseData, links: {}, meta: { totalCount: 3 } };

  describe('#getTotalCount', () => {
    it('should default to -1', () => {
      collaboratorService.getTotalCount()
        .subscribe(
          (count: number): void => {
            expect(count).toEqual(-1);
          },
          fail
        );
    });
  });

  describe('#getInitialBySpaceId', () => {
    it('should get collaborators by Space ID', (done: DoneFn) => {
      // when
      collaboratorService.getInitialBySpaceId('1')
        .subscribe((data: User[]) => {
          // then
          expect(data[0].id).toEqual(responseData[0].id);
          expect(data[0].attributes.username).toEqual(responseData[0].attributes.username);
        },
        fail
      );
      // CollaboratorService should have made one request to GET collaborators from expected URL
      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators?page[limit]=20');
      expect(req.request.method).toEqual('GET');

      // Respond with the mock collaborator
      req.flush(response);
      httpTestingController.verify();
      done();
    });

    it('should update totalCount', (done: DoneFn) => {
      // when
      collaboratorService.getInitialBySpaceId('1')
        .pipe(
          concatMap(() => collaboratorService.getTotalCount())
        )
        .subscribe((count: number): void => {
          // then
          expect(count).toEqual(3);
        },
        fail
      );
      // CollaboratorService should have made one request to GET collaborators from expected URL
      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators?page[limit]=20');
      expect(req.request.method).toEqual('GET');

      // Respond with the mock collaborator
      req.flush(response);
      httpTestingController.verify();
      done();
    });

    it('can test for network error', () => {
      const emsg = 'simulated network error';

      httpClient.get<User[]>(collaboratorService.spacesUrl + '/1/collaborators?page[limit]=20').subscribe(
        data => fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.error.message).toEqual(emsg, 'message');
        }
      );

      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators?page[limit]=20');

      // Create mock ErrorEvent, raised when something goes wrong at the network level.
      // Connection timeout, DNS error, offline, etc
      const mockError = new ErrorEvent('Network error', {
        message: emsg,
        // The rest of this is optional and not used.
        // Just showing that you could provide this too.
        filename: 'collaboratorService.ts',
        lineno: 42,
        colno: 21
      });

      // Respond with mock collaborator
      req.error(mockError);
    });

    xit('should get collaborators in error', (done: DoneFn) => {
      const emsg: string = 'simulated network error';
      // when
      collaboratorService.getInitialBySpaceId('1').subscribe((data: User[]) =>
          fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.message).toEqual(emsg, 'message');
        });

      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators?page[limit]=20');

      // Create mock ErrorEvent, raised when something goes wrong at the network level.
      // Connection timeout, DNS error, offline, etc
      const mockError = new ErrorEvent('Network error', {
        message: emsg,
        // The rest of this is optional and not used.
        // Just showing that you could provide this too.
        filename: 'collaboratorService.ts'
      });

      // Respond with mock collaborator
      req.error(mockError);
      httpTestingController.verify();
      done();
    });
  });

  describe('#addCollaborators', () => {
    it('should add new collaborator', (done: DoneFn) => {
      // when
      collaboratorService.addCollaborators('1', responseData)
        .subscribe(() => {
          // then
          expect('1').toEqual('1');
        });
     // collaboratorService should have made one request to POST collaborator from expected URL
      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators');
      expect(req.request.method).toEqual('POST');

      // Respond with the mock collaborator
      req.flush(response);
      httpTestingController.verify();
      done();
    });
  });

  describe('#removeCollaborator', () => {
    it('should remove a collaborator', (done: DoneFn) => {
      // when
      collaboratorService.removeCollaborator('1', '6abd2970-9407-469d-a8ad-9e18706d732c')
        .subscribe(() => {
          // then
          expect('1').toEqual('1');
        });
      // collaboratorService should have made one request to DELETE collaborator from expected URL
      const req = httpTestingController.expectOne(collaboratorService.spacesUrl + '/1/collaborators/6abd2970-9407-469d-a8ad-9e18706d732c');
      expect(req.request.method).toEqual('DELETE');

      // Respond with the mock collaborator
      req.flush(response);
      httpTestingController.verify();
      done();
    });
  });
});
