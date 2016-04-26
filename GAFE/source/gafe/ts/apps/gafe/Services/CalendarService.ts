declare var gapi: any;

module GAFE {
  export class CalendarService {
    loaded: boolean = false;

    static $Inject = ["$rootScope"];
    constructor(private $rootScope: ng.IRootScopeService) { }

    public init(callback: () => void) {
      gapi.client.load("calendar", "v3", () => {
        this.loaded = true;
        callback();
      });
    }

    public create(start: Date, end: Date, title: string, description: string, callback: (users: Array<IPerson>) => void) {
      var event = {
        "summary": title,
        "location": "",
        "description": description,
        "start": {
          "dateTime": start
        },
        "end": {
          "dateTime": end
        },
        "reminders": {
          "useDefault": false,
          "overrides": [
            { "method": "email", "minutes": 5 },
            { "method": "popup", "minutes": 5 }
          ]
        }
      };

      var request = gapi.client.calendar.events.insert({
        "calendarId": "primary",
        "resource": event
      });

      request.execute(e => {
        this.$rootScope.$apply(() => {
          callback(e);
        });
      });
    }
  }
}