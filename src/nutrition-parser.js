/**
 * Nutrition label parser - extracts structured nutrition data from OCR text.
 * Handles multiple languages (Dutch, German, French, Italian, English, Spanish).
 */

/**
 * Parse nutrition label text into structured data.
 * @param {string} text - OCR extracted text from a nutrition label.
 * @returns {Object} Parsed nutrition data.
 */
export function parseNutritionLabel(text) {
  const result = {
    productName: '',
    servingSize: '',
    servingsPerContainer: '',
    energy: { per100g: null, perServing: null, unit: 'kJ' },
    fat: { per100g: null, perServing: null, unit: 'g' },
    saturatedFat: { per100g: null, perServing: null, unit: 'g' },
    carbohydrates: { per100g: null, perServing: null, unit: 'g' },
    sugars: { per100g: null, perServing: null, unit: 'g' },
    fiber: { per100g: null, perServing: null, unit: 'g' },
    protein: { per100g: null, perServing: null, unit: 'g' },
    salt: { per100g: null, perServing: null, unit: 'g' },
    ingredients: [],
    allergens: [],
    additionalInfo: {},
  };

  // Extract product name (first line or lines before nutrition table)
  const lines = text.split('\n').filter(l => l.trim());
  result.productName = extractProductName(lines);

  // Extract serving size info
  result.servingSize = extractServingSize(text);
  result.servingsPerContainer = extractServingsPerContainer(text);

  // Parse nutrition table
  parseNutritionTable(text, result);

  // Extract ingredients
  result.ingredients = extractIngredients(text);

  // Extract allergens
  result.allergens = extractAllergens(text);

  return result;
}

/**
 * Extract product name from lines.
 */
function extractProductName(lines) {
  // Look for lines before "Nährwert" / "Voedingswaarde" / "Nutrition" etc.
  const nutritionKeywords = [
    'nährwert', 'nutrition', 'voedingswaarde', 'dichiarazione',
    'nutritional', 'valore nutrizionale', 'nährwertdeklaration',
  ];

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (nutritionKeywords.some(kw => lower.includes(kw))) {
      // Product name is before this line
      return lines.slice(0, i).join(' ').trim();
    }
  }

  // Fallback: first non-empty line
  return lines[0] || '';
}

/**
 * Extract serving size.
 */
function extractServingSize(text) {
  // Patterns: "100 g", "30 g = 1 Melto", "200 ml", "per 100 ml", "per glas (200 ml)"
  const patterns = [
    /(\d+\s*(?:g|ml))\s*(?:=\s*(.+?))?(?=\s*$|\s*\n)/i,
    /per\s+(.+?)\s*(?:\n|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[2] || '';
    }
  }

  return '';
}

/**
 * Extract servings per container.
 */
function extractServingsPerContainer(text) {
  const patterns = [
    /(\d+)\s*(?:porties|servings|portions|porzioni)/i,
    /(\d+)\s*(?:x|×)\s*(\d+\s*(?:g|ml))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return '';
}

/**
 * Parse the nutrition table from text.
 */
function parseNutritionTable(text, result) {
  // Find the nutrition table section
  const tableMatch = text.match(/(nährwert|nutrition|voedingswaarde|dichiarazione|nutritional|valore\s*nutrizionale)[\s\S]*?(?:\n\s*\n|$)/i);

  if (!tableMatch) return;

  const tableText = tableMatch[0];
  const lines = tableText.split('\n').filter(l => l.trim());

  // Find the column headers (e.g., "100 g", "30 g = 1 Melto")
  let per100gCol = -1;
  let perServingCol = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('100') && (line.includes('g') || line.includes('ml'))) {
      per100gCol = i;
    }
    if (i > 0 && per100gCol >= 0 && line.includes('=')) {
      perServingCol = i;
    }
  }

  // If no explicit serving column, try to find it
  if (perServingCol === -1 && per100gCol >= 0) {
    for (let i = per100gCol + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('g') || line.includes('ml')) {
        perServingCol = i;
        break;
      }
    }
  }

  // Define field mappings (multilingual)
  const fieldMappings = [
    { key: 'energy', patterns: ['energie', 'energy', 'calories', 'calor'] },
    { key: 'fat', patterns: ['fett', 'matières grasses', 'vetten', 'grassi', 'fat'] },
    { key: 'saturatedFat', patterns: ['gesättigte', 'verzadigde', 'saturi', 'saturé', 'saturated'] },
    { key: 'carbohydrates', patterns: ['kohlenhydrate', 'glucides', 'koolhydraten', 'carboidrati', 'carbohydrates'] },
    { key: 'sugars', patterns: ['zucker', 'sucres', 'suikers', 'zuccheri', 'sugars', 'sucre'] },
    { key: 'fiber', patterns: ['ballaststoffe', 'fibres', 'vezels', 'fibre', 'fiber'] },
    { key: 'protein', patterns: ['eiweiß', 'protéines', 'eiwitten', 'proteine', 'protein'] },
    { key: 'salt', patterns: ['salz', 'sel', 'zout', 'sale', 'salt'] },
  ];

  // Parse each field
  for (const field of fieldMappings) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (field.patterns.some(p => lowerLine.includes(p))) {
        // Extract values from columns
        const values = extractValuesFromLine(line, per100gCol, perServingCol);
        if (values.per100g !== null) {
          result[field.key].per100g = values.per100g;
        }
        if (values.perServing !== null) {
          result[field.key].perServing = values.perServing;
        }
        break;
      }
    }
  }

  // Determine unit from energy line
  const energyLine = lines.find(l =>
    l.toLowerCase().includes('energie') || l.toLowerCase().includes('energy')
  );
  if (energyLine) {
    if (energyLine.includes('kcal')) {
      result.energy.unit = 'kcal';
    } else if (energyLine.includes('kj')) {
      result.energy.unit = 'kJ';
    }
  }
}

/**
 * Extract numeric values from a nutrition line.
 */
function extractValuesFromLine(line, per100gCol, perServingCol) {
  const values = { per100g: null, perServing: null };

  // Try to split by whitespace and find numeric values
  const parts = line.split(/\s+/);

  // Find numbers with units
  const numberPattern = /(\d+(?:\.\d+)?)\s*(?:g|ml|kj|kcal)/i;

  const numbers = [];
  for (const part of parts) {
    const match = part.match(numberPattern);
    if (match) {
      numbers.push(parseFloat(match[1]));
    }
  }

  // If we have 2 numbers, assign them
  if (numbers.length >= 2) {
    values.per100g = numbers[0];
    values.perServing = numbers[1];
  } else if (numbers.length === 1) {
    // Check if it's per 100g or per serving based on context
    if (per100gCol >= 0) {
      values.per100g = numbers[0];
    } else {
      values.perServing = numbers[0];
    }
  }

  return values;
}

/**
 * Extract ingredients list.
 */
function extractIngredients(text) {
  const patterns = [
    /ingredi(?:en)?(?:ti)?[:\s]+([\s\S]*?)(?=\n\s*(?:allergie|nährwert|nutrition|voedingswaarde)|$)/i,
    /ingredients[:\s]+([\s\S]*?)(?=\n\s*(?:allergy|nutrition|nährwert)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Split by * or ; and clean up
      const ingredients = match[1]
        .split(/[*;]/)
        .map(i => i.trim())
        .filter(i => i.length > 0);
      return ingredients;
    }
  }

  return [];
}

/**
 * Extract allergen information.
 */
function extractAllergens(text) {
  const allergens = [];
  const allergenKeywords = [
    'melk', 'laktose', 'lactose', 'milk', 'casein',
    'ei', 'eieren', 'egg', 'eggs',
    'gluten', 'tarwe', 'wheat', 'gerst', 'barley', 'rogge', 'rye',
    'soja', 'soya', 'soy',
    'noten', 'noot', 'nuts', 'amandelen', 'almonds', 'walnoten', 'walnuts',
    'pistaches', 'pistachio', 'pistacchio',
    'pinda', 'peanuts', 'arachide', 'groundnut',
    'selderij', 'celery',
    'mosterd', 'mustard',
    'sesam', 'sesame',
    'schelpdieren', 'shellfish', 'molluschi',
    'sulfiet', 'sulfites', 'solfiti',
    'lupine',
    'weekdieren', 'molluscs',
  ];

  const lowerText = text.toLowerCase();
  for (const allergen of allergenKeywords) {
    if (lowerText.includes(allergen)) {
      // Avoid duplicates
      if (!allergens.includes(allergen)) {
        allergens.push(allergen);
      }
    }
  }

  return allergens;
}

/**
 * Calculate nutrition for a given weight (in grams).
 * @param {Object} nutrition - Parsed nutrition data.
 * @param {number} weight - Weight in grams.
 * @returns {Object} Nutrition values for the given weight.
 */
export function calculateNutritionForWeight(nutrition, weight) {
  const factor = weight / 100; // Normalize to per 100g

  return {
    energy: nutrition.energy.per100g ? nutrition.energy.per100g * factor : null,
    fat: nutrition.fat.per100g ? nutrition.fat.per100g * factor : null,
    saturatedFat: nutrition.saturatedFat.per100g ? nutrition.saturatedFat.per100g * factor : null,
    carbohydrates: nutrition.carbohydrates.per100g ? nutrition.carbohydrates.per100g * factor : null,
    sugars: nutrition.sugars.per100g ? nutrition.sugars.per100g * factor : null,
    fiber: nutrition.fiber.per100g ? nutrition.fiber.per100g * factor : null,
    protein: nutrition.protein.per100g ? nutrition.protein.per100g * factor : null,
    salt: nutrition.salt.per100g ? nutrition.salt.per100g * factor : null,
  };
}