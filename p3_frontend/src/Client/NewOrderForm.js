import { useState, useEffect } from "react";
import apiService from "../Admin/Services";
import "./NewOrderForm.css";

function NewOrderForm({ user }) {

    const [photos, setPhotos] = useState([]);
    const [sizes, setSizes] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchSizes();
    }, [user]);

    const fetchSizes = async () => {
        try {
            const result = await apiService.printSizes.getAll();
            setSizes(result.filter(s => s.isAvailable));
        } catch (err) {
            console.error("Error fetching sizes:", err);
        }
    };

    // ===============================
    // Upload multiple photos
    // ===============================
    const handleFileChange = (e) => {

        const files = Array.from(e.target.files);

        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            sizeId: "",
            quantity: 1
        }));

        setPhotos(prev => [...prev, ...newPhotos]);
        setError("");
    };

    // ===============================
    // Change size
    // ===============================
    const handleSizeChange = (index, sizeId) => {

        const updated = [...photos];
        updated[index].sizeId = sizeId;

        setPhotos(updated);
    };

    // ===============================
    // Change quantity
    // ===============================
    const handleQuantityChange = (index, qty) => {

        const updated = [...photos];
        updated[index].quantity = qty;

        setPhotos(updated);
    };

    // ===============================
    // Remove photo
    // ===============================
    const removePhoto = (index) => {

        const updated = [...photos];
        updated.splice(index, 1);

        setPhotos(updated);
    };

    // ===============================
    // Get price by size
    // ===============================
    const getPrice = (sizeId) => {

        const size = sizes.find(s => s.sizeId === parseInt(sizeId));
        return size ? size.price : 0;
    };

    // ===============================
    // Calculate total price
    // ===============================
    const totalPrice = photos.reduce((sum, p) => {
        return sum + getPrice(p.sizeId) * p.quantity;
    }, 0);

    // ===============================
    // Submit Order
    // ===============================
    const handleSubmit = async () => {
        setError("");
        setSuccess("");

        if (photos.length === 0)
            return setError("Please upload at least one photo.");

        setLoading(true);

        try {
            // STEP 1: create order (Dữ liệu đầy đủ như code gốc của bạn)
            const orderPayload = {
                custId: user.custId,
                orderDate: new Date().toISOString(),
                totalPrice: 0, // Backend sẽ tự cộng dồn khi tạo Detail
                shippingAddress: user.address || "",
                status: "Pending",
                processedByAdminId: null
            };

            const createdOrder = await apiService.orders.create(orderPayload);
            const orderId = createdOrder.orderId;

            // STEP 2: loop photos (Giữ nguyên các bước Upload và Create Photo của bạn)
            for (const p of photos) {

                if (!p.sizeId)
                    throw new Error("Please select size for all photos");

                const price = getPrice(p.sizeId);

                // 2.1 Upload file thực tế
                const formData = new FormData();
                formData.append("file", p.file);
                formData.append("orderId", orderId); // Cần thiết để upload thành công

                const uploadResult = await apiService.photos.upload(formData);

                // 2.2 Tạo record Photo trong DB
                const photoPayload = {
                    custId: user.custId,
                    fileName: uploadResult.fileName,
                    filePath: uploadResult.filePath,
                    uploadDate: new Date().toISOString()
                };

                const createdPhoto = await apiService.photos.create(photoPayload);

                // 2.3 Tạo order detail
                // Backend mới của bạn sẽ tự động update TotalPrice cho Order ngay khi dòng này chạy xong
                await apiService.orderDetails.create({
                    orderId: orderId,
                    photoId: createdPhoto.photoId,
                    sizeId: parseInt(p.sizeId),
                    quantity: parseInt(p.quantity),
                    pricePerCopy: price
                });
            }

            // Thông báo thành công kèm mã Order
            setSuccess(`Order #${orderId} placed successfully!`);
            setPhotos([]);

        } catch (err) {
            // GIỮ NGUYÊN ĐOẠN XỬ LÝ LỖI CHI TIẾT CỦA BẠN
            console.error("FULL ERROR:", err);
            if (err.response) {
                console.error("API ERROR:", err.response.data);
                setError(err.response.data.message || "Server error");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (

        <div>

            <h2 className="section-title">New Order</h2>

            <p className="section-description">
                Upload photos, choose sizes and quantity, then place your order.
            </p>

            {error && <p className="alert alert-error">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}

            {/* Upload */}
            <div className="form-group">

                <label className="form-label">Select Photos</label>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />

            </div>

            {/* Photos */}
            <div className="photo-grid">

                {photos.map((p, index) => {

                    const price = getPrice(p.sizeId);
                    const lineTotal = price * p.quantity;

                    return (

                        <div key={index} className="photo-card">

                            <img src={p.preview} alt="preview" />

                            <select
                                className="form-select"
                                value={p.sizeId}
                                onChange={(e) => handleSizeChange(index, e.target.value)}
                            >

                                <option value="">Select Size</option>

                                {sizes.map(s => (

                                    <option key={s.sizeId} value={s.sizeId}>
                                        {s.sizeName} — {s.price.toLocaleString()} VND
                                    </option>

                                ))}

                            </select>

                            <input
                                type="number"
                                min="1"
                                className="form-input"
                                value={p.quantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                            />

                            <div className="line-price">
                                {lineTotal.toLocaleString()} VND
                            </div>

                            <button
                                className="btn-remove"
                                onClick={() => removePhoto(index)}
                            >
                                Remove
                            </button>

                        </div>
                    );

                })}

            </div>

            {/* Total */}
            {photos.length > 0 && (

                <div className="price-summary">

                    <div className="price-item">

                        <span className="price-label">Total</span>

                        <span className="price-value price-total">
                            {totalPrice.toLocaleString()} VND
                        </span>

                    </div>

                </div>

            )}

            {/* Submit */}
            <div className="action-bar">

                <button
                    className="btn-add"
                    onClick={handleSubmit}
                    disabled={loading}
                >

                    {loading ? "Placing Order..." : "Order"}

                </button>

            </div>

        </div>

    );
}

export default NewOrderForm;