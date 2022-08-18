import Ses, { SendEmailRequest } from 'aws-sdk/clients/ses';

const ses = new Ses({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_SES_REGION
});

export const sendEmail = async (to: string, code: string): Promise<string> => {
  const params: SendEmailRequest = {
    Source: 'Zilker Chess <info@zilkerchess.com>',
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: 'Email Verification'
      },
      Body: {
        Html: {
          Data: `<div>Verification code: ${code}</div>`
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    ses.sendEmail(params, (err: Error, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.MessageId);
      }
    });
  });
};
