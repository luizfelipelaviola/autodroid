import crypto, { BinaryToTextEncoding } from 'node:crypto'

export const calculateFileChecksum = (
  data: string,
  algorithm: string,
  encoding: BinaryToTextEncoding,
) => {
  return crypto
    .createHash(algorithm || 'md5')
    .update(data, 'utf8')
    .digest(encoding || 'hex')
}
