import Vonage, { NumberInsightLevel } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || ''
});

const from = process.env.VONAGE_PHONE || '';
const SUPPORTED_COUNTRIES = ['US', 'CA'];

export const sendText = async (body: string, to: string) => {
  await new Promise((resolve, reject) =>
    vonage.numberInsight.get(
      { level: 'basic' as NumberInsightLevel, number: to },
      (error, result) => {
        if (SUPPORTED_COUNTRIES.includes(result?.country_code || '')) {
          resolve(true);
        } else {
          reject('Phone country not supported');
        }
      }
    )
  );

  return new Promise((resolve, reject) =>
    vonage.message.sendSms(from, to, body, {}, (err, responseData) => {
      if (err) {
        reject('Unable to send text message');
      } else if (responseData.messages[0]) {
        if (responseData.messages[0]['status'] !== '0') {
          reject('Unable to send text message');
        }
      }

      resolve(true);
    })
  );
};

// import * as infopib from 'infobip';
//
// //Initialize the client
// const client = new infopib.Infobip(
//   process.env.BIP_USERNAME || '',
//   process.env.BIP_PASSWORD
// );
//
// interface IMessage {
//   status: {
//     groupName: string;
//   };
// }
//
// interface ISMSResponse {
//   messages: IMessage[];
// }
//
// export const sendText = async (body: string, to: string) => {
//   //Set the message
//   const message = {
//     from: process.env.BIP_PHONE,
//     to,
//     text: body
//   };
//
//   //Send an SMS
//   // @ts-ignore
//   return client.SMS.send(message).then((res: ISMSResponse) => {
//     const message = (res.messages || [])[0];
//
//     if (message) {
//       const error = message.status.groupName === 'REJECTED';
//
//       if (error) {
//         throw new Error('Unable to send text message');
//       }
//     }
//   });
// };
