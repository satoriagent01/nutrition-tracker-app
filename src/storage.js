/**
 * Storage module - LocalStorage persistence for meals, products, and user settings.
 */

const STORAGE_KEYS = {
  MEALS: 'nutrition_tracker_meals',
  PRODUCTS: 'nutrition_tracker_products',
  GOALS: 'nutrition_tracker_goals',
};

/**
 * Save meals to LocalStorage.
 * @param {Array} meals - Array of meal objects.
 */
export function saveMeals(meals) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (e) {
    console.error('Failed to save meals:', e);
  }
}

/**
 * Load meals from LocalStorage.
 * @returns {Array} Array of meal objects.
 */
export function loadMeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEALS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load meals:', e);
    return [];
  }
}

/**
 * Save custom products to LocalStorage.
 * @param {Array} products - Array of product objects.
 */
export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

/**
 * Load custom products from LocalStorage.
 * @returns {Array} Array of product objects.
 */
export function loadProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load products:', e);
    return [];
  }
}

/**
 * Save daily goals to LocalStorage.
 * @param {Object} goals - Goals object.
 */
export function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals:', e);
  }
}

/**
 * Load daily goals from LocalStorage.
 * @returns {Object} Goals object.
 */
export function loadGoals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyFatGoal: 65,
      dailyCarbsGoal: 250,
    };
  } catch (e) {
    console.error('Failed to load goals:', e);
    return {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyFatGoal: 65,
      dailyCarbsGoal: 250,
    };
  }
}

/**
 * Clear all stored data.
 */
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}

/**
 * Export all data as JSON string.
 * @returns {string} JSON string of all data.
 */
export function exportData() {
  const data = {
    meals: loadMeals(),
    products: loadProducts(),
    goals: loadGoals(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string.
 * @param {string} jsonData - JSON string of data.
 * @returns {boolean} Whether import was successful.
 */
export function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    if (data.meals) saveMeals(data.meals);
    if (data.products) saveProducts(data.products);
    if (data.goals) saveGoals(data.goals);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}