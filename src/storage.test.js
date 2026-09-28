import { describe, it, expect } from 'node:test';
import assert from 'node:assert';
import { Storage } from './storage.js';

describe('Storage Module', () => {
  it('should create a new storage instance', () => {
    const storage = new Storage();
    assert.ok(storage);
  });

  it('should save and retrieve meals', () => {
    const storage = new Storage();
    const meals = [
      {
        name: 'Chocolate Bar',
        grams: 30,
        nutrition: {
          energyKcal: 549,
          fat: 33,
          saturatedFat: 13,
          carbs: 55,
          sugars: 45,
          fiber: 2.4,
          protein: 6.8,
          salt: 0.18
        }
      }
    ];

    storage.saveMeals(meals);
    const retrieved = storage.getMeals();
    assert.deepStrictEqual(retrieved, meals);
  });

  it('should save and retrieve products', () => {
    const storage = new Storage();
    const products = [
      {
        name: 'Chocolate Bar',
        nutrition: {
          energyKcal: 549,
          fat: 33,
          saturatedFat: 13,
          carbs: 55,
          sugars: 45,
          fiber: 2.4,
          protein: 6.8,
          salt: 0.18
        }
      }
    ];

    storage.saveProducts(products);
    const retrieved = storage.getProducts();
    assert.deepStrictEqual(retrieved, products);
  });

  it('should save and retrieve user settings', () => {
    const storage = new Storage();
    const settings = {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyFatGoal: 65,
      dailyCarbsGoal: 250
    };

    storage.saveSettings(settings);
    const retrieved = storage.getSettings();
    assert.deepStrictEqual(retrieved, settings);
  });

  it('should return empty arrays for empty storage', () => {
    const storage = new Storage();
    assert.deepStrictEqual(storage.getMeals(), []);
    assert.deepStrictEqual(storage.getProducts(), []);
  });

  it('should return default settings when none saved', () => {
    const storage = new Storage();
    const settings = storage.getSettings();
    assert.ok(settings);
    assert.strictEqual(settings.dailyCalorieGoal, 2000);
    assert.strictEqual(settings.dailyProteinGoal, 150);
    assert.strictEqual(settings.dailyFatGoal, 65);
    assert.strictEqual(settings.dailyCarbsGoal, 250);
  });

  it('should handle multiple saves and retrieves', () => {
    const storage = new Storage();
    
    // Save first set of meals
    storage.saveMeals([{ name: 'Meal 1', grams: 100, nutrition: { energyKcal: 100 } }]);
    assert.strictEqual(storage.getMeals().length, 1);

    // Save second set of meals
    storage.saveMeals([
      { name: 'Meal 1', grams: 100, nutrition: { energyKcal: 100 } },
      { name: 'Meal 2', grams: 200, nutrition: { energyKcal: 200 } }
    ]);
    assert.strictEqual(storage.getMeals().length, 2);

    // Save products
    storage.saveProducts([{ name: 'Product 1', nutrition: { energyKcal: 100 } }]);
    assert.strictEqual(storage.getProducts().length, 1);

    // Save settings
    storage.saveSettings({ dailyCalorieGoal: 2500 });
    assert.strictEqual(storage.getSettings().dailyCalorieGoal, 2500);
  });
});