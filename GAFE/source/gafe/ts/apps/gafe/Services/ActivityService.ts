declare var gapi: any;

module GAFE {
  export class ActivityService {
    loaded: boolean = false;

    static $Inject = ["$rootScope"];
    constructor(private $rootScope: ng.IRootScopeService) { }

    public init(callback: () => void) {
      gapi.client.load("appsactivity", "v1", () => {
        this.loaded = true;
        callback();
      });
    }

    public list(callback: (users: Array<IActivity>) => void) {
      var request = gapi.client.appsactivity.activities.list({
        "source": "drive.google.com",
        "drive.ancestorId": "root",
        "pageSize": 10
      });

      request.execute(e => {
        var items = e.activities.map(activity => {
          var combinedEvent = activity.combinedEvent;

          return {
            date: new Date(Number(combinedEvent.eventTimeMillis)),
            name: combinedEvent.user ? combinedEvent.user.name : null,
            eventType: combinedEvent.primaryEventType,
            targetName: combinedEvent.target.name,
            targetMimeType: combinedEvent.target.mimeType,
            targetId: combinedEvent.target.id
          };
        });

        this.$rootScope.$apply(() => {
          callback(items);
        });
      });
    }
  }
}