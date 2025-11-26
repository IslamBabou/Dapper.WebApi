import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Product } from "../types/Products";
import type { ProductImage, ProductWithImages } from "../types/ProductImage";
import ProductModal from "../components/ProductDetailsModal";

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductWithImages[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(null);

    const navigate = useNavigate();

    // Check authentication
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const username = storedUsername || "Guest";
    const isAuthenticated = !!token;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get<Product[]>("/Products");

            // Fetch images for each product
            const productsWithImages = await Promise.all(
                res.data.map(async (product) => {
                    try {
                        const imagesRes = await api.get<ProductImage[]>(`/ProductImages/product/${product.id}`);
                        const images = imagesRes.data;
                        const mainImage = images.find(img => img.isMain) || images[0];

                        return {
                            ...product,
                            mainImage,
                            images
                        };
                    } catch (err) {
                        console.error(`Failed to load images for product ${product.id}`, err);
                        return {
                            ...product,
                            mainImage: undefined,
                            images: []
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    const handleRegister = () => {
        navigate("/register");
    };

    const openModal = (product: ProductWithImages) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                    <span className="navbar-brand">🛍️ Product Catalog</span>

                    {/* Right side - Auth buttons or user info */}
                    <div className="d-flex align-items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-white">
                                    👤 Welcome, <strong>{username}</strong>!
                                </span>
                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={handleRegister}
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                {/* Search Bar */}
                <div className="row mb-4">
                    <div className="col-md-6 mx-auto">
                        <div className="input-group input-group-lg">
                            <span className="input-group-text">🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading products...</p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="mb-0">
                                Available Products
                                {searchTerm && ` (${filteredProducts.length} found)`}
                            </h3>
                            {!isAuthenticated && (
                                <div className="alert alert-info mb-0 py-2">
                                    <small>
                                        💡 <strong>Login</strong> to purchase products
                                    </small>
                                </div>
                            )}
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="alert alert-info text-center">
                                {searchTerm
                                    ? "No products match your search."
                                    : "No products available at the moment."}
                            </div>
                        ) : (
                            <div className="row">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="col-md-4 col-lg-3 mb-4">
                                        <div className="card h-100 shadow-sm hover-shadow">
                                            {/* Product Image */}
                                            {product.mainImage ? (
                                                <div className="position-relative overflow-hidden">
                                                    <img
                                                        src={product.mainImage.url}
                                                        className="card-img-top product-image"
                                                        alt={product.name}
                                                        style={{ height: "200px", objectFit: "cover" }}
                                                    />
                                                    {product.images && product.images.length > 1 && (
                                                        <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75">
                                                            📷 {product.images.length} photos
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                                    style={{ height: "200px" }}
                                                >
                                                    <div className="text-center">
                                                        <div style={{ fontSize: "3rem" }}>📦</div>
                                                        <span className="text-muted">No Image</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title">{product.name}</h5>
                                                <p className="card-text text-muted small flex-grow-1">
                                                    {product.description}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                                    <h4 className="text-success mb-0">
                                                        ${product.price.toFixed(2)}
                                                    </h4>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => openModal(product)}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Product Details Modal */}
                        {selectedProduct && (
                            <ProductModal
                                product={selectedProduct}
                                onClose={closeModal}
                            />
                        )}
                    </>
                )}
            </div>

            <style>{`
                .hover-shadow {
                    transition: box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out;
                }
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                    transform: translateY(-5px);
                }
                .product-image {
                    transition: transform 0.3s ease-in-out;
                }
                .card:hover .product-image {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}