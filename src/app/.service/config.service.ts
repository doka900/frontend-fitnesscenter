import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

    private _api_url = '/api/';

  private _user_url = this._api_url + 'user/';

  private _login_url = this._api_url + 'user/login/';

  private _signup_url =  this._api_url + 'user/register/';
  private _facility_url =  this._api_url + 'facility/';

  private _verify_email_url = this._api_url+'user/verify-email/';

  private _facility_spaces_url =  this._api_url + 'facilitySpace/';
  private _program_url = this._api_url + 'program/'; 

  get program_url(): string {
    return this._program_url;
  }
  get verify_email_url(): string {
    return this._verify_email_url;
  }


  get facility_spaces_url(): string {
    return this._facility_spaces_url;
  }

  get facility_url(): string {
    return this._facility_url;
  }

  get login_url(): string {
    return this._login_url;
  }


  get users_url(): string {
    return this._user_url;
  }
  

  get signup_url(): string {
    return this._signup_url;
  }



}
