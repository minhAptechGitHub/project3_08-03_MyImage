using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace p3_backend.Helpers
{
    /// <summary>
    /// Utility class to build VNPay payment URL and validate the HMAC-SHA512 response.
    /// </summary>
    public static class VnPayHelper
    {
        /// <summary>
        /// Build sorted query string and generate HMAC-SHA512 secure hash.
        /// </summary>
        public static string CreatePaymentUrl(
            string baseUrl,
            SortedDictionary<string, string> vnpParams,
            string hashSecret)
        {
            var query = string.Join("&", vnpParams
                .Where(kv => !string.IsNullOrEmpty(kv.Value))
                .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));

            // Theo chuẩn VNPay 2.1.0: Chuỗi signData chính là chuỗi query (đã encode)
            var signData = query;
            var secureHash = HmacSha512(hashSecret, signData);

            return $"{baseUrl}?{query}&vnp_SecureHash={secureHash}";
        }

        /// <summary>
        /// Validate that VNPay callback is authentic.
        /// </summary>
        public static bool ValidateSignature(
            IEnumerable<KeyValuePair<string, string>> queryParams,
            string hashSecret)
        {
            var paramDict = queryParams
                .Where(kv => kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType" && !string.IsNullOrEmpty(kv.Value))
                .OrderBy(kv => kv.Key, StringComparer.Ordinal)
                .ToDictionary(kv => kv.Key, kv => kv.Value);

            var signData = string.Join("&", paramDict.Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));
            var computedHash = HmacSha512(hashSecret, signData);

            var receivedHash = queryParams
                .FirstOrDefault(kv => kv.Key == "vnp_SecureHash").Value ?? "";

            return string.Equals(computedHash, receivedHash, StringComparison.OrdinalIgnoreCase);
        }

        private static string HmacSha512(string key, string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            using var hmac = new HMACSHA512(keyBytes);
            var hash = hmac.ComputeHash(dataBytes);
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }

        /// <summary>VNPay timestamp format: yyyyMMddHHmmss</summary>
        public static string GetVnPayDateString(DateTime dt)
            => dt.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
    }
}
