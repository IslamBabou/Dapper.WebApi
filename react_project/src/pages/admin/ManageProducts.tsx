import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import ProductImageManager from "../../components/ProductImageManager";
import api from "../../services/api";
import type { Product, CreateProductDto } from "../../types/Products";

interface ProductImage {
    id: number;
    productId: number;
    fileName: string;
    url: string;
    isMain: boolean;
    sortOrder: number;
    createdAt: string;
}

interface ProductWithImages extends Product {
    mainImage?: ProductImage;
    imageCount?: number;
}

export default function ManageProducts() {
    const [products, setProducts] = useState<ProductWithImages[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<CreateProductDto>({
        name: "",
        description: "",
        price: 0,
    });
    const [creating, setCreating] = useState(false);

    // Edit mode
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Image management
    const [managingImagesFor, setManagingImagesFor] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get<Product[]>("/Products");

            // Fetch main image and image count for each product
            const productsWithImages = await Promise.all(
                res.data.map(async (product) => {
                    try {
                        // Fetch main image
                        const mainImageRes = await api.get<ProductImage>(`/ProductImages/product/${product.id}/main`);
                        // Fetch all images to get count
                        const allImagesRes = await api.get<ProductImage[]>(`/ProductImages/product/${product.id}`);

                        return {
                            ...product,
                            mainImage: mainImageRes.data,
                            imageCount: allImagesRes.data.length
                        };
                    } catch (err) {
                        // No images found
                        return {
                            ...product,
                            mainImage: undefined,
                            imageCount: 0
                        };
                    }
                })
            );

            setProducts(productsWithImages);
        } catch (err) {
            setError("Failed to load products");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value
        }));
    };

    const handleCreateProduct = async () => {
        if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
            alert("Please fill in all fields with valid values");
            return;
        }

        try {
            setCreating(true);
            await api.post("/Products", formData);

            alert("Product created successfully!");
            setFormData({ name: "", description: "", price: 0 });
            setShowCreateForm(false);
            fetchProducts();
        } catch (err) {
            alert("Failed to create product");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProduct = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await api.delete(`/Products/${id}`);
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (err) {
            alert("Failed to delete product");
            console.error(err);
        }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
        });
        setShowCreateForm(false);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({ name: "", description: "", price: 0 });
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        try {
            setCreating(true);

            await api.put(`/Products/${editingProduct.id}`, formData);

            alert("Product updated successfully!");
            cancelEdit();
            fetchProducts();
        } catch (err) {
            alert("Failed to update product");
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const openImageManager = (product: Product) => {
        setManagingImagesFor(product);
    };

    const closeImageManager = () => {
        setManagingImagesFor(null);
        // Refresh products to get updated image info
        fetchProducts();
    };

    return (
        <div className="d-flex">
            <AdminSidebar />

            <div className="p-4" style={{ flex: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Manage Products</h2>
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setEditingProduct(null);
                        }}
                        disabled={editingProduct !== null}
                    >
                        {showCreateForm ? "Cancel" : "+ Add New Product"}
                    </button>
                </div>

                {/* Create/Edit Product Form */}
                {(showCreateForm || editingProduct) && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">
                                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
                            </h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Laptop Dell XPS 15"
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Price ($)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter product description..."
                                    rows={4}
                                />
                            </div>
                            <div className="d-flex gap-2">
                                {editingProduct ? (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleUpdateProduct}
                                            disabled={creating}
                                        >
                                            {creating ? "Updating..." : "Update Product"}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={cancelEdit}
                                            disabled={creating}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-success"
                                        onClick={handleCreateProduct}
                                        disabled={creating}
                                    >
                                        {creating ? "Creating..." : "Create Product"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center p-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <>
                        <h5 className="mb-3">All Products ({products.length})</h5>
                        {products.length === 0 ? (
                            <div className="alert alert-info">
                                No products found. Create your first product above!
                            </div>
                        ) : (
                            <div className="row">
                                {products.map((product) => (
                                    <div key={product.id} className="col-md-4 mb-4">
                                        <div className="card h-100 shadow-sm">
                                            {/* Product Image */}
                                            {product.mainImage ? (
                                                <div className="position-relative">
                                                    <img
                                                        src={product.mainImage.url}
                                                        alt={product.name}
                                                        className="card-img-top"
                                                        style={{ height: '200px', objectFit: 'cover' }}
                                                    />
                                                    {product.imageCount && product.imageCount > 1 && (
                                                        <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75">
                                                            📷 {product.imageCount}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                                    style={{ height: '200px' }}
                                                >
                                                    <div className="text-center">
                                                        <div style={{ fontSize: '3rem' }}>📦</div>
                                                        <span className="text-muted small">No Image</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="card-body">
                                                <h5 className="card-title">{product.name}</h5>
                                                <p className="card-text text-muted small">
                                                    {product.description}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h4 className="text-success mb-0">
                                                        ${product.price.toFixed(2)}
                                                    </h4>
                                                    <span className="badge bg-secondary">
                                                        ID: {product.id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-footer bg-white border-top-0">
                                                <div className="d-flex gap-2 mb-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary flex-fill"
                                                        onClick={() => startEdit(product)}
                                                        disabled={editingProduct !== null}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger flex-fill"
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-info w-100"
                                                    onClick={() => openImageManager(product)}
                                                >
                                                    🖼️ Manage Images {product.imageCount ? `(${product.imageCount})` : ''}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Image Management Modal */}
                {managingImagesFor && (
                    <div
                        className="modal show d-block"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={closeImageManager}
                    >
                        <div
                            className="modal-dialog modal-xl modal-dialog-scrollable"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Manage Product Images
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeImageManager}
                                    ></button>
                                </div>
                                <div className="modal-body p-0">
                                    <ProductImageManager
                                        productId={managingImagesFor.id}
                                        productName={managingImagesFor.name}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeImageManager}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}