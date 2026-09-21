using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LeadsManagement.Api.Models.Dtos;
using LeadsManagement.Api.Services.Interfaces;

namespace LeadsManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiChatController : ControllerBase
{
    private readonly ILeadService _leadService;
    private static readonly string[] IndianFemalePersonas = new[]
    {
        "Priya Sharma", "Neha Patel", "Pooja Singh", "Sneha Joshi", 
        "Ananya Gupta", "Divya Reddy", "Swati Mishra", "Kavita Sen", 
        "Riya Kapoor", "Megha Verma"
    };

    public AiChatController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Processes a conversational message naturally like a real human female executive.
    /// Responds precisely to what was asked (pricing, features, demo, DLT, greetings, Bhojpuri).
    /// </summary>
    [HttpPost("message")]
    public async Task<IActionResult> ProcessMessage([FromBody] AiChatRequestDto req, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(req.Message))
        {
            return BadRequest(new { success = false, message = "Message content is required." });
        }

        string rawMessage = req.Message.Trim();
        string lowerMsg = rawMessage.ToLowerInvariant();

        // 1. Assistant Persona Name (Female Executive)
        string assistantName = !string.IsNullOrWhiteSpace(req.AssistantName) 
            ? req.AssistantName.Trim() 
            : IndianFemalePersonas[new Random().Next(IndianFemalePersonas.Length)];

        // 2. Extract Lead Contact Entities
        string? name = req.CustomerName;
        string? mobile = req.Mobile;
        string? email = req.Email;
        string? service = req.ServiceRequired;
        string? inquiryType = req.InquiryType ?? "Sales";

        // Phone extraction (10-digit or formatted phone)
        var newPhoneMatch = Regex.Match(rawMessage, @"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b");
        if (newPhoneMatch.Success)
        {
            mobile = newPhoneMatch.Value.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
        }

        // Email extraction
        var newEmailMatch = Regex.Match(rawMessage, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        if (newEmailMatch.Success)
        {
            email = newEmailMatch.Value.ToLowerInvariant();
        }

        // Name Extraction
        if (string.IsNullOrEmpty(name))
        {
            var namePatterns = new[]
            {
                @"(?:my name is|mera naam hai|mera naam|i am|i m|im|\bi\b|\bme\b|\bmain\b|this is|naam|hum)\s+([A-Za-z\u0900-\u097F]+)",
                @"(?:^|\s)(?:hi|hii|hello|hey)\s+(?:i am|i m|im|i|me|main)?\s*([A-Za-z\u0900-\u097F]+)",
                @"^([A-Za-z\u0900-\u097F]+)\s+(?:here|bolatani|bol rha hoon|bol rahi hoon)"
            };

            var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase) 
            { 
                "hi", "hii", "hello", "hey", "a", "an", "the", "good", "need", "looking", "want", 
                "help", "how", "are", "you", "whats", "what", "price", "rate", "cost", "ok", 
                "sms", "rcs", "sales", "support", "team", "sir", "madam", "ji", "bhai", "bhojpuri", "hindi", "english"
            };

            foreach (var pattern in namePatterns)
            {
                var match = Regex.Match(rawMessage, pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    string candidate = match.Groups[1].Value.Trim();
                    if (!stopWords.Contains(candidate) && candidate.Length >= 2)
                    {
                        name = char.ToUpper(candidate[0]) + (candidate.Length > 1 ? candidate.Substring(1).ToLower() : "");
                        break;
                    }
                }
            }
        }

        // Update active service if mentioned in current turn
        if (lowerMsg.Contains("rcs") || lowerMsg.Contains("rich communication") || lowerMsg.Contains("rich card") || lowerMsg.Contains("verified bot"))
        {
            service = "RCS Business Messaging";
        }
        else if (lowerMsg.Contains("sms") || lowerMsg.Contains("bulk sms") || lowerMsg.Contains("dlt") || lowerMsg.Contains("sender id") || lowerMsg.Contains("pe id"))
        {
            service = "DLT Bulk SMS";
        }
        else if (lowerMsg.Contains("whatsapp") || lowerMsg.Contains("wa api") || lowerMsg.Contains("waba"))
        {
            service = "WhatsApp Business API";
        }
        else if (lowerMsg.Contains("voice") || lowerMsg.Contains("obd") || lowerMsg.Contains("ivr") || lowerMsg.Contains("call") || lowerMsg.Contains("calling") || lowerMsg.Contains("audio"))
        {
            service = "Smart Voice OBD & IVR";
        }
        else if (lowerMsg.Contains("smpp") || lowerMsg.Contains("gateway") || lowerMsg.Contains("carrier") || lowerMsg.Contains("telco") || lowerMsg.Contains("smsc"))
        {
            service = "Direct Telco SMPP Gateway";
        }

        // Inquiry Type Detection
        if (lowerMsg.Contains("support") || lowerMsg.Contains("issue") || lowerMsg.Contains("error") || lowerMsg.Contains("bug") || lowerMsg.Contains("down") || lowerMsg.Contains("not working") || lowerMsg.Contains("failed") || lowerMsg.Contains("madad"))
        {
            inquiryType = "Support";
        }
        else if (lowerMsg.Contains("price") || lowerMsg.Contains("pricing") || lowerMsg.Contains("cost") || lowerMsg.Contains("rate") || lowerMsg.Contains("daam") || lowerMsg.Contains("kitna") || lowerMsg.Contains("demo") || lowerMsg.Contains("buy") || lowerMsg.Contains("sales") || lowerMsg.Contains("plan") || lowerMsg.Contains("quote") || lowerMsg.Contains("chahiye") || lowerMsg.Contains("chahi"))
        {
            inquiryType = "Sales";
        }

        // 3. Language & Dialect Detection
        string detectedLanguage = "English";
        bool isBhojpuri = lowerMsg.Contains("kaisan") || lowerMsg.Contains("baani") || lowerMsg.Contains("bataai") || 
                          lowerMsg.Contains("humke") || lowerMsg.Contains("chahi") || lowerMsg.Contains("raua") || 
                          lowerMsg.Contains("baat kare ke") || lowerMsg.Contains("bhojpuri") || lowerMsg.Contains("kabo") || 
                          lowerMsg.Contains("hola") || lowerMsg.Contains("ka ba") || lowerMsg.Contains("theek ba") || 
                          lowerMsg.Contains("naam ba") || lowerMsg.Contains("bolatani") || lowerMsg.Contains("kaise baani") || 
                          lowerMsg.Contains("janna ba") || lowerMsg.Contains("dei do") || lowerMsg.Contains("kaise hoi") ||
                          lowerMsg.Contains("hamaar") || lowerMsg.Contains("kare ke ba") || lowerMsg.Contains("batawa");

        bool isHindi = !isBhojpuri && (
            Regex.IsMatch(rawMessage, @"[\u0900-\u097F]") ||
            lowerMsg.Contains("kaise") || lowerMsg.Contains("kya") || lowerMsg.Contains("chahiye") || 
            lowerMsg.Contains("batao") || lowerMsg.Contains("daam") || lowerMsg.Contains("karo") || 
            lowerMsg.Contains("hai") || lowerMsg.Contains("hoga") || lowerMsg.Contains("namaste") || 
            lowerMsg.Contains("shukriya") || lowerMsg.Contains("mera") || lowerMsg.Contains("meri") || 
            lowerMsg.Contains("main") || lowerMsg.Contains("hum") || lowerMsg.Contains("bataiye") || 
            lowerMsg.Contains("mujhe") || lowerMsg.Contains("aapka") || lowerMsg.Contains("tumhara") || 
            lowerMsg.Contains("kya rate") || lowerMsg.Contains("kaise kare") || lowerMsg.Contains("kitna") || 
            lowerMsg.Contains("bhi") || lowerMsg.Contains("kripya") || lowerMsg.Contains("suno") || 
            lowerMsg.Contains("thik") || lowerMsg.Contains("accha") || lowerMsg.Contains("batao") ||
            lowerMsg.Contains("paise") || lowerMsg.Contains("kharcha") || lowerMsg.Contains("rate")
        );

        if (isBhojpuri)
        {
            detectedLanguage = "Bhojpuri";
        }
        else if (isHindi)
        {
            detectedLanguage = "Hindi";
        }

        string reply;
        var suggestedChips = new List<string>();
        bool leadCaptured = false;
        int? leadId = null;

        // Check if new contact info was provided in THIS turn
        bool newContactProvided = newPhoneMatch.Success || newEmailMatch.Success;

        // A. If user just shared contact details, capture and save lead immediately
        if (newContactProvided && (!string.IsNullOrEmpty(name) || !string.IsNullOrEmpty(service) || !string.IsNullOrEmpty(mobile)))
        {
            try
            {
                string contactMobile = !string.IsNullOrEmpty(mobile) ? mobile : "Not Provided";
                string contactName = !string.IsNullOrEmpty(name) ? name : "Visitor";
                string targetService = !string.IsNullOrEmpty(service) ? service : "Enterprise Telecom Cloud";

                var transcriptList = new List<string>();
                foreach (var h in req.History.TakeLast(8))
                {
                    transcriptList.Add($"[{h.Sender.ToUpper()}]: {h.Content}");
                }
                transcriptList.Add($"[USER]: {rawMessage}");
                string fullTranscript = string.Join("\n", transcriptList);

                var newLead = await _leadService.CreateLeadAsync(new CreateLeadDto
                {
                    CustomerName = contactName,
                    Mobile = contactMobile,
                    Email = email,
                    City = req.City ?? "Auto-Detected",
                    State = req.State ?? "India",
                    Country = req.Country ?? "IN",
                    IpAddress = req.IpAddress ?? HttpContext.Connection.RemoteIpAddress?.ToString(),
                    ServiceRequired = targetService,
                    LeadSource = "AI Chat Assistant",
                    InquiryType = inquiryType,
                    ChatTranscript = fullTranscript,
                    LeadStatus = "Hot Lead",
                    Notes = $"Captured via {assistantName} ({inquiryType} for {targetService}) in {detectedLanguage}. Details reported to Boss/Management."
                }, cancellationToken);

                leadCaptured = true;
                leadId = newLead.Id;

                if (inquiryType == "Support")
                {
                    if (detectedLanguage == "Bhojpuri")
                    {
                        reply = $"Dhanyawad {contactName} ji! Maine aapki details apan boss aur management team ke report kar dele baani aur priority support ticket bana dihle baani (Ticket Ref #{leadId}). Hamari technical team jaldiye raua se {contactMobile} par sampark kari :)";
                    }
                    else if (detectedLanguage == "Hindi")
                    {
                        reply = $"Dhanyawad {contactName} ji! Maine aapki details hamare boss aur management team ko report kar di hai aur priority support ticket log kar diya hai (Ticket Ref #{leadId}). Hamari technical team aapse {contactMobile} par turant connect karegi :)";
                    }
                    else
                    {
                        reply = $"Thank you {contactName}! I have reported your details to our boss and management team and created a priority support ticket (Ticket Ref #{leadId}). Our technical team will get in touch on {contactMobile} shortly :)";
                    }
                }
                else
                {
                    if (detectedLanguage == "Bhojpuri")
                    {
                        reply = $"Dhanyawad {contactName} ji! Maine aapki details apan boss aur management team ke report kar dele baani. Hamari sales team jald hi raua se {contactMobile} par connect karke {targetService} ke demo credentials aur best discount rates provide kar deb (Lead Ref #{leadId}) :)";
                    }
                    else if (detectedLanguage == "Hindi")
                    {
                        reply = $"Dhanyawad {contactName} ji! Maine aapki details hamare boss aur management team ko report kar di hai. Hamari sales team aapse {contactMobile} par jald hi connect karke {targetService} ka demo credentials aur best discount rate provide karegi (Lead Ref #{leadId}) :)";
                    }
                    else
                    {
                        reply = $"Thank you {contactName}! I have reported your requirements to our boss and management team. Our Sales Team will connect with you shortly on {contactMobile} regarding {targetService} and share demo access (Lead Ref #{leadId}) :)";
                    }
                }

                suggestedChips = detectedLanguage == "Bhojpuri"
                    ? new List<string> { "API Documentation", "SMPP Specs", "Nayi Baat Shuru Karein" }
                    : detectedLanguage == "Hindi"
                        ? new List<string> { "API Documentation Dekhein", "Pricing Slabs", "Nayi Baat Shuru Karein" }
                        : new List<string> { "API Documentation", "Gateway Features", "Start New Chat" };
            }
            catch (Exception)
            {
                reply = $"Dhanyawad {name ?? "ji"}! Maine aapki details note kar li hain. Hamari team jald hi aapse connect karegi :)";
            }
        }
        else
        {
            string displayName = !string.IsNullOrEmpty(name) ? name : "ji";

            // Determine if this is the first interaction from the user after the initial greeting
            int previousUserMessagesCount = req.History?.Count(h => h.Sender.Equals("user", StringComparison.OrdinalIgnoreCase)) ?? 0;
            // Note: req.History might contain current user message depending on client implementation, 
            // so we check if previous turns by user <= 1
            bool isInitialUserTurn = previousUserMessagesCount <= 1;

            // B. SPECIFIC INTENT MATCHING (Exact Answers, No generic repetition!)

            // 1. PRICING / RATE INQUIRY
            bool isPricingInquiry = lowerMsg.Contains("price") || lowerMsg.Contains("pricing") || lowerMsg.Contains("cost") || 
                                    lowerMsg.Contains("rate") || lowerMsg.Contains("daam") || lowerMsg.Contains("kitna") || 
                                    lowerMsg.Contains("charge") || lowerMsg.Contains("kharcha") || lowerMsg.Contains("paise");

            // 2. DEMO / TRIAL INQUIRY
            bool isDemoInquiry = lowerMsg.Contains("demo") || lowerMsg.Contains("trial") || lowerMsg.Contains("testing") || 
                                 lowerMsg.Contains("test") || lowerMsg.Contains("dekhna hai") || lowerMsg.Contains("portal");

            // 3. DLT / SENDER ID INQUIRY
            bool isDltInquiry = lowerMsg.Contains("dlt") || lowerMsg.Contains("pe id") || lowerMsg.Contains("header") || 
                                lowerMsg.Contains("sender id") || lowerMsg.Contains("template") || lowerMsg.Contains("kyc");

            // 4. SUPPORT TEAM INTENT
            bool isSupportIntent = lowerMsg.Contains("support") || lowerMsg.Contains("support team") || 
                                   lowerMsg.Contains("technical") || lowerMsg.Contains("issue") || 
                                   lowerMsg.Contains("problem") || lowerMsg.Contains("error") || 
                                   lowerMsg.Contains("not working") || lowerMsg.Contains("failed") || 
                                   lowerMsg.Contains("dikkat") || lowerMsg.Contains("madad");

            // 5. SALES TEAM INTENT
            bool isSalesIntent = lowerMsg.Contains("sales") || lowerMsg.Contains("sales team") || 
                                 lowerMsg.Contains("buy") || lowerMsg.Contains("purchase") || 
                                 lowerMsg.Contains("naya plan") || lowerMsg.Contains("new plan") || 
                                 lowerMsg.Contains("service chahiye") || lowerMsg.Contains("chahi") ||
                                 lowerMsg.Contains("kharidna") || lowerMsg.Contains("account kholna");

            // 6. CASUAL / GREETING / "HOW ARE YOU" / IDENTITY / LANGUAGE SELECTION
            bool isLanguageOnly = lowerMsg == "english" || lowerMsg == "talk in english" || lowerMsg == "english me" ||
                                  lowerMsg == "hindi" || lowerMsg == "हिंदी" || (lowerMsg.Contains("hindi") && lowerMsg.Length < 25) || (lowerMsg.Contains("हिंदी") && lowerMsg.Length < 25) ||
                                  lowerMsg == "bhojpuri" || lowerMsg == "भोजपुरी" || (lowerMsg.Contains("bhojpuri") && lowerMsg.Length < 25) || (lowerMsg.Contains("भोजपुरी") && lowerMsg.Length < 25);

            bool isGreetingOnly = lowerMsg.StartsWith("hi") || lowerMsg.StartsWith("hii") || lowerMsg.StartsWith("hello") || 
                                  lowerMsg.StartsWith("hey") || lowerMsg.Contains("how are you") || lowerMsg.Contains("how r u") || 
                                  lowerMsg.Contains("kaise ho") || lowerMsg.Contains("kaisan baani") || 
                                  lowerMsg.Contains("namaste") || lowerMsg.Contains("pranaam") ||
                                  lowerMsg.StartsWith("i am") || lowerMsg.StartsWith("i m") || lowerMsg.StartsWith("mera naam");

            // 7. AFFIRMATIVE / OK / HAAN
            bool isAffirmative = lowerMsg == "ok" || lowerMsg == "okay" || lowerMsg == "theek hai" || 
                                 lowerMsg == "thik hai" || lowerMsg == "ha" || lowerMsg == "haan" || 
                                 lowerMsg == "yes" || lowerMsg == "accha" || lowerMsg == "sahi hai" || 
                                 lowerMsg == "bhejo" || lowerMsg == "sure";

            // --- ROUTING LOGIC ---

            // Step 1: User just responded to Language Question / Greeting -> Welcome them and ask: Sales Team or Support Team?
            if ((isLanguageOnly || isGreetingOnly || isInitialUserTurn) && !isSupportIntent && !isSalesIntent && !isPricingInquiry && !isDemoInquiry && !isDltInquiry)
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    string salutation = !string.IsNullOrEmpty(name) ? $"{name} ji" : "Raua";
                    reply = $"Welcome {salutation}! Yahan aave khatir raua ke bahut swagat ba! Raua ke **Sales Team (Naya plan, Rates, Demo)** se baat kare ke ba ya **Support Team (Technical help, DLT approval)** se?";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "SMS ke Rates", "RCS Demo Chahi" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    string salutation = !string.IsNullOrEmpty(name) ? $"{name} ji" : "Aapka";
                    reply = $"Welcome {salutation}! Yahan aane ke liye aapka bahut-bahut swagat hai! Aapko **Sales Team (Naye Plans, Pricing & Demo)** se baat karni hai ya **Support Team (Technical Help, DLT & Delivery Issue)** se?";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "DLT Bulk SMS Rates", "RCS Demo & Price" };
                }
                else
                {
                    string salutation = !string.IsNullOrEmpty(name) ? name : "Visitor";
                    reply = $"Welcome {salutation}! Thank you for visiting us. Would you like to connect with our **Sales Team (New Plans, Pricing & Demo)** or **Support Team (Technical Help, DLT & Delivery Issues)**?";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "Pricing & Rates", "DLT Support" };
                }
            }
            // Step 2: User chose SUPPORT TEAM or has a Support Issue
            else if (isSupportIntent)
            {
                inquiryType = "Support";
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Welcome to Support {displayName}! Hamaar technical support team raua ke poora madad kari. Kripya apan **Naam, Mobile Number aur Email ID** share kareen taaki hum apan boss/management ke report deke raua khatir priority support ticket register karwa diñ. Saath hi bataaiñ ki ka issue ya dikkat aavat ba?";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "DLT PE ID Issue", "SMS Delivery Dikkat", "API Integration Help" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Welcome to Support {displayName}! Hamari technical support team aapki poori madad karegi. Aapse request hai ki please apna **Name, Mobile Number aur Email ID** share kar dijiye taaki main hamare boss/management ko report dekar aapke issue ka priority ticket raise kar saku. Saath hi aapko kya problem ya technical issue aa rahi hai, zaroor batayein.";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "DLT PE ID Issue", "SMS Delivery Issue", "API Integration Help" };
                }
                else
                {
                    reply = $"Welcome to Support {displayName}! Our technical support team is here to assist you. Could you please share your **Name, Mobile Number, and Email ID** so I can report this to our management/boss and create a priority support ticket for you? Please also describe the issue you are facing.";
                    suggestedChips = new List<string> { "Share Contact Info", "DLT Approval Issue", "SMS Delivery Status", "API Integration Help" };
                }
            }
            // Step 3: User chose SALES TEAM or has a Pricing/Demo/Sales inquiry
            else if (isSalesIntent || isPricingInquiry)
            {
                inquiryType = "Sales";
                if (detectedLanguage == "Bhojpuri")
                {
                    if (service == "DLT Bulk SMS" || lowerMsg.Contains("sms"))
                    {
                        reply = $"Welcome to Sales {displayName}! DLT Bulk SMS ke rate **11 paisa se 14 paisa** per SMS ba aur DLT registration bilkul free ba. Kripya apan **Naam, Mobile Number aur Email ID** share kareen taaki hum apan boss/management ke report deke raua khatir best discount rate aur demo portal activate karwa diñ :)";
                    }
                    else if (service == "RCS Business Messaging" || lowerMsg.Contains("rcs"))
                    {
                        reply = $"Welcome to Sales {displayName}! RCS Business Messaging ke rate **18 paisa se 24 paisa** ba (verified green tick aur rich buttons ke sath). Kripya apan **Naam, Mobile Number aur Email ID** share kareen taaki hum boss ke report deke raua khatir live demo setup karwa diñ :)";
                    }
                    else if (service == "WhatsApp Business API" || lowerMsg.Contains("whatsapp"))
                    {
                        reply = $"Welcome to Sales {displayName}! WhatsApp Business API utility **28 paisa** aur marketing **48 paisa** ba. Kripya apan **Naam, Mobile Number aur Email ID** share kareen taaki hum boss/management ke inform karke demo credentials bhejwa diñ :)";
                    }
                    else
                    {
                        reply = $"Welcome to Sales {displayName}! Hamani ke rates: **DLT SMS 11p**, **RCS Messaging 18p**, **WhatsApp API 28p**, aur **Voice Calling 18p/pulse** ba. Kripya apan **Naam, Mobile Number aur Email ID** share kareen taaki hum apan boss/management ke report deke raua khatir best discount quote aur free demo book karwa diñ :)";
                    }
                    suggestedChips = new List<string> { "Number Share Karat Baani", "RCS Demo Chahi", "Bulk SMS Rate List", "WhatsApp API Demo" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    if (service == "DLT Bulk SMS" || lowerMsg.Contains("sms"))
                    {
                        reply = $"Welcome to Sales {displayName}! Hamare DLT Bulk SMS rates **11 paise se 14 paise** per SMS hain aur DLT setup bilkul free hai. Please apna **Name, Mobile Number aur Email ID** share kar dijiye taaki main hamare boss/management ke paas aapka priority demo slot aur custom discount quotation register karwa saku :)";
                    }
                    else if (service == "RCS Business Messaging" || lowerMsg.Contains("rcs"))
                    {
                        reply = $"Welcome to Sales {displayName}! RCS Business Messaging ka rate **18 paise se 24 paise** per delivered message hai (verified green tick aur action buttons). Please apna **Name, Mobile Number aur Email ID** share kar dijiye taaki main boss/management ko report dekar aapke liye live demo account setup karwa saku :)";
                    }
                    else if (service == "WhatsApp Business API" || lowerMsg.Contains("whatsapp"))
                    {
                        reply = $"Welcome to Sales {displayName}! WhatsApp Business API me utility messages **28 paise** aur marketing **48 paise** par available hain. Please apna **Name, Mobile Number aur Email ID** share kar dijiye taaki main management ko report dekar free demo credentials share kar saku :)";
                    }
                    else
                    {
                        reply = $"Welcome to Sales {displayName}! Hamare enterprise rates: **DLT Bulk SMS 11p - 14p**, **RCS Messaging 18p - 24p**, **WhatsApp API 28p**, aur **Voice OBD 18p/pulse** se start hain. Please apna **Name, Mobile Number aur Email ID** share kar dijiye taaki main hamare boss/management ke paas aapka priority demo slot aur custom volume discount quotation register karwa saku :)";
                    }
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "RCS Demo Portal", "Bulk SMS Rate Card", "WhatsApp Business API" };
                }
                else
                {
                    if (service == "DLT Bulk SMS" || lowerMsg.Contains("sms"))
                    {
                        reply = $"Welcome to Sales {displayName}! Our DLT Bulk SMS pricing starts from **11p to 14p per SMS** with free DLT onboarding. Please share your **Name, Mobile Number, and Email ID** so I can report your requirement to our boss/management and set up your custom discount quotation & demo portal :)";
                    }
                    else if (service == "RCS Business Messaging" || lowerMsg.Contains("rcs"))
                    {
                        reply = $"Welcome to Sales {displayName}! RCS Business Messaging starts at **18p to 24p** per delivered rich message with verified green tick. Please share your **Name, Mobile Number, and Email ID** so I can report to management and activate your live demo account :)";
                    }
                    else if (service == "WhatsApp Business API" || lowerMsg.Contains("whatsapp"))
                    {
                        reply = $"Welcome to Sales {displayName}! Official WhatsApp Business API is **28p for utility** and **48p for marketing**. Please share your **Name, Mobile Number, and Email ID** so I can submit your details to management for instant demo credentials :)";
                    }
                    else
                    {
                        reply = $"Welcome to Sales {displayName}! Our enterprise rates start from: **DLT Bulk SMS @ 11p**, **RCS Messaging @ 18p**, **WhatsApp API @ 28p**, and **Voice OBD @ 18p/pulse**. Please share your **Name, Mobile Number, and Email ID** so I can report your requirement to our boss/management and book a custom discount quote & free demo portal for you :)";
                    }
                    suggestedChips = new List<string> { "Share Mobile Number", "RCS Demo Access", "DLT SMS Pricing", "WhatsApp API Demo" };
                }
            }
            else if (isDemoInquiry)
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Haan bilkul {displayName}! Hum raua ke free demo portal aur 100 test credits activate karwa detani. Kripya apan **Mobile Number ya WhatsApp Number aur Email** share kareen taaki hum boss ke report deke instant access dilwa diñ :)";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "RCS Demo", "WhatsApp API Demo" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Haan bilkul {displayName}! Main aapko free demo portal login aur 100 test credits turant provide kar deti hoon. Kripya apna **Mobile Number ya WhatsApp Number aur Email** share kijiye taaki main management ko report dekar login access activate karwa saku :)";
                    suggestedChips = new List<string> { "Mobile Number Share Karein", "RCS Demo Portal", "WhatsApp API Demo" };
                }
                else
                {
                    reply = $"Certainly {displayName}! I can set up your free demo portal with 100 test credits right away. Could you please share your **Mobile / WhatsApp Number and Email ID** so I can report this to our management and generate your credentials?";
                    suggestedChips = new List<string> { "Share Mobile Number", "RCS Live Demo", "WhatsApp API Demo" };
                }
            }
            else if (isDltInquiry)
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"DLT registration me hum raua ke 100% free support deb (Jio/Airtel/Smartping DLT par). Entity ID, Header (Sender ID) aur Templates 24 ghanta me approve ho jaai. Kripya apan **Naam, Mobile Number aur Company ke Naam** share kareen taaki hum boss ke inform karke onboarding shuru karwa diñ :)";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "Entity ID Setup", "SMS Rate List" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"DLT registration me hum aapka 100% free support karenge (Jio, Airtel ya Smartping DLT par). Entity ID, Header aur Templates 24 ghante me approve ho jate hain. Please apna **Name, Mobile Number aur Company Name** share kar dijiye taaki main management ke paas aapka onboarding initiate kar saku :)";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "Entity ID Approval", "Bulk SMS Rates" };
                }
                else
                {
                    reply = $"We provide end-to-end 100% free DLT registration support across Jio, Airtel, and Smartping portals within 24 hours. Please share your **Name, Mobile Number, and Company Name** so I can initiate the onboarding with our management team :)";
                    suggestedChips = new List<string> { "Share Contact Info", "Header Registration", "SMS Rates" };
                }
            }
            else if (isAffirmative)
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Theek ba {displayName}! Raua apan **Mobile Number aur Email** share kar deen, hum custom quotation aur free demo credentials boss ke report deke bhejwa detani :)";
                    suggestedChips = new List<string> { "Number Share Kareen", "RCS Rates", "WhatsApp API" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Great {displayName}! Kripya apna **Mobile Number aur Email** share kar dijiye, main aapke liye custom quotation aur free demo credentials management ko report karke bhejwa deti hoon :)";
                    suggestedChips = new List<string> { "Mobile Number Share Karein", "RCS Pricing", "WhatsApp API" };
                }
                else
                {
                    reply = $"Great {displayName}! Please share your **Mobile Number and Email ID** so I can register your profile with our management and dispatch your custom quote & demo credentials :)";
                    suggestedChips = new List<string> { "Share Contact Info", "View Pricing", "WhatsApp API" };
                }
            }
            else if (service == "RCS Business Messaging" || lowerMsg.Contains("rcs"))
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"RCS Business Messaging me verified green tick, photo/video carousels, aur direct action buttons milela jisse conversion 4 guna badh jaala. Rate sirf **18p** se shuru ba. Kripya apan **Mobile Number** share kareen taaki hum boss ke report deke live demo card bhejwa diñ :)";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "RCS Price Rate", "Sales se Baat Kareen" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"RCS Business Messaging me verified green tick profile, rich media carousels aur 1-tap action buttons aate hain, jisse customer conversion standard SMS se 4 guna badh jata hai. Rate **18 paise** se shuru hai. Please apna **Mobile Number** share kijiye taaki main management ko report dekar live demo card bhej sakun :)";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "RCS Pricing Slabs", "Sales se Baat Karein" };
                }
                else
                {
                    reply = $"RCS Business Messaging delivers verified sender branding with green checkmark, rich media carousels, and 1-tap action buttons with up to 4x higher CTR than standard SMS at **18p**. Please share your **Mobile Number** so I can report to management and send you a live demo card :)";
                    suggestedChips = new List<string> { "Share Mobile Number", "RCS Pricing Slabs", "Talk to Sales" };
                }
            }
            else if (service == "WhatsApp Business API" || lowerMsg.Contains("whatsapp") || lowerMsg.Contains("wa"))
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"WhatsApp Business API official Meta verified platform ba (utility **28p**, marketing **48p**). Isme 24/7 automated chatbot aur green badge milela. Instant demo khatir apan **Mobile Number** bataaiñ taaki hum boss ke report kar sakeen.";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "Chatbot Automation", "Support Team 🛠️" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"WhatsApp Business API official Meta platform hai (utility **28 paise**, marketing **48 paise**) jisme 24/7 automated chatbot aur green badge milta hai. Instant demo ke liye apna **Mobile Number** share karein taaki main management ko report kar saku.";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "Meta Verification", "Support Team 🛠️" };
                }
                else
                {
                    reply = $"Our Official WhatsApp Business API provides high-throughput automated notifications (utility @ **28p**, marketing @ **48p**), 24/7 bot flows, and green badge verification. Please share your **Mobile Number** so I can report to management and setup your demo.";
                    suggestedChips = new List<string> { "Share Mobile Number", "Meta Verification", "Support Team 🛠️" };
                }
            }
            else if (service == "DLT Bulk SMS" || lowerMsg.Contains("sms"))
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Hamare Bulk SMS me 100+ TPS speed aur direct telco delivery milela (Rate: **11 paise se 14 paise**). DLT approval free ba. Kripya apan **Mobile Number** share kareen taaki hum boss ke report deke demo account activate karwa diñ :)";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "SMS Pricing Slabs", "Direct SMPP" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Hamare DLT Bulk SMS me 100+ TPS direct operator delivery aur instant OTP route milta hai (Rate: **11 paise se 14 paise**). DLT approval 100% free hai. Please apna **Mobile Number** share karein taaki main boss/management ko report dekar demo account activate karwa saku :)";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "SMS Pricing Slabs", "Direct SMPP" };
                }
                else
                {
                    reply = $"Our DLT Bulk SMS offers 100+ TPS direct telecom binds starting at **11p to 14p** with free DLT onboarding. Please share your **Mobile Number** so I can report your requirement to our boss/management and activate your demo :)";
                    suggestedChips = new List<string> { "Share Mobile Number", "SMS Pricing", "SMPP Gateway" };
                }
            }
            else if (service == "Smart Voice OBD & IVR" || lowerMsg.Contains("voice") || lowerMsg.Contains("obd") || lowerMsg.Contains("ivr"))
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Voice OBD & IVR se raua dynamic voice call aur automated OTP bhej sakeeni (Rate: **18 paisa/pulse**). Kripya apan **Mobile Number** share kareen taaki hum boss ke report deke live demo call lagwa diñ :)";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "Voice Rate Card", "Sales Team 💼" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Smart Voice OBD me Text-to-Speech (TTS) voice broadcasting aur automated OTP call dispatch hoti hai (Rate: **18 paise/pulse**). Please apna **Mobile Number** share karein taaki main management ko report dekar live demo call lagwa saku :)";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "TTS Voice Demo", "Sales Team 💼" };
                }
                else
                {
                    reply = $"Smart Voice OBD & IVR provides dynamic Text-to-Speech voice broadcasting and OTP calls at **18p/pulse**. Please share your **Mobile Number** so I can report to management and schedule a live demo call for you :)";
                    suggestedChips = new List<string> { "Share Mobile Number", "TTS Demo", "Sales Team 💼" };
                }
            }
            else if (service == "Direct Telco SMPP Gateway" || lowerMsg.Contains("smpp"))
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Direct Telco SMPP Gateway Jio, Airtel, Vi se direct connected ba (200+ TPS speed). Bind parameters aur rate list khatir apan **Mobile Number** share kareen taaki hum boss ke inform kar sakeen.";
                    suggestedChips = new List<string> { "Number Share Karat Baani", "Carrier Routing", "Pricing Quote" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Hamara Direct Telco SMPP Gateway Jio, Airtel, Vi aur Tata se direct dual-node 200+ TPS throughput deta hai. Bind parameters aur discount quotation ke liye apna **Mobile Number** share karein taaki main boss/management ko inform kar saku.";
                    suggestedChips = new List<string> { "Mobile No. Share Karein", "Carrier Routing", "Pricing Quote" };
                }
                else
                {
                    reply = $"Our Direct Telco SMPP Gateway connects directly to Tier-1 telecom operators with dual-node failover and 200+ TPS. Please provide your **Mobile Number** so I can report to management and share bind specs.";
                    suggestedChips = new List<string> { "Share Mobile Number", "Carrier Routing", "Pricing Quote" };
                }
            }
            else
            {
                if (detectedLanguage == "Bhojpuri")
                {
                    reply = $"Hum {assistantName} bolat baani. Raua ke **Sales Team (Rates & Demo)** se baat kare ke ba ya **Support Team (Technical help)** se? Kripya apan **Mobile Number** bhi share kareen taaki hum boss ke report de sakeen :)";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "SMS Rates", "RCS Demo" };
                }
                else if (detectedLanguage == "Hindi")
                {
                    reply = $"Main {assistantName} baat kar rahi hoon. Aapko **Sales Team (Rates, Demo & Plans)** se baat karni hai ya **Support Team (Technical Help)** se? Please apna **Mobile Number** bhi share kar dijiye taaki main management/boss ko report de saku :)";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "DLT Bulk SMS Rates", "RCS Demo & Rates" };
                }
                else
                {
                    reply = $"I am {assistantName} from enterprise solutions. Would you like to connect with our **Sales Team (Rates, Demo & Plans)** or **Support Team (Technical Help)**? Please share your **Mobile Number** so I can report your requirement to our management/boss :)";
                    suggestedChips = new List<string> { "Sales Team 💼", "Support Team 🛠️", "Pricing & Rates", "RCS Demo" };
                }
            }
        }

        var response = new AiChatResponseDto
        {
            Reply = reply,
            LeadCaptured = leadCaptured,
            LeadId = leadId,
            AssistantName = assistantName,
            ExtractedName = name,
            ExtractedMobile = mobile,
            ExtractedEmail = email,
            ExtractedService = service,
            ExtractedInquiryType = inquiryType,
            DetectedLanguage = detectedLanguage,
            SuggestedChips = suggestedChips
        };

        return Ok(response);
    }
}

