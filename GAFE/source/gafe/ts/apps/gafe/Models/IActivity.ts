module GAFE {
  export interface IActivity {
    date: Date;
    name: string;
    eventType: string;
    targetName: string;
    targetMimeType: string;
    targetId: string;
  }
}