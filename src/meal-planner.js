/**
 * Meal Planner module - track meals, calculate totals, custom macros.
 */

/**
 * Create a new meal planner instance.
 * @param {Object} options - Planner options.
 * @param {number} options.dailyCalorieGoal - Daily calorie goal in kcal.
 * @param {number} options.dailyProteinGoal - Daily protein goal in grams.
 * @param {number} options.dailyFatGoal - Daily fat goal in grams.
 * @param {number} options.dailyCarbsGoal - Daily carbs goal in grams.
 * @returns {Object} Meal planner instance.
 */
export function createMealPlanner(options = {}) {
  const state = {
    meals: [],
    dailyCalorieGoal: options.dailyCalorieGoal || 2000,
    dailyProteinGoal: options.dailyProteinGoal || 150,
    dailyFatGoal: options.dailyFatGoal || 65,
    dailyCarbsGoal: options.dailyCarbsGoal || 250,
    products: [], // Custom products added by user
  };

  /**
   * Add a food item to a meal.
   * @param {string} mealId - Meal ID.
   * @param {Object} foodItem - Food item with name, weight, and nutrition data.
   * @returns {Object} Updated meal.
   */
  function addFoodItem(mealId, foodItem) {
    const meal = state.meals.find(m => m.id === mealId);
    if (!meal) {
      throw new Error(`Meal ${mealId} not found`);
    }

    const item = {
      id: generateId(),
      name: foodItem.name,
      weight: foodItem.weight, // in grams
      nutrition: foodItem.nutrition, // per 100g
      calculatedNutrition: calculateNutritionForWeight(foodItem.nutrition, foodItem.weight),
      timestamp: new Date().toISOString(),
    };

    meal.items.push(item);
    return meal;
  }

  /**
   * Create a new meal.
   * @param {string} name - Meal name (e.g., "Breakfast", "Lunch").
   * @param {string} date - Date string (YYYY-MM-DD).
   * @returns {Object} Created meal.
   */
  function createMeal(name, date) {
    const meal = {
      id: generateId(),
      name,
      date,
      items: [],
      createdAt: new Date().toISOString(),
    };

    state.meals.push(meal);
    return meal;
  }

  /**
   * Get nutrition totals for a meal.
   * @param {Object} meal - Meal object.
   * @returns {Object} Nutrition totals.
   */
  function getMealNutrition(meal) {
    const totals = {
      energy: 0,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
    };

    for (const item of meal.items) {
      if (item.calculatedNutrition) {
        for (const key of Object.keys(totals)) {
          if (item.calculatedNutrition[key] !== null) {
            totals[key] += item.calculatedNutrition[key];
          }
        }
      }
    }

    return totals;
  }

  /**
   * Get daily nutrition totals.
   * @param {string} date - Date string (YYYY-MM-DD).
   * @returns {Object} Daily nutrition totals.
   */
  function getDailyTotals(date) {
    const dailyMeals = state.meals.filter(m => m.date === date);
    const totals = {
      energy: 0,
      fat: 0,
      saturatedFat: 0,
      carbohydrates: 0,
      sugars: 0,
      fiber: 0,
      protein: 0,
      salt: 0,
      meals: [],
    };

    for (const meal of dailyMeals) {
      const mealNutrition = getMealNutrition(meal);
      for (const key of Object.keys(totals)) {
        if (key !== 'meals' && mealNutrition[key] !== undefined) {
          totals[key] += mealNutrition[key];
        }
      }
      totals.meals.push({
        id: meal.id,
        name: meal.name,
        nutrition: mealNutrition,
      });
    }

    return totals;
  }

  /**
   * Get progress towards daily goals.
   * @param {string} date - Date string (YYYY-MM-DD).
   * @returns {Object} Progress object.
   */
  function getDailyProgress(date) {
    const totals = getDailyTotals(date);

    return {
      energy: {
        current: totals.energy,
        goal: state.dailyCalorieGoal,
        percentage: Math.min(100, (totals.energy / state.dailyCalorieGoal) * 100),
      },
      protein: {
        current: totals.protein,
        goal: state.dailyProteinGoal,
        percentage: Math.min(100, (totals.protein / state.dailyProteinGoal) * 100),
      },
      fat: {
        current: totals.fat,
        goal: state.dailyFatGoal,
        percentage: Math.min(100, (totals.fat / state.dailyFatGoal) * 100),
      },
      carbs: {
        current: totals.carbohydrates,
        goal: state.dailyCarbsGoal,
        percentage: Math.min(100, (totals.carbohydrates / state.dailyCarbsGoal) * 100),
      },
    };
  }

  /**
   * Add a custom product.
   * @param {Object} product - Product with name and nutrition per 100g.
   * @returns {Object} Added product.
   */
  function addCustomProduct(product) {
    const newProduct = {
      id: generateId(),
      name: product.name,
      nutrition: {
        energy: product.nutrition?.energy || 0,
        fat: product.nutrition?.fat || 0,
        saturatedFat: product.nutrition?.saturatedFat || 0,
        carbohydrates: product.nutrition?.carbohydrates || 0,
        sugars: product.nutrition?.sugars || 0,
        fiber: product.nutrition?.fiber || 0,
        protein: product.nutrition?.protein || 0,
        salt: product.nutrition?.salt || 0,
      },
      createdAt: new Date().toISOString(),
    };

    state.products.push(newProduct);
    return newProduct;
  }

  /**
   * Get all custom products.
   * @returns {Array} List of custom products.
   */
  function getProducts() {
    return state.products;
  }

  /**
   * Remove a custom product.
   * @param {string} productId - Product ID.
   */
  function removeProduct(productId) {
    state.products = state.products.filter(p => p.id !== productId);
  }

  /**
   * Update daily goals.
   * @param {Object} goals - New goals.
   */
  function updateGoals(goals) {
    if (goals.dailyCalorieGoal !== undefined) {
      state.dailyCalorieGoal = goals.dailyCalorieGoal;
    }
    if (goals.dailyProteinGoal !== undefined) {
      state.dailyProteinGoal = goals.dailyProteinGoal;
    }
    if (goals.dailyFatGoal !== undefined) {
      state.dailyFatGoal = goals.dailyFatGoal;
    }
    if (goals.dailyCarbsGoal !== undefined) {
      state.dailyCarbsGoal = goals.dailyCarbsGoal;
    }
  }

  /**
   * Get all meals.
   * @returns {Array} List of all meals.
   */
  function getMeals() {
    return state.meals;
  }

  /**
   * Remove a meal.
   * @param {string} mealId - Meal ID.
   */
  function removeMeal(mealId) {
    state.meals = state.meals.filter(m => m.id !== mealId);
  }

  /**
   * Calculate nutrition for a given weight.
   * @param {Object} nutrition - Nutrition per 100g.
   * @param {number} weight - Weight in grams.
   * @returns {Object} Calculated nutrition.
   */
  function calculateNutritionForWeight(nutrition, weight) {
    const factor = weight / 100;
    return {
      energy: nutrition.energy ? nutrition.energy * factor : 0,
      fat: nutrition.fat ? nutrition.fat * factor : 0,
      saturatedFat: nutrition.saturatedFat ? nutrition.saturatedFat * factor : 0,
      carbohydrates: nutrition.carbohydrates ? nutrition.carbohydrates * factor : 0,
      sugars: nutrition.sugars ? nutrition.sugars * factor : 0,
      fiber: nutrition.fiber ? nutrition.fiber * factor : 0,
      protein: nutrition.protein ? nutrition.protein * factor : 0,
      salt: nutrition.salt ? nutrition.salt * factor : 0,
    };
  }

  /**
   * Generate a unique ID.
   * @returns {string} Unique ID.
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  return {
    addFoodItem,
    createMeal,
    getMealNutrition,
    getDailyTotals,
    getDailyProgress,
    addCustomProduct,
    getProducts,
    removeProduct,
    updateGoals,
    getMeals,
    removeMeal,
    calculateNutritionForWeight,
    getState: () => state,
  };
}