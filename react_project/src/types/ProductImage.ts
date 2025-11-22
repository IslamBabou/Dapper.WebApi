export interface ProductImage {
    id: number;
    productId: number;
    fileName: string;
    url: string;
    isMain: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface UploadProductImageDto {
    File: File;
    ProductId: number;
    IsMain: boolean;
    SortOrder: number;
}