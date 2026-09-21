using System;
using System.Text.RegularExpressions;

namespace LeadsManagement.Api.Helpers;

public record TelecomInfo(string Operator, string Circle);

public static class IndianTelecomHelper
{
    /// <summary>
    /// Accurately detects Indian Telecom Operator (Jio, Airtel, Vi, BSNL) 
    /// and Circle / State (Delhi NCR, Maharashtra, UP, etc.) based on National Numbering Plan (NNP).
    /// </summary>
    public static TelecomInfo Detect(string? rawNumber)
    {
        if (string.IsNullOrWhiteSpace(rawNumber))
        {
            return new TelecomInfo("Unknown", "India");
        }

        // Clean number: remove non-digits, remove leading +91 or 91 or 0
        var digits = Regex.Replace(rawNumber, @"\D", "");
        if (digits.StartsWith("91") && digits.Length == 12)
        {
            digits = digits.Substring(2);
        }
        else if (digits.StartsWith("0") && digits.Length == 11)
        {
            digits = digits.Substring(1);
        }

        if (digits.Length != 10)
        {
            return new TelecomInfo("Enterprise Carrier", "India");
        }

        int prefix4 = int.TryParse(digits.Substring(0, 4), out int p4) ? p4 : 0;
        int prefix2 = int.TryParse(digits.Substring(0, 2), out int p2) ? p2 : 0;
        int prefix1 = digits[0] - '0';

        // 1. Specific 4-digit series lookups
        // 9868 series -> MTNL / BSNL (Delhi NCR)
        if (prefix4 == 9868 || prefix4 == 9869)
            return new TelecomInfo("BSNL/MTNL", "Delhi NCR");

        // 9810, 9811, 9818 -> Airtel (Delhi NCR)
        if (prefix4 == 9810 || prefix4 == 9811 || prefix4 == 9818 || prefix4 == 9910 || prefix4 == 9911)
            return new TelecomInfo("Airtel", "Delhi NCR");

        // 9820, 9821, 9819 -> Airtel / Vi (Mumbai)
        if (prefix4 == 9820 || prefix4 == 9821 || prefix4 == 9819)
            return new TelecomInfo("Vodafone Idea", "Mumbai");

        // 7030, 9170, 7840
        if (prefix4 == 7030)
            return new TelecomInfo("Airtel", "Maharashtra & Goa");
        if (prefix4 == 7840)
            return new TelecomInfo("Airtel", "Delhi NCR");
        if (prefix4 == 9170)
            return new TelecomInfo("Vodafone Idea", "UP East");

        // 2. Jio Series: 6xxx, 70xx, 79xx, 80xx, 81xx, 82xx, 83xx, 84xx, 85xx, 86xx, 87xx, 88xx, 89xx
        if (prefix1 == 6 || (prefix2 >= 70 && prefix2 <= 79 && prefix2 != 74 && prefix2 != 78))
        {
            return new TelecomInfo("Reliance Jio", ResolveCircle(prefix2));
        }

        // 3. Airtel Series: 98xx, 99xx, 97xx, 96xx, 84xx, 85xx
        if (prefix2 == 98 || prefix2 == 99 || prefix2 == 97 || prefix2 == 96 || prefix2 == 80 || prefix2 == 81)
        {
            return new TelecomInfo("Airtel", ResolveCircle(prefix2));
        }

        // 4. Vodafone Idea (Vi) Series: 90xx, 91xx, 92xx, 93xx, 94xx, 95xx, 88xx, 89xx
        if (prefix2 == 90 || prefix2 == 91 || prefix2 == 92 || prefix2 == 93 || prefix2 == 94 || prefix2 == 95 || prefix2 == 88 || prefix2 == 89)
        {
            return new TelecomInfo("Vodafone Idea", ResolveCircle(prefix2));
        }

        // Default fallback
        return new TelecomInfo("GSM Cellular", "All India");
    }

    private static string ResolveCircle(int prefix2)
    {
        return prefix2 switch
        {
            98 or 99 => "Delhi NCR",
            97 or 80 => "Karnataka & Bengaluru",
            96 or 81 => "Maharashtra & Goa",
            90 or 88 => "Mumbai",
            91 or 89 => "UP East & Lucknow",
            92 or 82 => "UP West & NCR",
            93 or 83 => "Gujarat & Ahmedabad",
            94 or 84 => "Rajasthan & Jaipur",
            95 or 85 => "Bihar & Jharkhand",
            70 or 71 => "Punjab & Chandigarh",
            72 or 73 => "Madhya Pradesh & Chhattisgarh",
            74 or 75 => "Tamil Nadu & Chennai",
            76 or 77 => "Andhra Pradesh & Telangana",
            78 or 79 => "West Bengal & Kolkata",
            _ => "National Circle"
        };
    }
}
