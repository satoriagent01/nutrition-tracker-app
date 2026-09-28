import { describe, it, expect } from 'node:test';
import assert from 'node:assert';
import { parseNutritionLabel } from './nutrition-parser.js';

describe('Nutrition Parser Module', () => {
  it('should parse German nutrition label', () => {
    const text = `
Nährwertdeklaration
100 g    30 g = 1 Melto
Energie  2292 kJ  688 kJ
         549 kcal 165 kcal
Fett     33 g     10 g
davon gesättigte Fettsäuren  13 g  3,9 g
Kohlenhydrate  55 g  16 g
davon Zucker  45 g  14 g
Ballaststoffe  2,4 g  0,7 g
Eiweiß  6,8 g  2,0 g
Salz  0,18 g  0,05 g
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.saturatedFat, 13);
    assert.strictEqual(result.carbs, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.fiber, 2.4);
    assert.strictEqual(result.protein, 6.8);
    assert.strictEqual(result.salt, 0.18);
  });

  it('should parse Dutch nutrition label', () => {
    const text = `
Voedingswaarde per 100 ml  glas (200 ml)
energie  199 kJ / 47 kcal  399 kJ / 94 kcal
vetten, waarvan  0 g  0 g
- verzadigde vetzuren  0 g  0 g
koolhydraten, waarvan  11 g  22 g
- suikers  10 g  20 g
vezels  0,7 g  1,4 g
eiwitten  0,4 g  0,8 g
zout  0 g  0 g
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 47);
    assert.strictEqual(result.fat, 0);
    assert.strictEqual(result.saturatedFat, 0);
    assert.strictEqual(result.carbs, 11);
    assert.strictEqual(result.sugars, 10);
    assert.strictEqual(result.fiber, 0.7);
    assert.strictEqual(result.protein, 0.4);
    assert.strictEqual(result.salt, 0);
  });

  it('should parse Italian nutrition label', () => {
    const text = `
Dichiarazione nutrizionale
100 g    30 g = 1 Melto
Energia  2292 kJ  688 kJ
         549 kcal 165 kcal
Grassi   33 g     10 g
di cui acidi grassi saturi  13 g  3,9 g
Carboidrati  55 g  16 g
di cui zuccheri  45 g  14 g
Fibre  2,4 g  0,7 g
Proteine  6,8 g  2,0 g
Sale  0,18 g  0,05 g
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.saturatedFat, 13);
    assert.strictEqual(result.carbs, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.fiber, 2.4);
    assert.strictEqual(result.protein, 6.8);
    assert.strictEqual(result.salt, 0.18);
  });

  it('should handle missing values gracefully', () => {
    const text = `
Nährwertdeklaration
100 g
Energie  2292 kJ
         549 kcal
Fett     33 g
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.protein, 0);
    assert.strictEqual(result.carbs, 0);
  });

  it('should return empty object for non-nutrition text', () => {
    const text = `
This is just some random text
with no nutrition information
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 0);
    assert.strictEqual(result.fat, 0);
    assert.strictEqual(result.protein, 0);
    assert.strictEqual(result.carbs, 0);
  });

  it('should parse French nutrition label', () => {
    const text = `
Déclaration nutritionnelle
100 g    30 g = 1 Melto
Énergie  2292 kJ  688 kJ
         549 kcal 165 kcal
Matières grasses  33 g  10 g
dont acides gras saturés  13 g  3,9 g
Glucides  55 g  16 g
dont sucres  45 g  14 g
Fibres alimentaires  2,4 g  0,7 g
Protéines  6,8 g  2,0 g
Sel  0,18 g  0,05 g
    `;

    const result = parseNutritionLabel(text);
    assert.ok(result);
    assert.strictEqual(result.energyKcal, 549);
    assert.strictEqual(result.fat, 33);
    assert.strictEqual(result.saturatedFat, 13);
    assert.strictEqual(result.carbs, 55);
    assert.strictEqual(result.sugars, 45);
    assert.strictEqual(result.fiber, 2.4);
    assert.strictEqual(result.protein, 6.8);
    assert.strictEqual(result.salt, 0.18);
  });
});