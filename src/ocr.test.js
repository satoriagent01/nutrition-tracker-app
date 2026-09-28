import { describe, it, expect } from 'node:test';
import assert from 'node:assert';
import { extractTextFromImage } from './ocr.js';

describe('OCR Module', () => {
  it('should extract text from a simulated nutrition label image', async () => {
    // Simulate a nutrition label text that would be extracted from an image
    const mockImageText = `
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

    // Since we're testing in Node without actual image processing,
    // we test the text parsing logic that would follow OCR
    const result = extractTextFromImage(mockImageText);
    assert.ok(result.includes('Energie'));
    assert.ok(result.includes('549 kcal'));
    assert.ok(result.includes('Fett'));
    assert.ok(result.includes('33 g'));
  });

  it('should handle empty input', () => {
    const result = extractTextFromImage('');
    assert.strictEqual(result, '');
  });

  it('should handle multiline nutrition data', async () => {
    const mockImageText = `
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

    const result = extractTextFromImage(mockImageText);
    assert.ok(result.includes('energie'));
    assert.ok(result.includes('koolhydraten'));
    assert.ok(result.includes('suikers'));
  });

  it('should extract basic nutrition values from German label', async () => {
    const mockImageText = `
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

    const result = extractTextFromImage(mockImageText);
    assert.ok(result.includes('Energie'));
    assert.ok(result.includes('549 kcal'));
    assert.ok(result.includes('Fett'));
    assert.ok(result.includes('33 g'));
    assert.ok(result.includes('Kohlenhydrate'));
    assert.ok(result.includes('Eiweiß'));
  });

  it('should extract basic nutrition values from Dutch label', async () => {
    const mockImageText = `
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

    const result = extractTextFromImage(mockImageText);
    assert.ok(result.includes('energie'));
    assert.ok(result.includes('koolhydraten'));
    assert.ok(result.includes('suikers'));
    assert.ok(result.includes('vezels'));
  });
});