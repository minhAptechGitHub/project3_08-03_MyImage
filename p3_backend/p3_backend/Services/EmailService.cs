using System.Net;
using System.Net.Mail;

namespace p3_backend.Services
{
    public interface IEmailService
    {
        Task SendOrderStatusEmailAsync(string customerEmail, string customerName,
            int orderId, string newStatus);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendOrderStatusEmailAsync(string customerEmail, string customerName,
            int orderId, string newStatus)
        {
            try
            {
                var smtpHost = _config["Email:SmtpHost"];
                var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
                var smtpUser = _config["Email:SmtpUser"];
                var smtpPassword = _config["Email:SmtpPassword"];
                var fromEmail = _config["Email:FromEmail"];

                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUser, smtpPassword);

                    var subject = GetEmailSubject(newStatus, orderId);
                    var body = GetEmailTemplate(customerName, orderId, newStatus);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(fromEmail, "MyImage"),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(customerEmail);

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent to {customerEmail} for order {orderId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending email: {ex.Message}");
            }
        }

        private string GetEmailSubject(string status, int orderId)
        {
            return status switch
            {
                "Pending" => $"Đơn hàng #{orderId} đã được tiếp nhận",
                "Payment Verified" => $"Thanh toán xác nhận — Đơn #{orderId}",
                "Processing" => $"Đơn hàng #{orderId} đang được xử lý",
                "Printed" => $"Ảnh đã in xong — Đơn #{orderId}",
                "Shipped" => $"Đơn hàng #{orderId} đang giao",
                "Completed" => $"Đơn hàng #{orderId} hoàn thành",
                "Cancelled" => $"Đơn hàng #{orderId} đã được hủy",
                _ => $"Cập nhật đơn hàng #{orderId}"
            };
        }

        private string GetEmailTemplate(string customerName, int orderId, string status)
        {
            var templates = new Dictionary<string, string>
            {
                ["Pending"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Đơn hàng đã được tiếp nhận",
                    "#10b981",
                    new[] {
                        "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận trong hệ thống.",
                        "Chúng tôi đang xác nhận thông tin thanh toán và sẽ liên hệ với bạn sớm.",
                        "Thời gian xử lý dự kiến: 1–2 ngày."
                    },
                    "Chờ xác nhận"
                ),

                ["Payment Verified"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Thanh toán đã được xác nhận",
                    "#3b82f6",
                    new[] {
                        "Chúng tôi đã xác nhận thanh toán của bạn thành công.",
                        "Đơn hàng sẽ được bắt đầu xử lý ngay lập tức.",
                        "Bạn sẽ nhận được cập nhật tiếp theo trong vòng 24 giờ."
                    },
                    "Đã xác nhận"
                ),

                ["Processing"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Đơn hàng đang được xử lý",
                    "#f59e0b",
                    new[] {
                        "Đơn hàng của bạn đã được chuyển vào khâu xử lý.",
                        "Chúng tôi đang chuẩn bị tệp ảnh và kiểm tra chất lượng.",
                        "Dự kiến in xong trong 24–48 giờ tới."
                    },
                    "Đang xử lý"
                ),

                ["Printed"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Ảnh của bạn đã in xong",
                    "#8b5cf6",
                    new[] {
                        "Ảnh của bạn đã hoàn thành khâu in.",
                        "Sản phẩm hiện đang được kiểm tra chất lượng và chuẩn bị đóng gói.",
                        "Chúng tôi sẽ tiến hành giao hàng trong 1–2 ngày tới."
                    },
                    "Đã in xong"
                ),

                ["Shipped"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Đơn hàng đang trên đường giao",
                    "#06b6d4",
                    new[] {
                        "Đơn hàng của bạn đã được gửi đi.",
                        "Sản phẩm sẽ đến tay bạn trong 1–3 ngày tùy theo khu vực.",
                        "Vui lòng kiểm tra lại địa chỉ nhận hàng để đảm bảo nhận kịp thời."
                    },
                    "Đang giao"
                ),

                ["Completed"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Đơn hàng hoàn thành",
                    "#ec4899",
                    new[] {
                        "Cảm ơn bạn đã sử dụng dịch vụ của MyImage.",
                        "Hy vọng bạn hài lòng với sản phẩm. Hãy chia sẻ khoảnh khắc đẹp của bạn cùng chúng tôi.",
                        "Nếu có bất kỳ góp ý nào, chúng tôi luôn sẵn sàng lắng nghe."
                    },
                    "Hoàn thành"
                ),

                ["Cancelled"] = BuildEmailTemplate(
                    customerName, orderId,
                    "Đơn hàng đã bị hủy",
                    "#ef4444",
                    new[] {
                        "Đơn hàng của bạn đã được hủy theo yêu cầu.",
                        "Nếu đây là sai sót hoặc bạn thay đổi ý định, vui lòng liên hệ với chúng tôi ngay.",
                        "Chúng tôi sẵn sàng hỗ trợ bạn đặt lại đơn hàng mới."
                    },
                    "Đã hủy"
                )
            };

            return templates.ContainsKey(status) ? templates[status] :
                BuildEmailTemplate(
                    customerName, orderId,
                    "Cập nhật đơn hàng",
                    "#6b7280",
                    new[] { $"Đơn hàng của bạn có trạng thái mới: {status}." },
                    status
                );
        }

        private string BuildEmailTemplate(string customerName, int orderId, string title,
            string accentColor, string[] messageLines, string statusText)
        {
            var messages = string.Join("", messageLines.Select(m =>
                $"<p style=\"margin: 0 0 14px 0; color: #4b5563; font-size: 15px; line-height: 1.7;\">{m}</p>"));

            return $@"<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Helvetica, Arial, sans-serif;'>
    <table width='100%' cellpadding='0' cellspacing='0' style='padding: 40px 20px;'>
        <tr>
            <td align='center'>
                <table width='100%' cellpadding='0' cellspacing='0' style='max-width: 560px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;'>

                    <!-- Top accent bar -->
                    <tr>
                        <td style='background-color: {accentColor}; height: 4px; font-size: 0; line-height: 0;'>&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style='padding: 36px 40px 0 40px;'>
                            <p style='margin: 0 0 28px 0; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {accentColor};'>MyImage</p>
                            <h1 style='margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #111827; line-height: 1.3;'>{title}</h1>
                            <p style='margin: 0; font-size: 14px; color: #9ca3af;'>Đơn hàng #{orderId}</p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style='padding: 24px 40px 0 40px;'>
                            <hr style='border: none; border-top: 1px solid #f3f4f6; margin: 0;'>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style='padding: 28px 40px 0 40px;'>
                            <p style='margin: 0 0 20px 0; font-size: 15px; color: #374151;'>Xin chào <strong>{customerName}</strong>,</p>
                            {messages}
                        </td>
                    </tr>

                    <!-- Order info block -->
                    <tr>
                        <td style='padding: 24px 40px 0 40px;'>
                            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;'>
                                <tr>
                                    <td style='padding: 18px 20px;'>
                                        <table width='100%' cellpadding='0' cellspacing='0'>
                                            <tr>
                                                <td style='font-size: 13px; color: #6b7280; padding-bottom: 8px;'>Mã đơn hàng</td>
                                                <td align='right' style='font-size: 13px; color: #111827; font-weight: 600; padding-bottom: 8px;'>#{orderId}</td>
                                            </tr>
                                            <tr>
                                                <td style='font-size: 13px; color: #6b7280;'>Trạng thái</td>
                                                <td align='right'>
                                                    <span style='display: inline-block; background-color: {accentColor}; color: #ffffff; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; padding: 3px 10px; border-radius: 20px;'>{statusText}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Note -->
                    <tr>
                        <td style='padding: 24px 40px 36px 40px;'>
                            <p style='margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.6;'>
                                Nếu bạn có thắc mắc, hãy liên hệ chúng tôi qua <a href='mailto:support@myimage.com' style='color: {accentColor}; text-decoration: none;'>support@myimage.com</a> hoặc gọi <strong style='color: #6b7280;'>0123 456 789</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style='padding: 0 40px;'>
                            <hr style='border: none; border-top: 1px solid #f3f4f6; margin: 0;'>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style='padding: 24px 40px;'>
                            <table width='100%' cellpadding='0' cellspacing='0'>
                                <tr>
                                    <td style='font-size: 12px; color: #9ca3af; line-height: 1.6;'>
                                        <strong style='color: #6b7280;'>MyImage</strong> — In Ảnh Chuyên Nghiệp<br>
                                        Hà Nội, Việt Nam &nbsp;&middot;&nbsp; © 2026 MyImage
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }
    }
}