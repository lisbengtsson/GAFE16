declare var gapi: any;

module GAFE {
  export class DriveService {
    loaded: boolean = false;

    public init(callback: () => void) {
      gapi.client.load("drive", "v3", () => {
        this.loaded = true;
        callback();
      });
    }

    public createFolder(folderName: string, parentsId: string, callback: (id: string) => void): void {
      return this.create(folderName, "application/vnd.google-apps.folder", parentsId, callback);
    }

    public createSpreedSheet(folderName: string, parentsId: string, callback: (id: string) => void): void {
      return this.create(folderName, "application/vnd.google-apps.spreadsheet", parentsId, callback);
    }

    public create(name: string, mimeType: string, parentsId: string, callback: (id: string) => void): void {
      var request = gapi.client.drive.files.create({
        resource: {
          "name": name,
          "mimeType": mimeType,
          "parents": [parentsId]
        },
        fields: "id"
      });

      request.execute((r) => {
        callback(r.id);
      });
    }

    public pdf(id: string, callback: (string) => void): void {
      var request = gapi.client.drive.files.export({
        "fileId": id,
        "mimeType": "application/pdf"
      });

      request.execute((r) => {
        callback(r.id);
      });
    }

    public duplicateFile(id: string, newName: string, parentsId: string, callback: (id: string) => void): void {
      var request = gapi.client.drive.files.copy({
        resource: {
          name: newName,
          "parents": [parentsId]
        },
        fields: "id",
        fileId: id
      });

      request.execute((r) => {
        callback(r.id);
      });
    }

    public shareFile(fileId: string, email: string, callback: (response: any) => void) {
      var request = gapi.client.drive.permissions.create({
        "fileId": fileId,
        "resource": {
          "emailAddress": email,
          "type": "user",
          "role": "writer"
        }
      });

      request.execute(r => callback(r));
    }

    public listDirectories(callback: (files: Array<any>) => void) {
      return this.listFilesCore("mimeType = 'application/vnd.google-apps.folder' and name contains 'GAFE'", 30, callback);
    }

    public listFiles(parentId: string, callback: (files: Array<any>) => void) {
      return this.listFilesCore("'" + parentId + "' in parents and mimeType != 'application/vnd.google-apps.folder'", 100, callback);
    }

    private listFilesCore(query: string, pageSize: number, callback: (files: Array<any>) => void) {
      var listQuery = {
        "q": null,
        "pageSize": pageSize,
        "fields": "nextPageToken, files(id, name)"
      };

      if (query && query !== "") {
        listQuery.q = query;
      }

      var request = gapi.client.drive.files.list(listQuery);

      request.execute((r) => {
        callback(r.files);
      });
    }
  }
}