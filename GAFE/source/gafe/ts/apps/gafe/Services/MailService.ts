declare var gapi: any;

module GAFE {
  export class MailService {
    loaded: boolean = false;

    static $Inject = ["$rootScope"];
    constructor(private $rootScope: ng.IRootScopeService) { }

    public init(callback: () => void) {
      gapi.client.load("gmail", "v1", () => {
        this.loaded = true;
        callback();
      });
    }

    private info(id: string, callback: (message: IMailMessage) => void) {
      var request = gapi.client.gmail.users.messages.get({
        "userId": "me",
        "id": id
      });

      request.execute(resp => {
        var relateMailDetail = { id: id, subject: null, from: null, recieveDate: null, to: null, cc: null, replyTo: null };

        for (var headerIndex = 0; headerIndex < resp.payload.headers.length; headerIndex++) {
          if (resp.payload.headers[headerIndex].name === "Subject") {
            relateMailDetail.subject = resp.payload.headers[headerIndex].value;
          }
          if (resp.payload.headers[headerIndex].name === "From") {
            relateMailDetail.from = resp.payload.headers[headerIndex].value;
          }
          if (resp.payload.headers[headerIndex].name === "Date") {
            relateMailDetail.recieveDate = resp.payload.headers[headerIndex].value;
          }
          if (resp.payload.headers[headerIndex].name === "To") {
            relateMailDetail.to = resp.payload.headers[headerIndex].value;
          }
          if (resp.payload.headers[headerIndex].name === "Cc") {
            relateMailDetail.cc = resp.payload.headers[headerIndex].value;
          }
          if (resp.payload.headers[headerIndex].name === "Reply-To") {
            relateMailDetail.replyTo = resp.payload.headers[headerIndex].value;
          }
        }

        callback(relateMailDetail);
      });
    }

    public list(callback: (messages: Array<IMailMessage>) => void) {
      var request = gapi.client.gmail.users.messages.list({
        "userId": "me",
        "labelIds": "INBOX",
        "maxResults": 10
      });

      request.execute(r => {
        var queue = [];

        for (var i = 0; i < r.messages.length; i++) {
          var task = ((id: string) => {
            return (callback: any) => {
              this.info(id, f => {
                callback(null, f);
              });
            };
          })(r.messages[i].id);

          queue.push(task);
        }

        async.series(queue, (err, results) => {
          callback(results);
        });
      });
    }
  }
}