import {
  Pipe,
  PipeTransform,
  Type,
  Input,
  Output,
  EventEmitter,
  Component,
} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  I18nTestingModule,
  RoutingService,
  EntitiesModel,
  B2BSearchConfig,
  RoutesConfig,
  RoutingConfig,
  Permission,
  B2BUserService,
} from '@spartacus/core';
import { BehaviorSubject, of } from 'rxjs';

import { InteractiveTableModule } from '../../../../shared/components/interactive-table/interactive-table.module';
import createSpy = jasmine.createSpy;
import { defaultStorefrontRoutesConfig } from '../../../../cms-structure/routing/default-routing-config';
import { PaginationConfig } from 'projects/storefrontlib/src/shared/components/list-navigation/pagination/config/pagination.config';
import { UserAssignPermissionsComponent } from './user-assign-permissions.component';

const code = 'userCode';
const permissionCode = '1';
const permissionRow = {
  row: {
    code: permissionCode,
  },
};

const defaultParams: B2BSearchConfig = {
  sort: 'byName',
  currentPage: 0,
  pageSize: 5,
};

const mockPermissionList: EntitiesModel<Permission> = {
  values: [
    {
      code: '1',
      selected: true,
      currency: {
        isocode: 'USD',
        symbol: '$',
      },
      orgUnit: { uid: 'orgUid', name: 'orgName' },
    },
    {
      code: '2',
      selected: true,
      currency: {
        isocode: 'USD',
        symbol: '$',
      },
      orgUnit: { uid: 'orgUid2', name: 'orgName2' },
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  sorts: [{ code: 'byName', selected: true }],
};

const mockPermissionUIList = {
  values: [
    {
      code: '1',
      selected: true,
      parentUnit: 'orgName',
      uid: 'orgUid',
      threshold: ' $',
      orderType: undefined,
      timePeriod: undefined,
    },
    {
      code: '2',
      selected: true,
      parentUnit: 'orgName2',
      uid: 'orgUid2',
      threshold: ' $',
      orderType: undefined,
      timePeriod: undefined,
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  sorts: [{ code: 'byName', selected: true }],
};
@Component({
  template: '',
  selector: 'cx-pagination',
})
class MockPaginationComponent {
  @Input() pagination;
  @Output() viewPageEvent = new EventEmitter<string>();
}
@Pipe({
  name: 'cxUrl',
})
class MockUrlPipe implements PipeTransform {
  transform() {}
}

const permissionList = new BehaviorSubject(mockPermissionList);

class MockB2BUserService implements Partial<B2BUserService> {
  get = createSpy('get').and.returnValue(of({ email: 'test@bbb' }));
  loadB2BUserPermissions = createSpy('loadB2BUserPermissions');

  getB2BUserPermissions = createSpy('getB2BUserPermissions').and.returnValue(
    permissionList
  );

  assignPermission = createSpy('assign');

  unassignPermission = createSpy('unassign');
}

class MockRoutingService {
  go = createSpy('go').and.stub();
  getRouterState() {
    return of({
      state: {
        params: {
          code,
        },
        queryParams: {
          sort: 'byName',
          currentPage: '0',
          pageSize: '5',
        },
      },
    });
  }
}
const mockRoutesConfig: RoutesConfig = defaultStorefrontRoutesConfig;
class MockRoutingConfig {
  getRouteConfig(routeName: string) {
    return mockRoutesConfig[routeName];
  }
}

describe('UserAssignPermissionsComponent', () => {
  let component: UserAssignPermissionsComponent;
  let fixture: ComponentFixture<UserAssignPermissionsComponent>;
  let service: MockB2BUserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, InteractiveTableModule, I18nTestingModule],
      declarations: [
        UserAssignPermissionsComponent,
        MockUrlPipe,
        MockPaginationComponent,
      ],
      providers: [
        { provide: RoutingConfig, useClass: MockRoutingConfig },
        { provide: RoutingService, useClass: MockRoutingService },
        {
          provide: B2BUserService,
          useClass: MockB2BUserService,
        },
        {
          provide: PaginationConfig,
          useValue: {
            pagination: {},
          },
        },
      ],
    }).compileComponents();

    service = TestBed.get(B2BUserService as Type<B2BUserService>);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAssignPermissionsComponent);
    component = fixture.componentInstance;
    permissionList.next(mockPermissionList);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display No permissions found page if no permissions are found', () => {
    const emptyPermissionList: EntitiesModel<Permission> = {
      values: [],
      pagination: { totalResults: 0, sort: 'byName' },
      sorts: [{ code: 'byName', selected: true }],
    };

    permissionList.next(emptyPermissionList);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.cx-no-items'))).not.toBeNull();
  });

  describe('ngOnInit', () => {
    it('should read permission list', () => {
      component.ngOnInit();

      let permissionsList: any;
      component.data$.subscribe((value) => {
        permissionsList = value;
      });

      expect(service.loadB2BUserPermissions).toHaveBeenCalledWith(
        code,
        defaultParams
      );
      expect(service.getB2BUserPermissions).toHaveBeenCalledWith(
        code,
        defaultParams
      );
      expect(permissionsList).toEqual(mockPermissionUIList);
    });
  });

  describe('assign', () => {
    it('should assign permission', () => {
      component.assign(permissionRow);
      expect(service.assignPermission).toHaveBeenCalledWith(
        code,
        permissionRow.row.code
      );
    });
  });

  describe('unassign', () => {
    it('should unassign permission', () => {
      component.unassign(permissionRow);
      expect(service.unassignPermission).toHaveBeenCalledWith(
        code,
        permissionRow.row.code
      );
    });
  });
});