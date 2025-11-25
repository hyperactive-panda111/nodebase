import Cryptr from 'cryptr';

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const encrypt = (text: string) => cryptr.encrypt(text);
export const decrypt = (hash: string) => cryptr.decrypt(hash);