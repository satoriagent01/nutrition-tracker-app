import { describe, it, expect } from 'node:test';
import assert from 'node:assert';
import { MealPlanner } from './meal-planner.js';

describe('Meal Planner Module', () => {
  it('should create a new meal planner', () => {
    const planner = new MealPlanner();
    assert.ok(planner);
    assert.strictEqual(planner.meals.length, 0);
  });

  it('should add a meal with nutrition data', () => {
    const planner = new MealPlanner();
    const meal = {
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
    };

    planner.addMeal(meal);
    assert.strictEqual(planner.meals.length, 1);
    assert.strictEqual(planner.meals[0].name, 'Chocolate Bar');
    assert.strictEqual(planner.meals[0].grams, 30);
  });

  it('should calculate totals for all meals', () => {
    const planner = new MealPlanner();
    
    planner.addMeal({
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
    });

    planner.addMeal({
      name: 'Apple Juice',
      grams: 200,
      nutrition: {
        energyKcal: 47,
        fat: 0,
        saturatedFat: 0,
        carbs: 11,
        sugars: 10,
        fiber: 0.7,
        protein: 0.4,
        salt: 0
      }
    });

    const totals = planner.getTotals();
    assert.ok(totals);
    assert.ok(totals.energyKcal > 0);
    assert.ok(totals.fat >= 0);
    assert.ok(totals.carbs >= 0);
    assert.ok(totals.protein >= 0);
  });

  it('should remove a meal by index', () => {
    const planner = new MealPlanner();
    
    planner.addMeal({
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
    });

    planner.addMeal({
      name: 'Apple Juice',
      grams: 200,
      nutrition: {
        energyKcal: 47,
        fat: 0,
        saturatedFat: 0,
        carbs: 11,
        sugars: 10,
        fiber: 0.7,
        protein: 0.4,
        salt: 0
      }
    });

    assert.strictEqual(planner.meals.length, 2);
    planner.removeMeal(0);
    assert.strictEqual(planner.meals.length, 1);
    assert.strictEqual(planner.meals[0].name, 'Apple Juice');
  });

  it('should handle empty meal list', () => {
    const planner = new MealPlanner();
    const totals = planner.getTotals();
    assert.ok(totals);
    assert.strictEqual(totals.energyKcal, 0);
    assert.strictEqual(totals.fat, 0);
    assert.strictEqual(totals.carbs, 0);
    assert.strictEqual(totals.protein, 0);
  });

  it('should scale nutrition values by grams', () => {
    const planner = new MealPlanner();
    
    // 100g of product with 549 kcal per 100g
    planner.addMeal({
      name: 'Product',
      grams: 100,
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
    });

    // 50g of same product should have half the values
    planner.addMeal({
      name: 'Product',
      grams: 50,
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
    });

    const totals = planner.getTotals();
    // 100g: 549 kcal, 50g: 274.5 kcal, total: 823.5 kcal
    assert.strictEqual(totals.energyKcal, 823.5);
    assert.strictEqual(totals.fat, 49.5);
    assert.strictEqual(totals.carbs, 82.5);
  });

  it('should calculate daily totals correctly', () => {
    const planner = new MealPlanner();
    
    planner.addMeal({
      name: 'Breakfast',
      grams: 200,
      nutrition: {
        energyKcal: 100,
        fat: 5,
        saturatedFat: 2,
        carbs: 20,
        sugars: 10,
        fiber: 1,
        protein: 8,
        salt: 0.5
      }
    });

    planner.addMeal({
      name: 'Lunch',
      grams: 150,
      nutrition: {
        energyKcal: 200,
        fat: 10,
        saturatedFat: 4,
        carbs: 30,
        sugars: 15,
        fiber: 2,
        protein: 15,
        salt: 1
      }
    });

    const totals = planner.getTotals();
    assert.strictEqual(totals.energyKcal, 500);
    assert.strictEqual(totals.fat, 20);
    assert.strictEqual(totals.carbs, 65);
    assert.strictEqual(totals.protein, 31.5);
  });
});