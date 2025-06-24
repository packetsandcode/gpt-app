// app/lib/uploadFileToFirebase.ts
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseClient';

export const uploadFileToFirebase = (file: File): Promise<{ url: string; name: string; contentType: string }> => {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          name: file.name,
          contentType: file.type,
        });
      }
    );
  });
};
