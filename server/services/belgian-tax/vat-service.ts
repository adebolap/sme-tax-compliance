import { z } from "zod";

const VIESResponse = z.object({
  valid: z.boolean(),
  requestDate: z.string(),
  userError: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
});

type VIESResponseType = z.infer<typeof VIESResponse>;

export class BelgianVATService {
  private static VIES_API_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number';
  
  static async validateVATNumber(vatNumber: string): Promise<{
    isValid: boolean;
    error?: string;
    details?: {
      name?: string;
      address?: string;
    };
  }> {
    try {
      // Clean the VAT number
      const cleanVAT = vatNumber.replace(/[^0-9]/g, '');
      const formattedVAT = `BE${cleanVAT}`;

      const response = await fetch(this.VIES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vatNumber: formattedVAT,
          countryCode: 'BE',
        }),
      });

      if (!response.ok) {
        throw new Error(`VIES API error: ${response.statusText}`);
      }

      const data = await response.json();
      const validatedData = VIESResponse.parse(data);

      return {
        isValid: validatedData.valid,
        details: {
          name: validatedData.name,
          address: validatedData.address,
        },
      };
    } catch (error) {
      console.error('VAT validation error:', error);
      
      // Fallback to format validation if API is unavailable
      const isValidFormat = /^[0-9]{10}$/.test(cleanVAT);
      
      return {
        isValid: isValidFormat,
        error: error instanceof Error ? error.message : 'VAT validation failed',
      };
    }
  }
}
