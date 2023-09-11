import { extname } from 'path'

const getFileExtension = (filename: string): string => {
  const extension = extname(filename).split('.').slice(1).join('.')
  return extension
}

export { getFileExtension }
