declare var gapi: any;

module GAFE {
  export class UserService {
    loaded: boolean = false;

    static $Inject = ["$rootScope"];
    constructor(private $rootScope: ng.IRootScopeService) { }

    public init(callback: () => void) {
      gapi.client.load("admin", "directory_v1", () => {
        this.loaded = true;
        callback();
      });
    }

    public list(callback: (users: Array<IPerson>) => void) {
      var request = gapi.client.directory.users.list({
        "customer": "my_customer",
        "maxResults": 500,
        "orderBy": "email"
      });

      request.execute(r => {
        var users = r.users.map(u => {
          return { name: u.name.givenName, email: u.primaryEmail };
        });

        this.$rootScope.$apply(() => {
          callback(users);
        });
      });
    }
  }
}