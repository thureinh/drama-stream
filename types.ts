
export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  tags: string[];
  uploadedAt: string;
  duration: string;
  size: number; // in bytes
  category: string;
  description?: string;
}

export enum SortOption {
  NEWEST = 'Newest First',
  OLDEST = 'Oldest First',
  NAME_ASC = 'Name (A-Z)',
  NAME_DESC = 'Name (Z-A)',
  SIZE = 'File Size'
}

export interface WasabiConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}
