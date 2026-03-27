using System;
using System.Collections.Generic;

namespace p3_backend.Models;

public partial class PaymentTransaction
{
    public int TransactionId { get; set; }

    public int OrderId { get; set; }

    public string TxnRef { get; set; }

    public decimal Amount { get; set; }

    public string VnpTransactionNo { get; set; }

    public string ResponseCode { get; set; }

    public string Message { get; set; }

    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order Order { get; set; }
}
