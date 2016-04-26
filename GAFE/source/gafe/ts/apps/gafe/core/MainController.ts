declare var CLIENT_ID: string;
declare var SCOPES: Array<string>;
declare var gapi: any;
declare function handleAuth(authResult: any);
declare var async: any;

module GAFE {
  export class MainController {
    loading: boolean;
    message: IAlertMessage;
    showConstent: boolean;
    files: Array<IFile> = [];
    folders: Array<IFile> = [];
    selectedTemplate: string;
    selectedRootFolder: string;
    folderName: string;
    fileName: string;
    share: boolean = false;
    eventName: string;
    people: Array<IPerson> = [];
    selectedUsers: Array<IPerson> = [];
    activities: Array<IActivity> = [];
    mail: Array<IMailMessage> = [];

    /**
    * Constructor get called when controller is initialized.
    */
    static $Inject = ["$log", "$timeout", "gafeDriveService", "gafeUserService", "gafeCalendarService", "gafeActivityService", "gafeMailService", "$scope", "localStorageService", "$window"];
    constructor(
      private $log: ng.ILogService,
      private $timeout: ng.ITimeoutService,
      private gafeDriveService: DriveService,
      private gafeUserService: UserService,
      private gafeCalendarService: CalendarService,
      private gafeActivityService: ActivityService,
      private gafeMailService: MailService,
      private $scope: ng.IScope,
      private localStorageService: any,
      private $window: ng.IWindowService
    ) {
      this.loading = true;
      this.showConstent = false;
      this.people = [];
    }

    /**
    * Unchecks all users in user tab.
    */
    uncheckAll() {
      this.selectedUsers = [];
    }

    /**
    * Loads all users from the directory service.
    */
    loadUsers() {
      this.loading = true;
      this.gafeUserService.list(p => {
        this.people = this.people.concat(p);
        this.loading = false;
      });
    }

    /**
    * Remove all users from the list.
    */
    clearUsers() {
      this.people = [];
    }

    /**
    * Internal for angular material to work.
    */
    userExists(user: IPerson) {
      return this.selectedUsers.indexOf(user) > -1;
    }

    /**
    * Internal for angular material to work.
    */
    userToggle(user: IPerson) {
      var index = this.selectedUsers.indexOf(user);

      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      } else {
        this.selectedUsers.push(user);
      }
    }

    /**
    * Removes user from the list.
    */
    removeUser(person: IPerson) {
      this.people.splice(this.people.indexOf(person), 1);
    }

    /**
    * Adds user to the list.
    */
    addUser() {
      this.people.push({ email: "", name: "" });
    }

    /**
    * Saves the users to local storage. Hit F12 in Chrome and choose resources => local storage and you will see some json data containing the users.
    */
    saveUsers() {
      this.localStorageService.set("people", this.people);
    }

    /**
    * Main start point to trigger the application start after inital loading.
    */
    load(authResult) {
      this.$scope.$apply(() => {
        this.init(authResult);
      });
    }

    authorize() {
      gapi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: false }, handleAuth);
    }

    /**
    * Loads a the apis from google, needs to be done before they can be used. Should be able to be lazy loaded.
    */
    init(authResult) {
      this.people = this.localStorageService.get("people") || [];

      if (authResult && !authResult.error) {
        this.gafeDriveService.init(() => {
          this.gafeUserService.init(() => {
            this.gafeCalendarService.init(() => {
              this.gafeActivityService.init(() => {
                this.gafeMailService.init(() => {
                  this.gafeDriveService.listDirectories(f => {
                    this.$scope.$apply(() => {
                      this.loading = false;
                      this.folders = f;
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        this.loading = false;
        this.showConstent = true;
      }
    }

   /**
    * Loads fils into file array. File array is bound to the radio list.
    */
    loadFiles() {
      this.gafeDriveService.listFiles(this.selectedRootFolder, f => {
        this.$scope.$apply(() => {
          this.files = f;
        });
      });
    }

    /**
    * Creates a new calendar event with the event name read from the eventName field.
    */
    createCalendarEvent() {
      if (!this.eventName && this.eventName === "") {
        this.message = { message: "Please enter an event name", type: "alert-danger" };
      }

      this.loading = true;
      this.gafeCalendarService.create(new Date(), new Date(), this.eventName, "Event description:" + (Math.random() * 10000), (p) => {
        this.loading = false;
      });
    }

    /**
    * Download a google doc as a pdf. The url for spreedsheets are different but works in similar way.
    */
    pdf() {
      this.gafeDriveService.pdf(this.selectedTemplate, p => {
        var url = "https://docs.google.com/document/d/" + this.selectedTemplate + "/export?format=pdf";
        this.$window.open(url, "_blank");
      });
    }

    /**
    * Loads the latest activities.
    */
    loadActivities() {
      this.loading = true;
      this.gafeActivityService.list(a => {
        this.activities = a;
        this.loading = false;
      });
    }

    /**
    * Loads the latest 10 main messages.
    */
    loadMail() {
      this.loading = true;
      this.gafeMailService.list(a => {
        this.$scope.$apply(() => {
          this.mail = a;
          this.loading = false;
        });
      });
    }

    /**
    * Duplicates and shares a document.
    */
    createCopy() {
      if (this.selectedUsers.length < 1) {
        this.message = { type: "alert-error", message: "Select some users." };
        return;
      }

      if (!this.selectedRootFolder) {
        this.message = { type: "alert-error", message: "Select a root folder." };
        return;
      }

      if (!this.selectedTemplate) {
        this.message = { type: "alert-error", message: "Select a template." };
        return;
      }

      if (!this.folderName || this.folderName === "") {
        this.message = { type: "alert-error", message: "Select a folder name." };
        return;
      }

      this.gafeDriveService.createFolder(this.folderName, this.selectedRootFolder, p => {
        this.$log.info("Create folder " + this.folderName + " with id " + p + ".");

        var queue = [];

        for (var i = 0; i < this.selectedUsers.length; i++) {
          var task = ((selectedTemplate, fileName, folderId, user: IPerson, share: boolean) => {
            return (callback: any) => {
              this.gafeDriveService.duplicateFile(selectedTemplate, fileName + " - " + user.name, p, f => {
                if (share) {
                  this.gafeDriveService.shareFile(f, user.email, permission => {
                    callback(null, f);
                  });
                } else {
                  callback(null, f);
                }
              });
            };
          })(this.selectedTemplate, this.fileName, p, this.selectedUsers[i], this.share);
          queue.push(task);
        }

        this.$scope.$apply(() => {
          this.loading = true;
        });

        async.series(queue, (err, results) => {
          this.$scope.$apply(() => {
            this.loading = false;
            this.message = { message: "Done", type: "alert-success" };
          });
        });
      });
    }
  }
}