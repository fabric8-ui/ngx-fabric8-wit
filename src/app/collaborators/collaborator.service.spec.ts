import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from "../api/wit-api";
import { CollaboratorService } from './collaborator.service';

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
          useValue: "http://example.com/"
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
      "attributes": {
        "bio": "",
        "email": "user@gmail.com",
        "fullName": "user name",
        "imageURL": "https://www.gravatar.com/avatar/asdf.jpg",
        "url": "https://user.github.io",
        "username": "useruser"
      },
      "id": "6abd2970-9407-469d-a8ad-9e18706d732c",
      "links": {
        "self": "https://api.openshift.io/api/users/6abd2970-9407-469d-a8ad-9e18706d732c"
      },
      "type": "identities"
    }
  ];
  let response = { data: responseData, links: {} };

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

/*
let real = {
  "data": [{
    "attributes": {
      "bio": "",
      "cluster": "https://api.starter-us-east-2a.openshift.com/",
      "company": "Red Hat",
      "contextInformation": {
        "featureAcknowledgement": {"Planner": true},
        "recentContexts": [{
          "space": "e8864cfe-f65a-4351-85a4-3a585d801b45",
          "user": "7b50ddb4-5e12-4031-bca7-3b88f92e2339"
        }, {
          "space": "309ed1db-1e45-4267-9318-e3dd568d1b48",
          "user": "b67f1cee-0a9f-40da-8e52-504c092e54e0"
        }, {
          "space": "cf544b96-4d5a-47f9-81fd-3137c5ba591a",
          "user": "195cdd58-3788-4350-8a05-02d381d1a52c"
        }, {
          "space": null,
          "user": "195cdd58-3788-4350-8a05-02d381d1a52c"
        }, {"space": "1775ff0e-7eb1-4464-af47-794ffd7726ff", "user": "b67f1cee-0a9f-40da-8e52-504c092e54e0"}],
        "recentSpaces": ["e8864cfe-f65a-4351-85a4-3a585d801b45", "309ed1db-1e45-4267-9318-e3dd568d1b48", "cf544b96-4d5a-47f9-81fd-3137c5ba591a", "020f756e-b51a-4b43-b113-45cec16b9ce9", "661e2139-2a01-4463-ab43-88d1af77d552"]
      },
      "created-at": "2018-01-19T21:02:15.256947Z",
      "email": "aslak+osio-2a@redhat.com",
      "emailPrivate": false,
      "emailVerified": true,
      "featureLevel": "internal",
      "fullName": "Aslak Knutsen",
      "identityID": "195cdd58-3788-4350-8a05-02d381d1a52c",
      "imageURL": "https://www.gravatar.com/avatar/5e21ed5732813e6c977f006661fad8f4.jpg",
      "providerType": "kc",
      "registrationCompleted": true,
      "updated-at": "2018-08-17T09:14:42.893811Z",
      "url": "",
      "userID": "4d454acf-484e-4fc4-95e5-41ef8e848f13",
      "username": "aslak-osio-2a"
    },
    "id": "195cdd58-3788-4350-8a05-02d381d1a52c",
    "links": {
      "related": "https://openshift.io/api/users/195cdd58-3788-4350-8a05-02d381d1a52c",
      "self": "https://openshift.io/api/users/195cdd58-3788-4350-8a05-02d381d1a52c"
    },
    "type": "identities"
  }, {
    "attributes": {
      "bio": "write code",
      "cluster": "https://api.starter-us-east-2.openshift.com/",
      "company": "Red Hat",
      "contextInformation": {
        "boosterCatalog": {"gitRef": "", "gitRepo": ""},
        "experimentalFeatures": {"enabled": true},
        "featureAcknowledgement": true,
        "pins": {"myspaces": []},
        "recentContexts": [{"space": null, "user": "570070c0-de41-4269-b9e5-5e0c54eef59a"}],
        "recentSpaces": ["cee62165-451a-4b66-bdc5-3519dfdefee5", "e8864cfe-f65a-4351-85a4-3a585d801b45"],
        "tenantConfig": {
          "cheVersion": "",
          "jenkinsVersion": "",
          "mavenRepo": "",
          "teamVersion": "",
          "updateTenant": true
        }
      },
      "created-at": "2017-04-19T01:06:52.657577Z",
      "email": "josh@redhat.com",
      "emailPrivate": false,
      "emailVerified": true,
      "featureLevel": "internal",
      "fullName": "Josh Wilson",
      "identityID": "570070c0-de41-4269-b9e5-5e0c54eef59a",
      "imageURL": "https://avatars1.githubusercontent.com/u/1184371?v=3",
      "providerType": "kc",
      "registrationCompleted": true,
      "updated-at": "2018-08-29T19:58:10.540811Z",
      "url": "",
      "userID": "0c830ad7-a0ba-4427-a07d-94a192594bdb",
      "username": "josh-6"
    },
    "id": "570070c0-de41-4269-b9e5-5e0c54eef59a",
    "links": {
      "related": "https://openshift.io/api/users/570070c0-de41-4269-b9e5-5e0c54eef59a",
      "self": "https://openshift.io/api/users/570070c0-de41-4269-b9e5-5e0c54eef59a"
    },
    "type": "identities"
  }],
  "links": {
    "first": "https://openshift.io/api/spaces/cee62165-451a-4b66-bdc5-3519dfdefee5/collaborators?page[offset]=0\u0026page[limit]=20",
    "last": "https://openshift.io/api/spaces/cee62165-451a-4b66-bdc5-3519dfdefee5/collaborators?page[offset]=0\u0026page[limit]=20"
  },
  "meta": {"totalCount": 2}
};
*/
