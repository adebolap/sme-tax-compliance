export async function validateBelgianVAT(vatNumber: string): Promise<boolean> {
  try {
    // Clean the VAT number (remove non-numeric characters)
    const cleanVAT = vatNumber.replace(/[^0-9]/g, '');

    // Format for VIES API
    const formattedVAT = `BE${cleanVAT}`;

    // Call EU VIES API
    const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vatNumber: formattedVAT,
        countryCode: 'BE'
      })
    });

    if (!response.ok) {
      throw new Error('VIES API request failed');
    }

    const data = await response.json();
    return data.valid === true;

  } catch (error) {
    console.error('VAT validation error:', error);
    // If API is down, fallback to format validation
    const cleanVAT = vatNumber.replace(/[^0-9]/g, '');
    return /^[0-9]{10}$/.test(cleanVAT);
  }
}