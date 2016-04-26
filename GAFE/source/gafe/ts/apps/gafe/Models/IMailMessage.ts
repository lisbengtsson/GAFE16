module GAFE {
  export interface IMailMessage {
    subject: string;
    from: string;
    recieveDate: string;
    to: string;
    cc: string;
    replyTo: string;
    id: string;
  }
}