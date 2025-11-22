// src/components/ProductImageManager.tsx

import { useState, useEffect } from "react";
import api from "../services/api";

interface ProductImage {
    id: number;
    productId: number;
    fileName: string;
    url: string;
    isMain: boolean;
    sortOrder: number;
    createdAt: string;
}

interface ProductImageManagerProps {
    productId: number;
    productName: string;
}

export default function ProductImageManager({ productId, productName }: ProductImageManagerProps) {
    const [images, setImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isMain, setIsMain] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        if (productId) {
            fetchImages();
        }
    }, [productId]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await api.get<ProductImage[]>(`/ProductImages/product/${productId}`);
            setImages(res.data);
        } catch (err) {
            console.error("Failed to load images:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please select JPG, PNG, GIF, or WEBP');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('File', selectedFile);
            formData.append('ProductId', productId.toString());
            formData.append('IsMain', isMain.toString());
            formData.append('SortOrder', sortOrder.toString());

            // Remove the response variable since we're not using it
            await api.post('/ProductImages/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Image uploaded successfully!');

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsMain(false);
            setSortOrder(0);

            // Clear file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Refresh images
            fetchImages();
        } catch (err) {
            alert('Failed to upload image');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSetMain = async (imageId: number) => {
        try {
            await api.patch(`/ProductImages/${imageId}/set-main`);
            alert('Main image updated!');
            fetchImages();
        } catch (err) {
            alert('Failed to set main image');
            console.error(err);
        }
    };

    const handleDelete = async (imageId: number, fileName: string) => {
        if (!confirm(`Delete image "${fileName}"?`)) return;

        try {
            await api.delete(`/ProductImages/${imageId}`);
            alert('Image deleted successfully!');
            fetchImages();
        } catch (err) {
            alert('Failed to delete image');
            console.error(err);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm(`Delete all ${images.length} images for this product?`)) return;

        try {
            await api.delete(`/ProductImages/product/${productId}`);
            alert('All images deleted!');
            fetchImages();
        } catch (err) {
            alert('Failed to delete images');
            console.error(err);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="card mb-4 border-0">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        {productName}
                        <span className="badge bg-light text-dark ms-2">ID: {productId}</span>
                    </h5>
                </div>

                <div className="card-body">
                    {/* Upload Section */}
                    <div className="mb-4 p-3 border rounded bg-light">
                        <h6 className="mb-3">📤 Upload New Image</h6>

                        <div className="row align-items-end">
                            <div className="col-md-5">
                                <label className="form-label">Select Image File</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                                <small className="text-muted">Max 5MB • JPG, PNG, GIF, WEBP</small>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label">Sort Order</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                    disabled={uploading}
                                />
                            </div>

                            <div className="col-md-2">
                                <div className="form-check mt-4">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isMainCheck"
                                        checked={isMain}
                                        onChange={(e) => setIsMain(e.target.checked)}
                                        disabled={uploading}
                                    />
                                    <label className="form-check-label" htmlFor="isMainCheck">
                                        Set as Main
                                    </label>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <button
                                    className="btn btn-success w-100"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        '📤 Upload Image'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Image Preview */}
                        {previewUrl && (
                            <div className="mt-3">
                                <label className="form-label">Preview:</label>
                                <div className="border rounded p-2 bg-white" style={{ maxWidth: '300px' }}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="img-fluid rounded"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Images Grid */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                            Current Images ({images.length})
                        </h6>
                        {images.length > 0 && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleDeleteAll}
                            >
                                🗑️ Delete All Images
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary"></div>
                            <p className="mt-2 text-muted">Loading images...</p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="alert alert-info">
                            📷 No images uploaded yet. Upload your first image above!
                        </div>
                    ) : (
                        <div className="row">
                            {images.map((image) => (
                                <div key={image.id} className="col-md-4 col-lg-3 mb-3">
                                    <div className="card h-100 shadow-sm">
                                        <div className="position-relative">
                                            <img
                                                src={image.url}
                                                alt={image.fileName}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                            {image.isMain && (
                                                <span className="position-absolute top-0 end-0 m-2 badge bg-success">
                                                    ⭐ Main
                                                </span>
                                            )}
                                        </div>

                                        <div className="card-body p-2">
                                            <p className="small text-muted mb-1 text-truncate" title={image.fileName}>
                                                {image.fileName}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">Order: {image.sortOrder}</small>
                                                <small className="text-muted">ID: {image.id}</small>
                                            </div>
                                        </div>

                                        <div className="card-footer p-2 bg-white">
                                            <div className="d-flex gap-1">
                                                {!image.isMain && (
                                                    <button
                                                        className="btn btn-sm btn-outline-warning flex-fill"
                                                        onClick={() => handleSetMain(image.id)}
                                                        title="Set as main image"
                                                    >
                                                        ⭐
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-danger flex-fill"
                                                    onClick={() => handleDelete(image.id, image.fileName)}
                                                    title="Delete image"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}