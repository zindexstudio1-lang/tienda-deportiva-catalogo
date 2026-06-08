export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: 'camisetas' | 'fuerza' | 'accesorios';
  image: string;
  description: string;
  sizes?: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Set Fuerza y Resistencia "BEST"',
    sku: 'FUE-BEST-01',
    price: 149.90,
    category: 'fuerza',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', // Reemplazar luego con la foto real
    description: 'Incluye mancuernas de neopreno, ligas de resistencia, soportes para flexiones y rueda abdominal.'
  },
  {
    id: '2',
    name: 'Camiseta Universitario de Deportes Edición Especial 2026',
    sku: 'CAM-UN26-02',
    price: 89.90,
    category: 'camisetas',
    image: '/universitario.png', // Reemplazar luego con la foto real
    description: 'Camiseta de alta calidad con tecnología de absorción de sudor, ideal para partidos de fin de semana.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '3',
    name: 'Mancuernas Hexagonales 5KG (Par)',
    sku: 'FUE-HEX5-03',
    price: 75.00,
    category: 'fuerza',
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600&auto=format&fit=crop',
    description: 'Mancuernas de hierro fundido recubiertas de caucho premium para proteger el piso.'
  },
  {
    id: '4',
    name: 'Camiseta Portugal 25/26',
    sku: 'CAM-POR25-04',
    price: 85.00,
    category: 'camisetas',
    image: '/portugalNegro.png', // Reemplazar luego con la foto real
    description: 'Versión hincha premium con detalles bordados y tela mesh transpirable.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '5',
    name: 'Camiseta Selección Peruana Visitante 25/26',
    sku: 'CAM-PER25-05',
    price: 89.90,
    category: 'camisetas',
    image: '/peruNegro.png', // Reemplazar luego con la foto real
    description: 'Camiseta de alta calidad con tecnología de absorción de sudor, ideal para partidos de fin de semana.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '6',
    name: 'Camiseta Selección Argentina 25/26',
    sku: 'CAM-ARG25-06',
    price: 89.90,
    category: 'camisetas',
    image: '/argentina.png', // Reemplazar luego con la foto real
    description: 'Camiseta de alta calidad con tecnología de absorción de sudor, ideal para partidos de fin de semana.',
    sizes: ['S', 'M', 'L', 'XL']
  }
];