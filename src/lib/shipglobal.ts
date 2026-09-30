interface ShipmentRequest {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  country: string;
}

const countryMap: { [key: string]: string } = {
  "united states": "US",
  "united states of america": "US",
  "usa": "US",
  "united kingdom": "GB",
  "uk": "GB",
  "great britain": "GB",
  "canada": "CA",
  "australia": "AU",
  "germany": "DE",
  "france": "FR",
  "italy": "IT",
  "spain": "ES",
  "netherlands": "NL",
  "india": "IN",
  "united arab emirates": "AE",
  "uae": "AE",
  "saudi arabia": "SA",
  "singapore": "SG",
  "new zealand": "NZ",
  "ireland": "IE",
  "switzerland": "CH",
  "belgium": "BE",
  "austria": "AT",
  "sweden": "SE",
  "norway": "NO",
  "denmark": "DK",
  "finland": "FI",
};

function cleanCountryCode(country: string): string {
  const cleaned = country.trim().toLowerCase();
  if (countryMap[cleaned]) {
    return countryMap[cleaned];
  }
  if (country.trim().length === 2) {
    return country.trim().toUpperCase();
  }
  return "US"; // Default fallback
}

function getServiceCode(countryCode: string): string {
  const euCountries = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
    "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
    "PL", "PT", "RO", "SK", "SI", "ES", "SE"
  ];
  const upperCode = countryCode.toUpperCase();
  if (upperCode === "GB" || upperCode === "UK") {
    return "sgdirectyungb";
  }
  if (euCountries.includes(upperCode)) {
    return "sgdirecteuyun";
  }
  return process.env.SHIPGLOBAL_DEFAULT_SERVICE || "sgdirecteuyun";
}

function getAuthHeader(): string | null {
  const email = process.env.SHIPGLOBAL_EMAIL;
  const password = process.env.SHIPGLOBAL_PASSWORD;
  
  if (email && password) {
    const creds = Buffer.from(`${email}:${password}`).toString("base64");
    return `Basic ${creds}`;
  }

  // Fallback to API Key if username/password are not set directly
  const apiKey = process.env.SHIPGLOBAL_API_KEY;
  if (apiKey && apiKey !== "REPLACE_WITH_SHIPGLOBAL_KEY") {
    if (apiKey.startsWith("Basic ") || apiKey.startsWith("Bearer ")) {
      return apiKey;
    }
    // Assume it is base64 encoded credential
    return `Basic ${apiKey}`;
  }

  return null;
}

export async function createShipment(app: ShipmentRequest) {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    console.warn("ShipGlobal credentials are not defined. Simulating sandbox response.");
    const mockAwb = `SG-${Math.floor(100000000 + Math.random() * 900000000)}`;
    return {
      awb_number: mockAwb,
      tracking_url: `https://www.shipglobal.in/tracking/?awb=${mockAwb}`,
      courier_name: "ShipGlobal Premium",
      shipment_id: `SG_SH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
  }

  // Address parsing
  const addressParts = app.address.split(",").map(p => p.trim());
  const city = addressParts[addressParts.length - 3] || "New Delhi";
  const state = addressParts[addressParts.length - 2] || "Delhi";
  const pincode = addressParts[addressParts.length - 1]?.match(/\d+/)?.[0] || "110001";

  // Recipient name parsing
  const nameParts = app.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Recipient";
  const lastName = nameParts.slice(1).join(" ") || "Name";

  const countryCode = cleanCountryCode(app.country);
  const service = getServiceCode(countryCode);
  const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  const today = new Date().toISOString().split("T")[0];

  const payload = {
    invoice_no: invoiceNo,
    invoice_date: today,
    order_reference: orderRef,
    service: service,
    package_weight: "0.3",
    package_length: "20",
    package_breadth: "15",
    package_height: "2",
    currency_code: "USD",
    csb5_status: 0,
    customer_shipping_firstname: firstName,
    customer_shipping_lastname: lastName,
    customer_shipping_mobile: app.phone,
    customer_shipping_email: app.email,
    customer_shipping_company: "",
    customer_shipping_address: app.address,
    customer_shipping_address_2: "",
    customer_shipping_address_3: "",
    customer_shipping_city: city,
    customer_shipping_postcode: pincode,
    customer_shipping_country_code: countryCode,
    customer_shipping_state: state,
    ioss_number: "",
    customer_nickname: "",
    vendor_order_items: [
      {
        vendor_order_item_name: "Documents courier — BookMyGlobal",
        vendor_order_item_sku: "DOCS",
        vendor_order_item_quantity: "1",
        vendor_order_item_unit_price: "10",
        vendor_order_item_hsn: "49111010",
        vendor_order_item_tax_rate: "0"
      }
    ]
  };

  try {
    const response = await fetch("https://app.shipglobal.in/apiv1/order/add", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ShipGlobal Error: ${errorText}`);
    }

    const result: any = await response.json();
    
    // Extract awb/tracking number
    const awbNumber = result.data?.waybill_number || result.data?.awb_number || result.waybill_number || result.awb_number;

    return {
      awb_number: awbNumber || `SG-${Math.floor(100000000 + Math.random() * 900000000)}`,
      tracking_url: `https://www.shipglobal.in/tracking/?awb=${awbNumber || ""}`,
      courier_name: "ShipGlobal Premium",
      shipment_id: orderRef,
      raw: result
    };
  } catch (error) {
    console.error("ShipGlobal createShipment failed:", error);
    throw error;
  }
}

export async function getTracking(awbNumber: string) {
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return {
      status: "In Transit",
      events: [
        { timestamp: new Date().toISOString(), location: "Hub Facility", description: "Shipment departed from facility" },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), location: "Origin Gateway", description: "Shipment processed at sorting center" }
      ],
    };
  }

  try {
    const response = await fetch("https://app.shipglobal.in/apiv1/tools/tracking", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        tracking: awbNumber
      })
    });

    if (!response.ok) {
      throw new Error(`Tracking fetch failed: ${response.statusText}`);
    }

    const result: any = await response.json();
    if (result.success && result.data) {
      const events = (result.data.awbEvents || []).map((evt: any) => ({
        timestamp: evt.awb_history_datetime || new Date().toISOString(),
        location: evt.awb_history_location || "Unknown",
        description: evt.awb_history_comment || "No comment"
      }));
      return {
        status: result.data.awbInfo?.awb_status || "In Transit",
        events: events
      };
    }

    return result;
  } catch (error) {
    console.error("ShipGlobal getTracking failed:", error);
    throw error;
  }
}
