import { RegionData } from './types';

// IMPORTANT: REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzk_4zpR32Bi5zlceEl4ZNvTJwVaN7hA3VogfbFfPlSx2zI0oIMdsQgZrbopKjX6RFX/exec';

export const LOCATION_DATA: RegionData[] = [
  {
    name: 'Zona Norte',
    neighborhoods: [
      { name: 'Centro', streets: ['Av. Principal', 'Rua das Flores', 'Rua do Comércio'] },
      { name: 'Jardim América', streets: ['Rua 1', 'Rua 2', 'Av. Brasil'] }
    ]
  },
  {
    name: 'Zona Sul',
    neighborhoods: [
      { name: 'Industrial', streets: ['Av. das Fábricas', 'Rua da Produção'] },
      { name: 'Vila Nova', streets: ['Travessa A', 'Beco do Sol'] }
    ]
  }
];

export const MAX_IMAGE_WIDTH = 1280; // Scale down for ~1MB limit
export const IMAGE_QUALITY = 0.7; // JPEG Quality
