import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../services/api";
import type { Product, CreateProductDto } from "../../types/Products";

export default function ManageProducts() {
    const [products, setProducts] = useState<Product[]>([]);
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get<Product[]>("/Products");
            setProducts(res.data);
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
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary flex-fill"
                                                        onClick={() => startEdit(product)}
                                                        disabled={editingProduct !== null}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger flex-fill"
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}