import S3, { ManagedUpload } from 'aws-sdk/clients/s3';
import { FileUpload } from 'graphql-upload';
import { nanoid } from 'nanoid';
import mime from 'mime';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

export const uploadPhoto = async (photo: FileUpload): Promise<string> => {
  const { createReadStream, mimetype } = await photo;

  const params = {
    Bucket: process.env.S3_PHOTO_BUCKET || '',
    Key: `${nanoid()}.${mime.extension(mimetype)}`,
    Body: createReadStream(),
    ContentType: 'image/jpeg'
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  }) as Promise<string>;
};

export const deletePhoto = async (key: string) => {
  const params = {
    Bucket: process.env.S3_PHOTO_BUCKET || '',
    Key: key
  };

  await new Promise((resolve, reject) => {
    s3.deleteObject(params, (err: Error, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
