import { useState } from "react";
import type { ProductWithImages } from "../types/ProductImage";

interface ProductModalProps {
    product: ProductWithImages | null;
    onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!product) return null;

    const images = product.images || [];
    const currentImage = images[selectedImageIndex];

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={handleBackdropClick}
        >
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h5 className="modal-title">{product.name}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        <div className="row">
                            {/* Left Side - Images */}
                            <div className="col-md-6">
                                {/* Main Image */}
                                <div className="position-relative mb-3">
                                    {currentImage ? (
                                        <>
                                            <img
                                                src={currentImage.url}
                                                alt={product.name}
                                                className="img-fluid rounded"
                                                style={{
                                                    width: "100%",
                                                    height: "400px",
                                                    objectFit: "cover"
                                                }}
                                            />

                                            {/* Navigation Arrows */}
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2"
                                                        onClick={handlePrevImage}
                                                        style={{ opacity: 0.7 }}
                                                    >
                                                        ‹
                                                    </button>
                                                    <button
                                                        className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2"
                                                        onClick={handleNextImage}
                                                        style={{ opacity: 0.7 }}
                                                    >
                                                        ›
                                                    </button>

                                                    {/* Image Counter */}
                                                    <div className="position-absolute bottom-0 end-0 m-2">
                                                        <span className="badge bg-dark bg-opacity-75">
                                                            {selectedImageIndex + 1} / {images.length}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            className="bg-light d-flex align-items-center justify-content-center rounded"
                                            style={{ height: "400px" }}
                                        >
                                            <div className="text-center">
                                                <div style={{ fontSize: "4rem" }}>📦</div>
                                                <p className="text-muted">No Image Available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <div className="d-flex gap-2 overflow-auto">
                                        {images.map((image, index) => (
                                            <img
                                                key={image.id}
                                                src={image.url}
                                                alt={`${product.name} - ${index + 1}`}
                                                className={`img-thumbnail cursor-pointer ${index === selectedImageIndex ? "border-primary border-3" : ""
                                                    }`}
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    objectFit: "cover",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => setSelectedImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Side - Product Details */}
                            <div className="col-md-6">
                                {/* Price */}
                                <div className="mb-4">
                                    <h2 className="text-success mb-0">
                                        ${product.price.toFixed(2)}
                                    </h2>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <h6 className="fw-bold">Description</h6>
                                    <p className="text-muted">
                                        {product.description || "No description available."}
                                    </p>
                                </div>

                                {/* Product Info */}
                                <div className="mb-4">
                                    <h6 className="fw-bold">Product Information</h6>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">
                                            <strong>Product ID:</strong> #{product.id}
                                        </li>
                                        <li className="mb-2">
                                            <strong>Images:</strong> {images.length} photo{images.length !== 1 ? "s" : ""}
                                        </li>
                                        {product.createdAt && (
                                            <li className="mb-2">
                                                <strong>Added:</strong>{" "}
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-grid gap-2">
                                    <button className="btn btn-primary btn-lg">
                                        🛒 Add to Cart
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        ❤️ Add to Wishlist
                                    </button>
                                </div>

                                {/* Additional Info */}
                                <div className="mt-4 p-3 bg-light rounded">
                                    <small className="text-muted">
                                        <strong>💡 Note:</strong> Free shipping on orders over $100.
                                        30-day return policy.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}