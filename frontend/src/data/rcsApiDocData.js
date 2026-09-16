// Comprehensive OmniDigital RCS API Documentation Dataset
// 100% Faithful to Documentation.html (vendor portal)

export const DEFAULT_API_KEY = "A58463AEB7AE41CD9901D23D18BC2482883";
export const BASE_URL = "https://omnidigital.co.in/api/RCSApi";

export const QUICK_NAV_ITEMS = [
  {
    "id": "authentication",
    "label": "Authentication",
    "icon": "key"
  },
  {
    "id": "create-campaign",
    "label": "Create Campaign",
    "icon": "paper-plane"
  },
  {
    "id": "check-balance",
    "label": "Check Balance",
    "icon": "wallet"
  },
  {
    "id": "get-templates",
    "label": "Get Templates",
    "icon": "file-text"
  },
  {
    "id": "get-bots",
    "label": "Get Bots",
    "icon": "robot"
  },
  {
    "id": "create-bot",
    "label": "Create Bot",
    "icon": "plus-circle"
  },
  {
    "id": "create-template",
    "label": "Create Template",
    "icon": "code"
  },
  {
    "id": "send-chat-message",
    "label": "Send Chat Message",
    "icon": "comments"
  },
  {
    "id": "webhook-payloads",
    "label": "Webhook Payloads",
    "icon": "bell"
  },
  {
    "id": "error-codes",
    "label": "Error Codes",
    "icon": "exclamation-triangle"
  }
];

export const AUTH_DOC = {
  apiKey: DEFAULT_API_KEY,
  baseUrl: BASE_URL,
  howToAuthenticate: "Include your API key in every request as a query parameter:",
  requestUrlPattern: "https://omnidigital.co.in/api/RCSApi/{endpoint}?apiKey=" + DEFAULT_API_KEY
};

export const CREATE_CAMPAIGN_DOC = {
  endpoint: "/CreateCampaign",
  method: "POST",
  description: "Creates and submits a new RCS campaign with optional SMS fallback.",
  requestUrl: "POST https://omnidigital.co.in/api/RCSApi/CreateCampaign?apiKey=" + DEFAULT_API_KEY,
  headers: { "Content-Type": "application/json" },
  parameters: [
  [
    "TemplateId",
    "string",
    "Required",
    "RCS Template ID"
  ],
  [
    "CampaignName",
    "string",
    "Required",
    "Campaign name (1-50 chars, alphanumeric + spaces, hyphens, underscores)"
  ],
  [
    "MobileNumbers",
    "string[]",
    "Required",
    "Array of 10-digit mobile numbers (max 5000)"
  ],
  [
    "EnableFallback",
    "boolean",
    "Optional",
    "Enable SMS fallback (default: false)"
  ],
  [
    "EntityId",
    "string",
    "Conditional",
    "Required if EnableFallback is true"
  ],
  [
    "SenderId",
    "string",
    "Conditional",
    "Required if EnableFallback is true"
  ],
  [
    "SmsTemplateId",
    "string",
    "Conditional",
    "Required if EnableFallback is true"
  ],
  [
    "SmsText",
    "string",
    "Conditional",
    "Required if EnableFallback is true"
  ],
  [
    "CustomParam1",
    "string",
    "Optional",
    "Custom parameter (max 50 chars) echoed back in the DLR webhook payload"
  ],
  [
    "CustomParam2",
    "string",
    "Optional",
    "Custom parameter (max 50 chars) echoed back in the DLR webhook payload"
  ],
  [
    "CustomParam3",
    "string",
    "Optional",
    "Custom parameter (max 50 chars) echoed back in the DLR webhook payload"
  ],
  [
    "CustomParam4",
    "string",
    "Optional",
    "Custom parameter (max 50 chars) echoed back in the DLR webhook payload"
  ]
],
  validations: [
    "CampaignName: 1-50 characters. Allowed characters: letters, numbers, spaces, hyphens (-), underscores (_)",
    "MobileNumbers: Minimum 1, maximum 5000 numbers per request. Each number must be exactly 10 digits (Indian mobile numbers)",
    "EnableFallback: boolean (true or false). If true, all four fallback fields (EntityId, SenderId, SmsTemplateId, SmsText) become required",
    "CustomParam1-4: Optional string (max 50 characters each). Echoed back in DLR webhook",
    "TemplateId: Must be a valid, approved template ID belonging to your account"
  ],
  examples: {
    withoutFallback: "{\n                    \"TemplateId\": \"vendor_tpl_abc456\",\n                    \"CampaignName\": \"Summer_Sale_2024\",\n                    \"MobileNumbers\": [\n                    \"9876543210\",\n                    \"9123456789\",\n                    \"9988776655\"\n  ],\n                    \"EnableFallback\": false\n}",
    withFallback: "{\n                    \"TemplateId\": \"vendor_tpl_abc456\",\n                    \"CampaignName\": \"Welcome Campaign\",\n                    \"MobileNumbers\": [\n                    \"9876543210\",\n                    \"9123456789\"\n  ],\n                    \"EnableFallback\": true,\n                    \"EntityId\": \"1234567890\",\n                    \"SenderId\": \"SENDER\",\n                    \"SmsTemplateId\": \"1234567890123456789\",\n                    \"SmsText\": \"This is fallback SMS message\",\n                    \"CustomParam1\": \"ORDER-12345\",\n                    \"CustomParam2\": \"BATCH-A\",\n                    \"CustomParam3\": \"promo\",\n                    \"CustomParam4\": \"source_web\"\n}",
    withVariable: "{\n                    \"TemplateId\": \"vendor_tpl_abc456\",\n                    \"CampaignName\": \"Summer_Sale_2024\",\n                    \"MobileNumbers\": [\n                    \"9876543210,custom_param0,custom_param1,custom_param2\",\n                    \"9123456789,custom_param0,custom_param1,custom_param2\",\n                    \"9988776655,custom_param0,custom_param1,custom_param2\"\n  ],\n                    \"EnableFallback\": false\n}"
  },
  responses: {
    success: "{\n                    \"Status\": \"OK\",\n                    \"Response\": {\n                    \"Message\": \"Campaign created successfully!\",\n                    \"CampaignId\": 45678,\n                    \"TotalMobiles\": 2\n  }\n}",
    warning: "{\n                    \"Status\": \"WARNING\",\n                    \"Response\": {\n                    \"Message\": \"Invalid API Key!\"\n  }\n}",
    error: "{\n                    \"Status\": \"WARNING\",\n                    \"Response\": {\n                    \"Message\": \"Insufficient RCS balance. Your balance: 100, required: 500\"\n  }\n}"
  },
  curl: "curl -X POST \"https://omnidigital.co.in/api/RCSApi/CreateCampaign?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"TemplateId\": \"vendor_tpl_abc456\",\n    \"CampaignName\": \"Test_Campaign\",\n    \"MobileNumbers\": [\"9876543210\", \"9123456789\"],\n    \"EnableFallback\": false,\n    \"CustomParam1\": \"ORDER-12345\",\n    \"CustomParam2\": \"BATCH-A\",\n    \"CustomParam3\": \"promo\",\n    \"CustomParam4\": \"source_web\"\n  }'"
};

export const CHECK_BALANCE_DOC = {
  endpoint: "/CheckRcsBalance",
  method: "GET",
  description: "Retrieves the current RCS and SMS balance for the authenticated account.",
  requestUrl: "GET https://omnidigital.co.in/api/RCSApi/CheckRcsBalance?apiKey=" + DEFAULT_API_KEY,
  response: "{\n                    \"Status\": \"OK\",\n                    \"Response\": {\n                    \"RcsBalance\": 5000,\n                    \"SmsBalance\": 10000\n  }\n}",
  curl: "curl -X GET \"https://omnidigital.co.in/api/RCSApi/CheckRcsBalance?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\""
};

export const GET_TEMPLATES_DOC = {
  endpoint: "/GetTemplates",
  method: "GET",
  description: "Retrieves templates associated with a specific bot. Supports filtering by template name, template type, and approval status.",
  queryParams: [
  [
    "apiKey",
    "string",
    "Required",
    "Your API authentication key"
  ],
  [
    "botId",
    "string",
    "Required",
    "Bot identifier (vendor-assigned Bot ID)"
  ],
  [
    "templateName",
    "string",
    "Optional",
    "Filter templates by name (case-insensitive partial match)"
  ],
  [
    "templateType",
    "string",
    "Optional",
    "Filter by template type: PlainText, RichCard, or Carousel"
  ],
  [
    "status",
    "string",
    "Optional",
    "Filter by template status: Active, Pending, or Rejected (case-insensitive)"
  ]
],
  exampleUrls: [
    { label: "All Templates for a Bot", url: "GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=" + DEFAULT_API_KEY + "&botId=bot_abc123" },
    { label: "Filter by Template Name", url: "GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=" + DEFAULT_API_KEY + "&botId=bot_abc123&templateName=Welcome" },
    { label: "Filter by Template Type", url: "GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=" + DEFAULT_API_KEY + "&botId=bot_abc123&templateType=RichCard" },
    { label: "Combined Filters", url: "GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=" + DEFAULT_API_KEY + "&botId=bot_abc123&templateName=promo&templateType=PlainText" }
  ],
  responseSchema: {
    commonFields: [
  [
    "BotId",
    "string",
    "Vendor-assigned Bot ID"
  ],
  [
    "BotName",
    "string",
    "Display name of the bot"
  ],
  [
    "TemplateName",
    "string",
    "Template name as registered locally"
  ],
  [
    "TemplateType",
    "string",
    "PlainText, RichCard, or Carousel"
  ],
  [
    "TemplateStatus",
    "string",
    "Active, Pending, or Rejected"
  ],
  [
    "TemplateId",
    "string",
    "Vendor-assigned template identifier (use this in CreateCampaign)"
  ],
  [
    "LocalTemplateId",
    "long",
    "Internal template ID stored in the system"
  ],
  [
    "CreatedDate",
    "string",
    "Local creation timestamp (yyyy-MM-dd HH:mm)"
  ],
  [
    "FailedDescription",
    "string",
    "Reason for failure / rejection (when applicable)"
  ],
  [
    "PlainText",
    "object",
    "Populated only for PlainText templates (otherwise null)"
  ],
  [
    "RichCard",
    "object",
    "Populated only for RichCard templates (otherwise null)"
  ],
  [
    "Carousel",
    "object",
    "Populated only for Carousel templates (otherwise null)"
  ]
],
    plainTextFields: [
  [
    "MessageText",
    "string",
    "The plain text message body"
  ],
  [
    "Suggestions",
    "array",
    "Root suggestion buttons (see Suggestion fields below)"
  ]
],
    richCardFields: [
  [
    "Title",
    "string",
    "Card title"
  ],
  [
    "Description",
    "string",
    "Card description"
  ],
  [
    "MediaType",
    "string",
    "IMAGE, VIDEO, or PDF"
  ],
  [
    "MediaHeight",
    "string",
    "SHORT or MEDIUM"
  ],
  [
    "Orientation",
    "string",
    "VERTICAL or HORIZONTAL"
  ],
  [
    "ImageUrl",
    "string",
    "Absolute URL of the image (when MediaType = IMAGE)"
  ],
  [
    "VideoUrl",
    "string",
    "Absolute URL of the video (when MediaType = VIDEO)"
  ],
  [
    "ThumbUrl",
    "string",
    "Absolute URL of the video thumbnail (when MediaType = VIDEO)"
  ],
  [
    "PdfUrl",
    "string",
    "Absolute URL of the PDF (when MediaType = PDF)"
  ],
  [
    "Suggestions",
    "array",
    "Root suggestion buttons for the card"
  ]
],
    carouselFields: [
  [
    "Cards",
    "array",
    "Array of carousel cards (each with Title, Description, MediaHeight, Orientation, ImageUrl, VideoUrl, and per-card Suggestions)"
  ]
],
    suggestionFields: [
  [
    "Label",
    "string",
    "Button display text"
  ],
  [
    "Type",
    "string",
    "OPEN_URL, REPLY/POSTBACK, or DIAL"
  ],
  [
    "Url",
    "string",
    "URL to open (for OPEN_URL type)"
  ],
  [
    "PostbackData",
    "string",
    "Postback payload (for REPLY/POSTBACK type)"
  ],
  [
    "PhoneNumber",
    "string",
    "Phone number to dial (for DIAL type)"
  ]
]
  },
  templateTypes: [
  [
    "PlainText",
    "Simple text message with suggestion buttons",
    "Basic notifications, confirmations"
  ],
  [
    "RichCard",
    "Rich media card with image/video and suggestions",
    "Product showcases, promotional campaigns"
  ],
  [
    "Carousel",
    "Multiple cards in swipeable carousel format",
    "Multi-product catalogs, step-by-step guides"
  ]
],
  templateStatuses: [
  [
    "Active",
    "Template approved by vendor and ready to use",
    "✓ Yes"
  ],
  [
    "Pending",
    "Template submitted, awaiting vendor approval",
    "✗ No"
  ],
  [
    "Rejected",
    "Template rejected by vendor",
    "✗ No"
  ]
],
  filterBehavior: [
    "botId (Required): Filters templates belonging to that specific bot only",
    "templateName (Optional): Performs case-insensitive substring search (e.g., 'welc' matches 'Welcome_Offer')",
    "templateType (Optional): Exact match on PlainText, RichCard, or Carousel",
    "status (Optional): Exact match on Active, Pending, or Rejected",
    "Combined: When multiple optional filters are provided, they are combined with AND logic"
  ],
  mixedExampleResponse: "GET https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=A58463AEB7AE41CD9901D23D18BC2482883&botId=bot_abc123&templateName=promo&templateType=PlainText",
  errorResponse: "{\n  \"Status\": \"OK\",\n  \"Response\": {\n    \"Templates\": [\n      {\n        \"BotId\": \"bot_abc123\",\n        \"BotName\": \"Marketing Bot\",\n        \"TemplateName\": \"Welcome_Msg\",\n        \"TemplateType\": \"PlainText\",\n        \"TemplateStatus\": \"Active\",\n        \"TemplateId\": \"vendor_tpl_xyz789\",\n        \"LocalTemplateId\": 10245,\n        \"CreatedDate\": \"2024-12-11 10:30\",\n        \"FailedDescription\": null,\n        \"PlainText\": {\n          \"MessageText\": \"Hello! Welcome to our service.\",\n          \"Suggestions\": [\n            {\n              \"Label\": \"Visit Site\",\n              \"Type\": \"OPEN_URL\",\n              \"Url\": \"https://www.mybrand.com\",\n              \"PostbackData\": null,\n              \"PhoneNumber\": null\n            },\n            {\n              \"Label\": \"Call Us\",\n              \"Type\": \"DIAL\",\n              \"Url\": null,\n              \"PostbackData\": null,\n              \"PhoneNumber\": \"+919876543210\"\n            }\n          ]\n        },\n        \"RichCard\": null,\n        \"Carousel\": null\n      },\n      {\n        \"BotId\": \"bot_abc123\",\n        \"BotName\": \"Marketing Bot\",\n        \"TemplateName\": \"Product_Card\",\n        \"TemplateType\": \"RichCard\",\n        \"TemplateStatus\": \"Active\",\n        \"TemplateId\": \"vendor_tpl_abc456\",\n        \"LocalTemplateId\": 10246,\n        \"CreatedDate\": \"2024-12-15 14:20\",\n        \"FailedDescription\": null,\n        \"PlainText\": null,\n        \"RichCard\": {\n          \"Title\": \"Summer Sale\",\n          \"Description\": \"50% off on all products!\",\n          \"MediaType\": \"IMAGE\",\n          \"MediaHeight\": \"MEDIUM\",\n          \"Orientation\": \"VERTICAL\",\n          \"ImageUrl\": \"https://yourdomain.com/Uploads/RCS/sale.jpg\",\n          \"VideoUrl\": null,\n          \"ThumbUrl\": null,\n          \"PdfUrl\": null,\n          \"Suggestions\": [\n            {\n              \"Label\": \"Shop Now\",\n              \"Type\": \"OPEN_URL\",\n              \"Url\": \"https://shop.mybrand.com/sale\",\n              \"PostbackData\": null,\n              \"PhoneNumber\": null\n            }\n          ]\n        },\n        \"Carousel\": null\n      },\n      {\n        \"BotId\": \"bot_abc123\",\n        \"BotName\": \"Marketing Bot\",\n        \"TemplateName\": \"Catalog_Cards\",\n        \"TemplateType\": \"Carousel\",\n        \"TemplateStatus\": \"Active\",\n        \"TemplateId\": \"vendor_tpl_car001\",\n        \"LocalTemplateId\": 10247,\n        \"CreatedDate\": \"2024-12-20 09:10\",\n        \"FailedDescription\": null,\n        \"PlainText\": null,\n        \"RichCard\": null,\n        \"Carousel\": {\n          \"Cards\": [\n            {\n              \"Title\": \"Product A\",\n              \"Description\": \"Premium product\",\n              \"MediaHeight\": \"MEDIUM\",\n              \"Orientation\": \"VERTICAL\",\n              \"ImageUrl\": \"https://yourdomain.com/Uploads/RCS/product_a.jpg\",\n              \"VideoUrl\": null,\n              \"Suggestions\": [\n                {\n                  \"Label\": \"Buy A\",\n                  \"Type\": \"OPEN_URL\",\n                  \"Url\": \"https://shop.mybrand.com/a\",\n                  \"PostbackData\": null,\n                  \"PhoneNumber\": null\n                }\n              ]\n            },\n            {\n              \"Title\": \"Product B\",\n              \"Description\": \"Best seller\",\n              \"MediaHeight\": \"MEDIUM\",\n              \"Orientation\": \"VERTICAL\",\n              \"ImageUrl\": \"https://yourdomain.com/Uploads/RCS/product_b.jpg\",\n              \"VideoUrl\": null,\n              \"Suggestions\": [\n                {\n                  \"Label\": \"Buy B\",\n                  \"Type\": \"OPEN_URL\",\n                  \"Url\": \"https://shop.mybrand.com/b\",\n                  \"PostbackData\": null,\n                  \"PhoneNumber\": null\n                }\n              ]\n            }\n          ]\n        }\n      }\n    ],\n    \"TotalCount\": 3\n  }\n}",
  curlExamples: [
    { label: "Get All Templates", cmd: "{\n                    \"Status\": \"WARNING\",\n                    \"Response\": {\n                    \"Message\": \"botId is required!\"\n  }\n}" },
    { label: "Filter by Name", cmd: "{\n                    \"Status\": \"WARNING\",\n                    \"Response\": {\n                    \"Message\": \"Invalid API Key!\"\n  }\n}" },
    { label: "Filter by Type", cmd: "{\n                    \"Status\": \"OK\",\n                    \"Response\": {\n                    \"Templates\": [],\n                    \"TotalCount\": 0\n  }\n}" },
    { label: "Filter by Status", cmd: "curl -X GET \"https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=A58463AEB7AE41CD9901D23D18BC2482883&botId=bot_abc123\"" },
    { label: "Combined Filters", cmd: "curl -X GET \"https://omnidigital.co.in/api/RCSApi/GetTemplates?apiKey=A58463AEB7AE41CD9901D23D18BC2482883&botId=bot_abc123&templateName=Welcome\"" }
  ],
  useCases: [
    "Pre-campaign Verification: Check that the template is Active before calling CreateCampaign",
    "Template Discovery: List all available templates for a bot to display in your UI dropdown",
    "Type-Specific Retrieval: Fetch only RichCard templates for a marketing workflow",
    "Status Polling: Check if a newly submitted template has been approved (status changed from Pending to Active)"
  ]
};

export const GET_BOTS_DOC = {
  endpoint: "/GetBots",
  method: "GET",
  description: "Retrieves all RCS bots associated with the authenticated account. Use the returned BotId values when calling GetTemplates or CreateBot.",
  queryParams: [
  [
    "apiKey",
    "string",
    "Required",
    "Your API authentication key"
  ]
],
  requestUrl: "GET https://omnidigital.co.in/api/RCSApi/GetBots?apiKey=" + DEFAULT_API_KEY,
  response: "{\n                    \"Status\": \"OK\",\n                    \"Response\": {\n                    \"Bots\": [\n      {\n                    \"BotId\": \"bot_abc123\",\n                    \"BotName\": \"Marketing Bot\"\n      },\n      {\n                    \"BotId\": \"bot_def456\",\n                    \"BotName\": \"Support Bot\"\n      }\n    ]\n  }\n}",
  curl: "curl -X GET \"https://omnidigital.co.in/api/RCSApi/GetBots?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\""
};

export const CREATE_BOT_DOC = {
  endpoint: "/CreateBot",
  method: "POST",
  description: "Registers a new RCS bot for the authenticated account. Once submitted, the bot undergoes an approval process before it can be used.",
  requestUrl: "POST https://omnidigital.co.in/api/RCSApi/CreateBot?apiKey=" + DEFAULT_API_KEY,
  headers: { "Content-Type": "application/json" },
  parameters: [
  [
    "name",
    "string",
    "Required",
    "Bot display name (max 100 characters)"
  ],
  [
    "bot_type",
    "string",
    "Required",
    "Type of bot (e.g., A2P, P2A)"
  ],
  [
    "brandname",
    "string",
    "Required",
    "Brand name associated with the bot"
  ],
  [
    "desc",
    "string",
    "Required",
    "Brief description of the bot and its purpose"
  ],
  [
    "number",
    "string[]",
    "Required",
    "Array of contact phone numbers (at least one required)"
  ],
  [
    "plab",
    "string[]",
    "Optional",
    "Labels for phone numbers. Count must match number array length"
  ],
  [
    "email",
    "string[]",
    "Required",
    "Array of contact email addresses (at least one required)"
  ],
  [
    "elab",
    "string[]",
    "Optional",
    "Labels for email addresses. Count must match email array length"
  ],
  [
    "website",
    "string[]",
    "Optional",
    "Array of website URLs"
  ],
  [
    "wlab",
    "string[]",
    "Optional",
    "Labels for websites. Count must match website array length"
  ],
  [
    "terms_url",
    "string",
    "Optional",
    "Terms & Conditions page URL (must be valid absolute URL)"
  ],
  [
    "privacy_url",
    "string",
    "Optional",
    "Privacy Policy page URL (must be valid absolute URL)"
  ],
  [
    "message_type",
    "string",
    "Required",
    "Message type (e.g., Transactional, Promotional)"
  ],
  [
    "logoimageurlrcs",
    "string",
    "Required",
    "Publicly accessible URL for bot logo image (must be valid absolute URL)"
  ],
  [
    "bannerimageurlrcs",
    "string",
    "Optional",
    "Publicly accessible URL for bot banner image (must be valid absolute URL if provided)"
  ],
  [
    "colorCode",
    "string",
    "Optional",
    "Brand color in hex format (e.g., #FF5733). Must match pattern #RGB or #RRGGBB"
  ],
  [
    "development_platform",
    "string",
    "Optional",
    "Development platform (e.g., Android, iOS, Web)"
  ],
  [
    "languages_supported",
    "string",
    "Optional",
    "Comma-separated languages (e.g., English, Hindi,English)"
  ],
  [
    "otherCarriercheck",
    "string",
    "Optional",
    "Enable other carrier check: \"true\" or \"false\" (default: \"false\")"
  ],
  [
    "extra_details",
    "object",
    "Required",
    "Contact person and document details (see nested fields below)"
  ]
],
  extraDetailsFields: [
  [
    "fullname",
    "string",
    "Required",
    "Full name of the contact person"
  ],
  [
    "designation",
    "string",
    "Required",
    "Designation / job title of the contact person"
  ],
  [
    "emailid",
    "string",
    "Required",
    "Email address of the contact person"
  ],
  [
    "mobile",
    "string",
    "Required",
    "Mobile number of the contact person"
  ],
  [
    "gst",
    "string",
    "Optional",
    "Publicly accessible URL for GST certificate (PDF). Must be valid absolute URL if provided"
  ],
  [
    "pan",
    "string",
    "Optional",
    "Publicly accessible URL for PAN certificate (PDF). Must be valid absolute URL if provided"
  ],
  [
    "logo",
    "string",
    "Optional",
    "Publicly accessible URL for additional company logo. Must be valid absolute URL if provided"
  ],
  [
    "subaggregator",
    "string",
    "Optional",
    "Sub-aggregator name (if applicable)"
  ]
],
  validations: [
    "name: 1-50 characters, alphanumeric + spaces/hyphens/underscores",
    "bot_type: Must be 'Transactional' or 'Promotional'",
    "brandname: 1-100 characters, legal brand name",
    "desc: 1-500 characters, business description",
    "number: 10-digit Indian phone number (or international format with country code)",
    "email: Valid email address",
    "website, terms_url, privacy_url: Must be valid HTTP/HTTPS URLs",
    "logoimageurlrcs: Must be a valid HTTPS image URL (square, recommended 512x512, PNG/JPEG, max 2MB)",
    "bannerimageurlrcs: Must be a valid HTTPS image URL (landscape, recommended 1024x512, PNG/JPEG, max 2MB)",
    "colorCode: Hex color code (e.g., #007bff, #FF5722)",
    "GST / PAN: Valid Indian tax identifiers if provided"
  ],
  minimalExample: "{\n  \"name\": \"MyBrandBot\",\n  \"bot_type\": \"A2P\",\n  \"brandname\": \"MyBrand Pvt Ltd\",\n  \"desc\": \"Official RCS bot for MyBrand notifications\",\n  \"number\": [\"9876543210\"],\n  \"plab\": [\"Main\"],\n  \"email\": [\"support@mybrand.com\"],\n  \"elab\": [\"Support\"],\n  \"message_type\": \"Transactional\",\n  \"logoimageurlrcs\": \"https://cdn.mybrand.com/logo.png\",\n  \"extra_details\": {\n    \"fullname\": \"Vijay Kumar\",\n    \"designation\": \"IT Manager\",\n    \"emailid\": \"vijay@mybrand.com\",\n    \"mobile\": \"9876543210\"\n  }\n}",
  fullExample: "{\n  \"name\": \"MyBrandBot\",\n  \"bot_type\": \"A2P\",\n  \"brandname\": \"MyBrand Pvt Ltd\",\n  \"desc\": \"Official RCS bot for MyBrand transactional and promotional messages\",\n  \"number\": [\"9876543210\", \"9123456789\"],\n  \"plab\": [\"Main Office\", \"Support\"],\n  \"email\": [\"info@mybrand.com\", \"support@mybrand.com\"],\n  \"elab\": [\"General\", \"Support\"],\n  \"website\": [\"https://www.mybrand.com\", \"https://shop.mybrand.com\"],\n  \"wlab\": [\"Official Site\", \"Online Store\"],\n  \"terms_url\": \"https://www.mybrand.com/terms\",\n  \"privacy_url\": \"https://www.mybrand.com/privacy\",\n  \"message_type\": \"Transactional\",\n  \"logoimageurlrcs\": \"https://cdn.mybrand.com/rcs/logo.png\",\n  \"bannerimageurlrcs\": \"https://cdn.mybrand.com/rcs/banner.jpg\",\n  \"colorCode\": \"#FF5733\",\n  \"development_platform\": \"Android\",\n  \"languages_supported\": \"English,Hindi\",\n  \"otherCarriercheck\": \"true\",\n  \"extra_details\": {\n    \"fullname\": \"Vijay Kumar\",\n    \"designation\": \"IT Manager\",\n    \"emailid\": \"vijay@mybrand.com\",\n    \"mobile\": \"9876543210\",\n    \"gst\": \"https://cdn.mybrand.com/docs/gst_certificate.pdf\",\n    \"pan\": \"https://cdn.mybrand.com/docs/pan_certificate.pdf\",\n    \"logo\": \"https://cdn.mybrand.com/docs/company_logo.png\",\n    \"subaggregator\": \"SubAggName\"\n  }\n}",
  responses: {
    success: "{\n  \"Status\": \"OK\",\n  \"Response\": {\n    \"Message\": \"RCS Bot created successfully! Admin will review and submit to vendor.\",\n    \"BotId\": 1234\n  }\n}",
    duplicateError: "{\n  \"Status\": \"WARNING\",\n  \"Response\": {\n    \"Message\": \"Bot name is required!\"\n  }\n}",
    validationError: "{\n  \"Status\": \"WARNING\",\n  \"Response\": {\n    \"Message\": \"Failed to save RCS Bot details. Please try again.\"\n  }\n}"
  },
  validationMessages: [
  [
    "name",
    "Bot name is required!"
  ],
  [
    "name",
    "Bot name must not exceed 100 characters!"
  ],
  [
    "bot_type",
    "Bot type is required!"
  ],
  [
    "brandname",
    "Brand name is required!"
  ],
  [
    "desc",
    "Description is required!"
  ],
  [
    "number",
    "At least one contact number is required!"
  ],
  [
    "plab",
    "Phone labels count must match phone numbers count!"
  ],
  [
    "email",
    "At least one email is required!"
  ],
  [
    "elab",
    "Email labels count must match email addresses count!"
  ],
  [
    "wlab",
    "Website labels count must match website URLs count!"
  ],
  [
    "terms_url",
    "Invalid terms URL format! Must be a valid absolute URL."
  ],
  [
    "privacy_url",
    "Invalid privacy URL format! Must be a valid absolute URL."
  ],
  [
    "logoimageurlrcs",
    "Logo image URL is required!"
  ],
  [
    "logoimageurlrcs",
    "Invalid logo image URL format! Must be a valid absolute URL."
  ],
  [
    "bannerimageurlrcs",
    "Invalid banner image URL format! Must be a valid absolute URL."
  ],
  [
    "message_type",
    "Message type is required!"
  ],
  [
    "colorCode",
    "Invalid color code! Must be a valid hex color (e.g., #FF5733)."
  ],
  [
    "extra_details",
    "extra_details object is required!"
  ],
  [
    "extra_details.fullname",
    "Contact full name is required in extra_details!"
  ],
  [
    "extra_details.designation",
    "Contact designation is required in extra_details!"
  ],
  [
    "extra_details.emailid",
    "Contact email is required in extra_details!"
  ],
  [
    "extra_details.mobile",
    "Contact mobile is required in extra_details!"
  ],
  [
    "extra_details.gst",
    "Invalid GST document URL format! Must be a valid absolute URL."
  ],
  [
    "extra_details.pan",
    "Invalid PAN document URL format! Must be a valid absolute URL."
  ],
  [
    "extra_details.logo",
    "Invalid additional logo URL format! Must be a valid absolute URL."
  ]
],
  curl: "curl -X POST \"https://omnidigital.co.in/api/RCSApi/CreateBot?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"MyBrandBot\",\n    \"bot_type\": \"A2P\",\n    \"brandname\": \"MyBrand Pvt Ltd\",\n    \"desc\": \"Official RCS bot for MyBrand notifications\",\n    \"number\": [\"9876543210\"],\n    \"plab\": [\"Main\"],\n    \"email\": [\"support@mybrand.com\"],\n    \"elab\": [\"Support\"],\n    \"message_type\": \"Transactional\",\n    \"logoimageurlrcs\": \"https://cdn.mybrand.com/logo.png\",\n    \"colorCode\": \"#FF5733\",\n    \"extra_details\": {\n      \"fullname\": \"Vijay Kumar\",\n      \"designation\": \"IT Manager\",\n      \"emailid\": \"vijay@mybrand.com\",\n      \"mobile\": \"9876543210\",\n      \"gst\": \"https://cdn.mybrand.com/docs/gst.pdf\",\n      \"pan\": \"https://cdn.mybrand.com/docs/pan.pdf\"\n    }\n  }'"
};

export const CREATE_TEMPLATE_DOC = {
  endpoint: "/CreateTemplate",
  method: "POST",
  description: "Creates a new RCS template (PlainText, RichCard, or Carousel) with optional suggestion buttons. Templates are submitted for vendor approval before they can be used in campaigns.",
  requestUrl: "POST https://omnidigital.co.in/api/RCSApi/CreateTemplate?apiKey=" + DEFAULT_API_KEY,
  headers: { "Content-Type": "application/json" },
  commonParameters: [
  [
    "TemplateType",
    "string",
    "Required",
    "Template type: PlainText, RichCard, or Carousel"
  ],
  [
    "BotId",
    "string",
    "Required",
    "Vendor-assigned Bot ID (from GetBots endpoint)"
  ],
  [
    "TemplateName",
    "string",
    "Required",
    "Template name (1-20 chars, alphanumeric and underscores only). Pattern: ^[A-Za-z0-9_]{1,20}$"
  ],
  [
    "PlainText",
    "object",
    "Conditional",
    "Required when TemplateType is PlainText. See PlainText fields below."
  ],
  [
    "RichCard",
    "object",
    "Conditional",
    "Required when TemplateType is RichCard. See RichCard fields below."
  ],
  [
    "Cards",
    "array",
    "Conditional",
    "Required when TemplateType is Carousel. Array of card objects (min 2, max 10)."
  ],
  [
    "Suggestions",
    "array",
    "Optional",
    "Suggestion buttons for PlainText and RichCard templates. See Suggestion fields below."
  ]
],
  plainTextFields: [
  [
    "MessageText",
    "string",
    "Required",
    "The plain text message content for the template"
  ]
],
  richCardFields: [
  [
    "Title",
    "string",
    "Required",
    "Card title text"
  ],
  [
    "Description",
    "string",
    "Required",
    "Card description text"
  ],
  [
    "MediaType",
    "string",
    "Required",
    "Type of media: IMAGE, VIDEO, or PDF"
  ],
  [
    "MediaHeight",
    "string",
    "Optional",
    "Media display height: SHORT or MEDIUM (default: MEDIUM)"
  ],
  [
    "Orientation",
    "string",
    "Optional",
    "Card orientation: VERTICAL or HORIZONTAL (default: VERTICAL)"
  ],
  [
    "ImageUrl",
    "string",
    "Conditional",
    "Publicly accessible URL for image file. Required when MediaType is IMAGE."
  ],
  [
    "VideoUrl",
    "string",
    "Conditional",
    "Publicly accessible URL for video file. Required when MediaType is VIDEO."
  ],
  [
    "ThumbnailUrl",
    "string",
    "Conditional",
    "Publicly accessible URL for video thumbnail image. Required when MediaType is VIDEO."
  ],
  [
    "PdfUrl",
    "string",
    "Conditional",
    "Publicly accessible URL for PDF file. Required when MediaType is PDF."
  ]
],
  carouselCardFields: [
  [
    "Title",
    "string",
    "Required",
    "Card title text"
  ],
  [
    "Description",
    "string",
    "Optional",
    "Card description text"
  ],
  [
    "MediaHeight",
    "string",
    "Optional",
    "Media display height: SHORT or MEDIUM (default: MEDIUM)"
  ],
  [
    "Orientation",
    "string",
    "Optional",
    "Card orientation: VERTICAL or HORIZONTAL (default: VERTICAL)"
  ],
  [
    "ImageUrl",
    "string",
    "Optional",
    "Publicly accessible URL for card image"
  ],
  [
    "VideoUrl",
    "string",
    "Optional",
    "Publicly accessible URL for card video"
  ],
  [
    "ThumbnailUrl",
    "string",
    "Optional",
    "Publicly accessible URL for card video thumbnail"
  ],
  [
    "Suggestions",
    "array",
    "Optional",
    "Per-card suggestion buttons (same structure as root Suggestions)"
  ]
],
  suggestionFields: [
  [
    "Label",
    "string",
    "Required",
    "Button display label text"
  ],
  [
    "Type",
    "string",
    "Required",
    "Suggestion type: OPEN_URL, REPLY, or DIAL"
  ],
  [
    "Url",
    "string",
    "Conditional",
    "URL to open. Required when Type is OPEN_URL. Must be a valid absolute URL."
  ],
  [
    "PostbackData",
    "string",
    "Conditional",
    "Postback data string. Required when Type is REPLY."
  ],
  [
    "PhoneNumber",
    "string",
    "Conditional",
    "Phone number to dial. Required when Type is DIAL."
  ]
],
  suggestionTypes: [
  [
    "OPEN_URL",
    "Opens a URL in the user's browser when tapped",
    "Url — must be a valid absolute URL"
  ],
  [
    "REPLY",
    "Sends a quick reply message back to the bot",
    "PostbackData — reply text string"
  ],
  [
    "DIAL",
    "Opens the phone dialer with the specified number",
    "PhoneNumber — phone number string"
  ]
],
  validations: [
    "TemplateType: Must be 'PlainText', 'RichCard', or 'Carousel'",
    "BotId: Must be a valid bot belonging to your account",
    "TemplateName: 1-20 characters, alphanumeric and underscore only (regex: ^[A-Za-z0-9_]{1,20}$)",
    "PlainText.MessageText: 1-2000 characters. Supports variables like {#var#}",
    "RichCard: CardTitle (max 200 chars), CardDescription (max 2000 chars). At least one of title, description, or media is required",
    "MediaUrl: Must be a valid HTTPS URL pointing to an image or video file",
    "MediaType: 'IMAGE' or 'VIDEO'. MediaHeight: 'SHORT_HEIGHT', 'MEDIUM_HEIGHT', or 'TALL_HEIGHT'",
    "Cards (Carousel): Array of 2 to 10 card objects",
    "Suggestions: Max 4 suggestions per template (PlainText / RichCard) or per card (Carousel)",
    "Action in RichCard: Can be 'OPEN_URL' with ActionValue set to a valid URL"
  ],
  examples: {
    plainText: "{\n  \"TemplateType\": \"PlainText\",\n  \"BotId\": \"bot_abc123\",\n  \"TemplateName\": \"Welcome_Msg\",\n  \"PlainText\": {\n    \"MessageText\": \"Hello! Welcome to our service. How can we help you today?\"\n  },\n  \"Suggestions\": [\n    {\n      \"Label\": \"Visit Website\",\n      \"Type\": \"OPEN_URL\",\n      \"Url\": \"https://www.mybrand.com\"\n    },\n    {\n      \"Label\": \"Talk to Support\",\n      \"Type\": \"DIAL\",\n      \"PhoneNumber\": \"+919876543210\"\n    },\n    {\n      \"Label\": \"Know More\",\n      \"Type\": \"REPLY\",\n      \"PostbackData\": \"know_more_clicked\"\n    }\n  ]\n}",
    richCardImage: "{\n  \"TemplateType\": \"RichCard\",\n  \"BotId\": \"bot_abc123\",\n  \"TemplateName\": \"Product_Promo\",\n  \"RichCard\": {\n    \"Title\": \"Summer Sale 2024\",\n    \"Description\": \"Get up to 50% off on all products. Limited time offer!\",\n    \"MediaType\": \"IMAGE\",\n    \"MediaHeight\": \"MEDIUM\",\n    \"Orientation\": \"VERTICAL\",\n    \"ImageUrl\": \"https://cdn.mybrand.com/images/summer_sale.jpg\"\n  },\n  \"Suggestions\": [\n    {\n      \"Label\": \"Shop Now\",\n      \"Type\": \"OPEN_URL\",\n      \"Url\": \"https://shop.mybrand.com/sale\"\n    },\n    {\n      \"Label\": \"Remind Later\",\n      \"Type\": \"REPLY\",\n      \"PostbackData\": \"remind_later\"\n    }\n  ]\n}",
    richCardVideo: "{\n  \"TemplateType\": \"RichCard\",\n  \"BotId\": \"bot_abc123\",\n  \"TemplateName\": \"Video_Demo\",\n  \"RichCard\": {\n    \"Title\": \"Product Demo Video\",\n    \"Description\": \"Watch our product in action!\",\n    \"MediaType\": \"VIDEO\",\n    \"MediaHeight\": \"MEDIUM\",\n    \"Orientation\": \"VERTICAL\",\n    \"VideoUrl\": \"https://cdn.mybrand.com/videos/demo.mp4\",\n    \"ThumbnailUrl\": \"https://cdn.mybrand.com/images/demo_thumb.jpg\"\n  },\n  \"Suggestions\": [\n    {\n      \"Label\": \"Buy Now\",\n      \"Type\": \"OPEN_URL\",\n      \"Url\": \"https://shop.mybrand.com/product\"\n    }\n  ]\n}",
    carousel: "{\n  \"TemplateType\": \"Carousel\",\n  \"BotId\": \"bot_abc123\",\n  \"TemplateName\": \"Product_Catalog\",\n  \"Cards\": [\n    {\n      \"Title\": \"Product A\",\n      \"Description\": \"Premium quality product with great features\",\n      \"MediaHeight\": \"MEDIUM\",\n      \"Orientation\": \"VERTICAL\",\n      \"ImageUrl\": \"https://cdn.mybrand.com/images/product_a.jpg\",\n      \"Suggestions\": [\n        {\n          \"Label\": \"Buy Product A\",\n          \"Type\": \"OPEN_URL\",\n          \"Url\": \"https://shop.mybrand.com/product-a\"\n        },\n        {\n          \"Label\": \"Details\",\n          \"Type\": \"REPLY\",\n          \"PostbackData\": \"product_a_details\"\n        }\n      ]\n    },\n    {\n      \"Title\": \"Product B\",\n      \"Description\": \"Best seller with amazing reviews\",\n      \"MediaHeight\": \"MEDIUM\",\n      \"Orientation\": \"VERTICAL\",\n      \"ImageUrl\": \"https://cdn.mybrand.com/images/product_b.jpg\",\n      \"Suggestions\": [\n        {\n          \"Label\": \"Buy Product B\",\n          \"Type\": \"OPEN_URL\",\n          \"Url\": \"https://shop.mybrand.com/product-b\"\n        },\n        {\n          \"Label\": \"Call Us\",\n          \"Type\": \"DIAL\",\n          \"PhoneNumber\": \"+919876543210\"\n        }\n      ]\n    },\n    {\n      \"Title\": \"Product C\",\n      \"Description\": \"New arrival — limited edition\",\n      \"MediaHeight\": \"MEDIUM\",\n      \"Orientation\": \"VERTICAL\",\n      \"ImageUrl\": \"https://cdn.mybrand.com/images/product_c.jpg\",\n      \"Suggestions\": [\n        {\n          \"Label\": \"Buy Product C\",\n          \"Type\": \"OPEN_URL\",\n          \"Url\": \"https://shop.mybrand.com/product-c\"\n        }\n      ]\n    }\n  ]\n}"
  },
  responses: {
    success: "{\n  \"Status\": \"OK\",\n  \"Response\": {\n    \"Message\": \"Template created successfully!\",\n    \"TemplateId\": \"vendor_tpl_xyz789\",\n    \"TemplateName\": \"Welcome_Msg\",\n    \"TemplateType\": \"PlainText\"\n  }\n}",
    validationError: "{\n  \"Status\": \"WARNING\",\n  \"Response\": {\n    \"Message\": \"TemplateType is required! Allowed values: PlainText, RichCard, Carousel.\"\n  }\n}",
    duplicateError: "{\n  \"Status\": \"WARNING\",\n  \"Response\": {\n    \"Message\": \"Template name already exists for this bot!\"\n  }\n}"
  },
  validationMessages: [
  [
    "TemplateType",
    "TemplateType is required! Allowed values: PlainText, RichCard, Carousel."
  ],
  [
    "TemplateType",
    "Invalid TemplateType! Allowed values: PlainText, RichCard, Carousel."
  ],
  [
    "BotId",
    "BotId is required!"
  ],
  [
    "BotId",
    "Bot not found! Please provide a valid BotId from GetBots endpoint."
  ],
  [
    "TemplateName",
    "TemplateName is required!"
  ],
  [
    "TemplateName",
    "Invalid TemplateName! Must be alphanumeric or underscore (1-20 chars)."
  ],
  [
    "TemplateName",
    "Template name already exists for this bot!"
  ],
  [
    "PlainText.MessageText",
    "PlainText.MessageText is required for PlainText template!"
  ],
  [
    "RichCard",
    "RichCard object is required for RichCard template!"
  ],
  [
    "RichCard.Title",
    "RichCard.Title is required!"
  ],
  [
    "RichCard.Description",
    "RichCard.Description is required!"
  ],
  [
    "RichCard.MediaType",
    "RichCard.MediaType is required! Allowed values: IMAGE, VIDEO, PDF."
  ],
  [
    "RichCard.ImageUrl",
    "RichCard.ImageUrl is required when MediaType is IMAGE!"
  ],
  [
    "RichCard.VideoUrl",
    "RichCard.VideoUrl is required when MediaType is VIDEO!"
  ],
  [
    "RichCard.ThumbnailUrl",
    "RichCard.ThumbnailUrl is required when MediaType is VIDEO!"
  ],
  [
    "RichCard.PdfUrl",
    "RichCard.PdfUrl is required when MediaType is PDF!"
  ],
  [
    "RichCard.*Url",
    "Invalid URL format! Must be a valid absolute URL."
  ],
  [
    "Cards",
    "Cards array is required for Carousel template! Minimum 2 cards required."
  ],
  [
    "Cards",
    "Carousel template requires at least 2 cards!"
  ],
  [
    "Cards",
    "Carousel template allows maximum 10 cards!"
  ],
  [
    "Cards[n].Title",
    "Cards[n].Title is required!"
  ],
  [
    "Cards[n].*Url",
    "Invalid Cards[n].*Url! Must be a valid absolute URL."
  ],
  [
    "Suggestions[n].Label",
    "Suggestions[n].Label is required!"
  ],
  [
    "Suggestions[n].Type",
    "Suggestions[n].Type is required! Allowed: OPEN_URL, REPLY, DIAL."
  ],
  [
    "Suggestions[n].Url",
    "Suggestions[n].Url is required when Type is OPEN_URL!"
  ],
  [
    "Suggestions[n].PostbackData",
    "Suggestions[n].PostbackData is required when Type is REPLY!"
  ],
  [
    "Suggestions[n].PhoneNumber",
    "Suggestions[n].PhoneNumber is required when Type is DIAL!"
  ]
],
  curlExamples: [
    { label: "Create PlainText Template", cmd: "{\n  \"Status\": \"WARNING\",\n  \"Response\": {\n    \"Message\": \"Vendor did not return a template ID. Template creation may have failed.\"\n  }\n}" },
    { label: "Create RichCard Template", cmd: "{\n  \"Status\": \"ERROR\",\n  \"Response\": {\n    \"Message\": \"An error occurred while processing the request: {details}\"\n  }\n}" },
    { label: "Create Carousel Template", cmd: "curl -X POST \"https://omnidigital.co.in/api/RCSApi/CreateTemplate?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"TemplateType\": \"PlainText\",\n    \"BotId\": \"bot_abc123\",\n    \"TemplateName\": \"Welcome_Msg\",\n    \"PlainText\": {\n      \"MessageText\": \"Hello! Welcome to our service.\"\n    },\n    \"Suggestions\": [\n      { \"Label\": \"Visit Site\", \"Type\": \"OPEN_URL\", \"Url\": \"https://www.mybrand.com\" }\n    ]\n  }'" }
  ]
};

export const SEND_CHAT_MESSAGE_DOC = {
  endpoint: "/SendChatMessage",
  method: "POST",
  description: "Sends a 1-to-1 conversational RCS text message to a single recipient. Supports two-way communication workflows and automatic STOP suppression rules.",
  requestUrl: "POST https://omnidigital.co.in/api/RCSApi/SendChatMessage?apiKey=" + DEFAULT_API_KEY,
  headers: { "Content-Type": "application/json" },
  queryParams: [
  [
    "apiKey",
    "string",
    "Required",
    "Your API authentication key"
  ]
],
  bodyParams: [
  [
    "BotId",
    "string",
    "Required",
    "Vendor-assigned Bot ID (from GetBots endpoint)"
  ],
  [
    "MobileNo",
    "string",
    "Required",
    "Destination mobile number (10 digits; country code is trimmed automatically)"
  ],
  [
    "MessageText",
    "string",
    "Required",
    "Plain text message to be delivered to the user"
  ]
],
  statusMessagesTable: [
  [
    "WARNING",
    "Invalid API Key!"
  ],
  [
    "WARNING",
    "BotId is required! / MobileNo is required! / MessageText is required!"
  ],
  [
    "WARNING",
    "Invalid MobileNo!"
  ],
  [
    "WARNING",
    "Bot not found or does not belong to this customer!"
  ],
  [
    "ERROR",
    "Failed to send chat message."
  ]
],
  exampleBody: "{\n  \"BotId\": \"bot_abc123\",\n  \"MobileNo\": \"9876543210\",\n  \"MessageText\": \"Thanks for reaching out! How can we help you today?\"\n}",
  responses: {
    success: "{\n  \"Status\": \"OK\",\n  \"Response\": {\n    \"Message\": \"Message sent successfully.\",\n    \"ChatMessageId\": 10245,\n    \"VendorMessageId\": \"msg_9f2c81\",\n    \"Status\": \"SENT\"\n  }\n}",
    error: "curl -X POST \"https://omnidigital.co.in/api/RCSApi/SendChatMessage?apiKey=A58463AEB7AE41CD9901D23D18BC2482883\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"BotId\": \"bot_abc123\",\n    \"MobileNo\": \"9876543210\",\n    \"MessageText\": \"Thanks for reaching out! How can we help you today?\"\n  }'"
  },
  curl: ""
};

export const WEBHOOK_PAYLOADS_DOC = {
  description: "Configure webhook URLs in your account to receive real-time Delivery Reports (DLR) and user Engagement events.",
  dlrFields: [
  [
    "campaignId",
    "long",
    "The RCS campaign ID from RcsCampaign table"
  ],
  [
    "botId",
    "string",
    "The RCS bot/agent identifier"
  ],
  [
    "entityType",
    "string",
    "STATUS_EVENT or USER_EVENT"
  ],
  [
    "event_type",
    "string",
    "Event status: DELIVERED, READ, SENT, FAILED, NONRCS, UNDELIVERED, REJECTED, EXPIRED, etc."
  ],
  [
    "mobile",
    "string",
    "10-digit mobile number (country code removed)"
  ],
  [
    "status",
    "string",
    "Same as event_type"
  ],
  [
    "error_code",
    "string",
    "Vendor-specific error code (null on success)"
  ],
  [
    "error_message",
    "string",
    "Human-readable error description (null on success)"
  ],
  [
    "timestamp",
    "string",
    "UTC timestamp in ISO 8601 format (yyyy-MM-ddTHH:mm:ss.fffZ)"
  ]
],
  dlrExamples: [
    { title: "Successful Delivery", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"DELIVERED\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"DELIVERED\",\n  \"error_code\": null,\n  \"error_message\": null,\n  \"timestamp\": \"2025-07-15T10:30:45.123Z\"\n}" },
    { title: "Message Read", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"READ\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"READ\",\n  \"error_code\": null,\n  \"error_message\": null,\n  \"timestamp\": \"2025-07-15T10:35:12.456Z\"\n}" },
    { title: "Message Sent", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"SENT\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"SENT\",\n  \"error_code\": null,\n  \"error_message\": null,\n  \"timestamp\": \"2025-07-15T10:29:01.789Z\"\n}" },
    { title: "Failed Delivery (408 Timeout)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"FAILED\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"FAILED\",\n  \"error_code\": \"408\",\n  \"error_message\": \"Message delivery timed out\",\n  \"timestamp\": \"2025-07-15T10:32:00.321Z\"\n}" },
    { title: "Non-RCS User (Fallback Triggered)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"NONRCS\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"NONRCS\",\n  \"error_code\": \"NONRCS\",\n  \"error_message\": \"User does not support RCS messaging\",\n  \"timestamp\": \"2025-07-15T10:28:15.654Z\"\n}" },
    { title: "Message Expired", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"EXPIRED\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"EXPIRED\",\n  \"error_code\": null,\n  \"error_message\": \"TTL expired before delivery\",\n  \"timestamp\": \"2025-07-15T11:30:45.987Z\"\n}" },
    { title: "Message Rejected (403)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"REJECTED\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"REJECTED\",\n  \"error_code\": \"403\",\n  \"error_message\": \"Message rejected by carrier\",\n  \"timestamp\": \"2025-07-15T10:29:33.111Z\"\n}" },
    { title: "Undelivered (500 Error)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"entityType\": \"STATUS_EVENT\",\n  \"event_type\": \"UNDELIVERED\",\n  \"mobile\": \"9876543210\",\n  \"status\": \"UNDELIVERED\",\n  \"error_code\": \"500\",\n  \"error_message\": \"Internal delivery failure\",\n  \"timestamp\": \"2025-07-15T10:31:22.222Z\"\n}" }
  ],
  engagementFields: [
  [
    "campaignId",
    "long",
    "The RCS campaign ID"
  ],
  [
    "botId",
    "string",
    "The RCS bot/agent identifier"
  ],
  [
    "engagementType",
    "string",
    "REPLY (text response) or MEDIA (image/video/audio/document)"
  ],
  [
    "mobile",
    "string",
    "10-digit mobile number"
  ],
  [
    "response",
    "string",
    "User's reply text (truncated to 450 chars max)"
  ],
  [
    "timestamp",
    "string",
    "UTC timestamp in ISO 8601 format (yyyy-MM-ddTHH:mm:ss.fffZ)"
  ]
],
  engagementExamples: [
    { title: "Text Reply", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"engagementType\": \"REPLY\",\n  \"mobile\": \"9876543210\",\n  \"response\": \"Yes, I am interested\",\n  \"timestamp\": \"2025-07-15T10:45:30.555Z\"\n}" },
    { title: "STOP (Unsubscribe)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"engagementType\": \"REPLY\",\n  \"mobile\": \"9876543210\",\n  \"response\": \"STOP\",\n  \"timestamp\": \"2025-07-15T10:46:00.666Z\"\n}" },
    { title: "START (Re-subscribe)", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"engagementType\": \"REPLY\",\n  \"mobile\": \"9876543210\",\n  \"response\": \"START\",\n  \"timestamp\": \"2025-07-15T10:47:00.777Z\"\n}" },
    { title: "Media Response", payload: "{\n  \"campaignId\": 104523,\n  \"botId\": \"bot_trustsignal_001\",\n  \"engagementType\": \"MEDIA\",\n  \"mobile\": \"9876543210\",\n  \"response\": \"image_upload_data_here\",\n  \"timestamp\": \"2025-07-15T10:48:15.888Z\"\n}" }
  ],
  allDlrEventTypes: [
  [
    "DELIVERED",
    "Message delivered to user's device",
    "✗ No"
  ],
  [
    "READ",
    "Message opened/read by user",
    "✗ No"
  ],
  [
    "SENT",
    "Message sent to vendor/carrier",
    "✗ No"
  ],
  [
    "FAILED",
    "Message delivery failed",
    "✓ Yes"
  ],
  [
    "NONRCS",
    "User does not support RCS messaging",
    "✓ Yes"
  ],
  [
    "EXPIRED",
    "TTL expired before delivery",
    "✓ Yes"
  ],
  [
    "REJECTED",
    "Message rejected by carrier",
    "✓ Yes"
  ],
  [
    "UNDELIVERED",
    "Message could not be delivered",
    "✓ Yes"
  ],
  [
    "MESSAGE_FAILED",
    "Vendor-level message failure",
    "✓ Yes"
  ],
  [
    "MESSAGE_UNDELIVERED",
    "Vendor-level undelivered status",
    "✓ Yes"
  ],
  [
    "MESSAGE_REJECTED",
    "Vendor-level rejection",
    "✓ Yes"
  ],
  [
    "MESSAGE_EXPIRED",
    "Vendor-level TTL expiry",
    "✓ Yes"
  ],
  [
    "SEND_MESSAGE_FAILURE",
    "Failed to send message to vendor",
    "✓ Yes"
  ],
  [
    "TTL_EXPIRATION_REVOKE_FAILED",
    "TTL expiry revoke operation failed",
    "✓ Yes"
  ]
],
  integrationNotes: [
    "Respond with HTTP 200 OK immediately upon receiving a webhook to acknowledge receipt",
    "Webhooks may be retried up to 3 times with exponential backoff if a non-200 response is received",
    "Use campaignId and mobile together to uniquely identify a recipient's delivery status",
    "When EnableFallback is true, Non-RCS User events will trigger an automatic SMS fallback dispatch"
  ]
};

export const ERROR_CODES_DOC = {
  description: "Complete list of status codes and error messages returned by the OmniDigital RCS API.",
  rows: [
  [
    "OK",
    "Success message",
    "Request completed successfully"
  ],
  [
    "WARNING",
    "API Key is required!",
    "API key parameter is missing"
  ],
  [
    "WARNING",
    "Invalid API Key!",
    "Provided API key is not valid"
  ],
  [
    "WARNING",
    "Request body is empty!",
    "POST request has no JSON body"
  ],
  [
    "ERROR",
    "Invalid JSON format: {details}",
    "JSON deserialization failed"
  ],
  [
    "WARNING",
    "TemplateId is required!",
    "Template ID is missing"
  ],
  [
    "WARNING",
    "CampaignName is required!",
    "Campaign name is missing"
  ],
  [
    "WARNING",
    "Invalid CampaignName! Must be alphanumeric (1-50 chars).",
    "Campaign name doesn't match validation pattern"
  ],
  [
    "WARNING",
    "Mobile numbers are required!",
    "MobileNumbers array is empty or null"
  ],
  [
    "WARNING",
    "Maximum 5000 mobile numbers are allowed per request!",
    "MobileNumbers array exceeds 5000 entries"
  ],
  [
    "WARNING",
    "No valid mobile numbers found!",
    "All provided numbers failed validation"
  ],
  [
    "WARNING",
    "Fallback requires EntityId!",
    "EnableFallback is true but EntityId is missing"
  ],
  [
    "WARNING",
    "Fallback requires SenderId!",
    "EnableFallback is true but SenderId is missing"
  ],
  [
    "WARNING",
    "Fallback requires valid Sms TemplateId!",
    "EnableFallback is true but SmsTemplateId is missing"
  ],
  [
    "WARNING",
    "Fallback requires Sms Text!",
    "EnableFallback is true but SmsText is missing"
  ],
  [
    "WARNING",
    "Template not found or does not belong to this customer!",
    "Invalid template ID or ownership mismatch"
  ],
  [
    "WARNING",
    "Insufficient RCS balance. Your balance: X, required: Y",
    "Not enough credits to send campaign"
  ],
  [
    "WARNING",
    "botId is required!",
    "GetTemplates called without botId parameter"
  ],
  [
    "Create Bot Errors"
  ],
  [
    "WARNING",
    "Bot name is required!",
    "CreateBot: name field is missing or empty"
  ],
  [
    "WARNING",
    "Bot name must not exceed 100 characters!",
    "CreateBot: name exceeds 100 character limit"
  ],
  [
    "WARNING",
    "Bot type is required!",
    "CreateBot: bot_type is missing or empty"
  ],
  [
    "WARNING",
    "Brand name is required!",
    "CreateBot: brandname is missing or empty"
  ],
  [
    "WARNING",
    "Description is required!",
    "CreateBot: desc is missing or empty"
  ],
  [
    "WARNING",
    "At least one contact number is required!",
    "CreateBot: number array is empty or null"
  ],
  [
    "WARNING",
    "At least one email is required!",
    "CreateBot: email array is empty or null"
  ],
  [
    "WARNING",
    "Logo image URL is required!",
    "CreateBot: logoimageurlrcs is missing or empty"
  ],
  [
    "WARNING",
    "Message type is required!",
    "CreateBot: message_type is missing or empty"
  ],
  [
    "WARNING",
    "extra_details object is required!",
    "CreateBot: extra_details is null"
  ],
  [
    "WARNING",
    "Invalid URL format messages",
    "CreateBot: URL fields contain invalid format"
  ],
  [
    "WARNING",
    "Labels count mismatch messages",
    "CreateBot: plab/elab/wlab count doesn't match arrays"
  ],
  [
    "WARNING",
    "Failed to save RCS Bot details. Please try again.",
    "CreateBot: Database save returned zero/negative ID"
  ],
  [
    "Create Template Errors"
  ],
  [
    "WARNING",
    "TemplateType is required!",
    "CreateTemplate: TemplateType field is missing or empty"
  ],
  [
    "WARNING",
    "Invalid TemplateType!",
    "CreateTemplate: TemplateType not PlainText, RichCard, or Carousel"
  ],
  [
    "WARNING",
    "BotId is required!",
    "CreateTemplate: BotId field is missing or empty"
  ],
  [
    "WARNING",
    "Bot not found!",
    "CreateTemplate: BotId does not resolve to a valid bot"
  ],
  [
    "WARNING",
    "TemplateName is required!",
    "CreateTemplate: TemplateName field is missing or empty"
  ],
  [
    "WARNING",
    "Invalid TemplateName!",
    "CreateTemplate: TemplateName doesn't match alphanumeric pattern"
  ],
  [
    "WARNING",
    "Template name already exists for this bot!",
    "CreateTemplate: Duplicate template name under same bot"
  ],
  [
    "WARNING",
    "RichCard/PlainText field validation messages",
    "CreateTemplate: Type-specific field validation failed"
  ],
  [
    "WARNING",
    "Invalid URL format messages",
    "CreateTemplate: Media URL fields contain invalid format"
  ],
  [
    "WARNING",
    "Vendor did not return a template ID",
    "CreateTemplate: Vendor submission did not return VendorTemplateId"
  ],
  [
    "ERROR",
    "An error occurred while processing the request",
    "Internal server error or unexpected exception"
  ]
]
};

export const BEST_PRACTICES = [
  "Secure your API Key: Never expose your API key in client-side code or public repositories",
  "Get Bot IDs first: Call GetBots endpoint to retrieve available bot IDs before getting templates",
  "Use vendor template IDs: The TemplateId in GetTemplates response is the vendor-assigned ID for reference",
  "Validate mobile numbers: Ensure all numbers are 10 digits before sending",
  "Check balance regularly: Use CheckRcsBalance endpoint before creating large campaigns",
  "Handle errors gracefully: Implement proper error handling for all API responses",
  "Use meaningful campaign names: Follow the naming convention for better tracking",
  "Batch requests: Maximum 5000 numbers per campaign request",
  "Enable fallback wisely: Use SMS fallback for critical campaigns",
  "Test with small batches: Start with a few numbers before scaling up",
  "Check template status: Only use templates with \"Active\" status for campaigns"
];
export const RATE_LIMITS = [
  "Maximum mobile numbers per request: 5000",
  "Campaign name length: 1-50 characters",
  "Allowed characters in campaign name: A-Z, a-z, 0-9, space, hyphen (-), underscore (_)",
  "Mobile number format: Exactly 10 digits (Indian numbers)"
];
export const WORKFLOW_STEPS = [
  {
    "step": 1,
    "title": "Get Your Bots",
    "desc": "Call GET /GetBots to retrieve all available bot IDs"
  },
  {
    "step": 2,
    "title": "Create Template (Optional)",
    "desc": "Call POST /CreateTemplate to create a new template with media URLs and suggestion buttons"
  },
  {
    "step": 3,
    "title": "Get Templates",
    "desc": "Call GET /GetTemplates?botId={botId} for each bot to see available templates"
  },
  {
    "step": 4,
    "title": "Check Balance",
    "desc": "Call GET /CheckRcsBalance to verify sufficient credits"
  },
  {
    "step": 5,
    "title": "Create Campaign",
    "desc": "Call POST /CreateCampaign with your template, mobile numbers."
  },
  {
    "step": 6,
    "title": "Register a Bot (Optional)",
    "desc": "Call POST /CreateBot to register a new RCS bot with brand details, logo URL, and contact info. Bot will be reviewed by admin before vendor submission."
  },
  {
    "step": 7,
    "title": "Handle Response",
    "desc": "Check the response status and act accordingly (success/warning/error)"
  }
];
