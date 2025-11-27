export interface LocationData {
  latitude: number | null;
  longitude: number | null;
}

export interface FormData {
  id: string; // Unique ID for offline queueing
  timestamp: number; // Created timestamp
  userDate: string;
  userTime: string;
  region: string;
  neighborhood: string;
  street: string;
  reference: string;
  note: string;
  imageBase64: string | null;
  location: LocationData;
}

export interface RegionData {
  name: string;
  neighborhoods: NeighborhoodData[];
}

export interface NeighborhoodData {
  name: string;
  streets: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  OFFLINE_QUEUED = 'OFFLINE_QUEUED'
}
