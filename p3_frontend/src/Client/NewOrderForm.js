import { useState, useEffect } from "react";
import apiService from "../Admin/Services";
import './NewOrderForm.css';

function NewOrderForm({ user }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [sizes, setSizes] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSizes();
    }, [user]);

    const fetchSizes = async () => {
        try {
            const result = await apiService.printSizes.getAll();
            setSizes(result.filter(s => s.isAvailable));
        } catch (err) {
            console.error('Error fetching sizes:', err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setError('');
    };

    // Returns the price of the currently selected size
    const getSelectedPrice = () => {
        const size = sizes.find(s => s.sizeId === parseInt(selectedSize));
        return size ? size.price : 0;
    };

    // ============================================================
    // SUBMIT: Order → Upload Photo → Photo record → OrderDetail
    // ============================================================
    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // --- Validation ---
        if (!file) return setError('Please select a photo.');
        if (!selectedSize) return setError('Please select a print size.');
        if (quantity < 1) return setError('Quantity must be at least 1.');

        const pricePerCopy = getSelectedPrice();
        const totalPrice = pricePerCopy * quantity;

        setLoading(true);
        try {
            // ── STEP 1: Create Order ──────────────────────────────
            const orderPayload = {
                custId: user.custId,
                orderDate: new Date().toISOString(),
                totalPrice: totalPrice,
                shippingAddress: user.address || '',
                status: 'Pending',
                processedByAdminId: null
                // folder_name is computed by DB (persisted column), no need to send
            };

            const createdOrder = await apiService.orders.create(orderPayload);
            const orderId = createdOrder.orderId;

            // ── STEP 2: Upload photo file to backend folder ───────
            // Backend should save it to uploads/folder_XXXX/<filename>
            // and return the saved file path
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orderId', orderId);

            const uploadResult = await apiService.photos.upload(formData);
            // Expected response: { filePath: "uploads/folder_0001/photo.jpg", fileName: "photo.jpg" }
            const { filePath, fileName } = uploadResult;

            // ── STEP 3: Create Photo record ───────────────────────
            const photoPayload = {
                custId: user.custId,
                fileName: fileName,
                filePath: filePath,
                uploadDate: new Date().toISOString()
            };

            const createdPhoto = await apiService.photos.create(photoPayload);
            const photoId = createdPhoto.photoId;

            // ── STEP 4: Create OrderDetail record ─────────────────
            const detailPayload = {
                orderId: orderId,
                photoId: photoId,
                sizeId: parseInt(selectedSize),
                quantity: parseInt(quantity),
                pricePerCopy: pricePerCopy
                // line_total is computed by DB (persisted column), no need to send
            };

            await apiService.orderDetails.create(detailPayload);

            // ── Done ──────────────────────────────────────────────
            setSuccess(`Order #${orderId} placed successfully!`);
            setFile(null);
            setPreview(null);
            setSelectedSize('');
            setQuantity(1);

        } catch (err) {
            console.error('Order submission failed:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Derived values for display ────────────────────────────────
    const pricePerCopy = getSelectedPrice();
    const totalPrice = pricePerCopy * quantity;

    return (
        <div>
            <h2 className="section-title">New Order</h2>
            <p className="section-description">Upload a photo, choose a print size and quantity, then place your order.</p>

            {/* Error / Success feedback */}
            {error && <p className="alert alert-error">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}

            {/* 1. File picker */}
            <div className="form-group">
                <label className="form-label">Select Photo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && (
                    <div className="photo-preview">
                        <img src={preview} alt="preview" />
                    </div>
                )}
            </div>

            {/* 2. Size picker */}
            <div className="form-group">
                <label className="form-label">Print Size</label>
                <select
                    className="form-select"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                >
                    <option value="">-- Select Size --</option>
                    {sizes.map((s) => (
                        <option key={s.sizeId} value={s.sizeId}>
                            {s.sizeName} — {s.price.toLocaleString()} VND
                        </option>
                    ))}
                </select>
            </div>

            {/* 3. Quantity */}
            <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </div>

            {/* 4. Price summary */}
            {selectedSize && (
                <div className="price-summary">
                    <div className="price-item">
                        <span className="price-label">Price per copy</span>
                        <span className="price-value">{pricePerCopy.toLocaleString()} VND</span>
                    </div>
                    <div className="price-item">
                        <span className="price-label">Total</span>
                        <span className="price-value price-total">{totalPrice.toLocaleString()} VND</span>
                    </div>
                </div>
            )}

            {/* 5. Submit */}
            <div className="action-bar">
                <button className="btn-add" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Placing Order...' : 'Order'}
                </button>
            </div>
        </div>
    );
}

export default NewOrderForm;