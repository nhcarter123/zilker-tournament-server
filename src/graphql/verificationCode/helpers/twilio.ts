import twilio from 'twilio';

export const sendText = async (body: string, to: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE;
  const client = twilio(accountSid, authToken);

  return client.messages.create({
    from: twilioPhone,
    body,
    to
  });
};
