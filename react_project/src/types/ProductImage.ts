export interface ProductImage {
    id: number;
    productId: number;
    fileName: string;
    url: string;
    isMain: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface ProductWithImages {
    id: number;
    name: string;
    description: string;
    price: number;
    createdAt?: string;
    mainImage?: ProductImage;
    images?: ProductImage[];
}