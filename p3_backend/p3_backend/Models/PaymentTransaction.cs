using System;

namespace p3_backend.Models;

/// <summary>
/// Ghi lại từng giao dịch VNPay (request hoặc callback).
/// </summary>
public class PaymentTransaction
{
    public int TransactionId { get; set; }

    /// <summary>Đơn hàng liên quan.</summary>
    public int OrderId { get; set; }

    /// <summary>vnp_TxnRef gửi lên VNPay (= OrderId).</summary>
    public string TxnRef { get; set; }

    /// <summary>Số tiền (VND, không nhân 100).</summary>
    public decimal Amount { get; set; }

    /// <summary>Mã giao dịch VNPay trả về (vnp_TransactionNo).</summary>
    public string VnpTransactionNo { get; set; }

    /// <summary>Mã phản hồi (00 = thành công).</summary>
    public string ResponseCode { get; set; }

    /// <summary>Thông báo từ VNPay.</summary>
    public string Message { get; set; }

    /// <summary>Pending | Success | Failed</summary>
    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order Order { get; set; }
}
