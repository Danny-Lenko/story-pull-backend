import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // В реальному додатку тут був би код для відправки email
    console.log(`Sending email to ${to}: ${subject}`);
    return true;
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // В реальному додатку тут був би код для відправки SMS
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    return true;
  }
}
