import { Injectable } from '@angular/core';
import {
  BaseOrganizationListService,
  OrganizationTableType,
} from '../../shared';
import { EntitiesModel, OrgUnitService, B2BAddress } from '@spartacus/core';
import { TableService } from '@spartacus/storefront';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnitManageAddressesService extends BaseOrganizationListService<
  B2BAddress
> {
  protected tableType = OrganizationTableType.UNIT_MANAGE_ADDRESSES;

  constructor(
    protected tableService: TableService,
    protected orgUnitService: OrgUnitService
  ) {
    super(tableService);
  }

  protected load(_, code: string): Observable<EntitiesModel<B2BAddress>> {
    return this.orgUnitService.getAddresses(code);
  }
}
