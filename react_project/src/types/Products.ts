export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    createdAt?: string;
}

export interface CreateProductDto {
    name: string;
    description: string;
    price: number;
}