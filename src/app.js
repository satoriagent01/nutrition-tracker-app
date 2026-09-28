/**
 * Main application logic and UI controller.
 */

import { createMealPlanner } from './meal-planner.js';
import { loadMeals, saveMeals, loadProducts, saveProducts, loadGoals, saveGoals } from './storage.js';

class NutritionApp {
  constructor() {
    this.mealPlanner = null;
    this.currentDate = new Date().toISOString().split('T')[0];
    this.currentMealId = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.loadGoals();
    this.renderHeader();
    this.renderGoalSettings();
    this.renderMealList();
    this.renderDailySummary();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        this.showSection(section);
      });
    });

    // Create meal
    const createMealBtn = document.getElementById('create-meal-btn');
    if (createMealBtn) {
      createMealBtn.addEventListener('click', () => this.createMeal());
    }

    // Add food to meal
    const addFoodBtn = document.getElementById('add-food-btn');
    if (addFoodBtn) {
      addFoodBtn.addEventListener('click', () => this.showAddFoodModal());
    }

    // Scan nutrition label
    const scanLabelBtn = document.getElementById('scan-label-btn');
    if (scanLabelBtn) {
      scanLabelBtn.addEventListener('click', () => this.showScanModal());
    }

    // Camera input
    const cameraInput = document.getElementById('camera-input');
    if (cameraInput) {
      cameraInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // Manual food entry
    const manualFoodBtn = document.getElementById('manual-food-btn');
    if (manualFoodBtn) {
      manualFoodBtn.addEventListener('click', () => this.showManualFoodModal());
    }

    // Save goals
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    if (saveGoalsBtn) {
      saveGoalsBtn.addEventListener('click', () => this.saveGoals());
    }

    // Date navigation
    const prevDateBtn = document.getElementById('prev-date-btn');
    const nextDateBtn = document.getElementById('next-date-btn');
    if (prevDateBtn) {
      prevDateBtn.addEventListener('click', () => this.changeDate(-1));
    }
    if (nextDateBtn) {
      nextDateBtn.addEventListener('click', () => this.changeDate(1));
    }
  }

  showSection(section) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(el => {
      el.classList.remove('active');
    });

    // Show selected section
    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) {
      sectionEl.classList.add('active');
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.section === section) {
        btn.classList.add('active');
      }
    });

    // Refresh data if needed
    if (section === 'meals') {
      this.renderMealList();
      this.renderDailySummary();
    } else if (section === 'goals') {
      this.renderGoalSettings();
    }
  }

  renderHeader() {
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
      dateDisplay.textContent = new Date(this.currentDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  }

  renderGoalSettings() {
    const goals = this.mealPlanner?.getState()?.goals || {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyFatGoal: 65,
      dailyCarbsGoal: 250,
    };

    const calorieInput = document.getElementById('goal-calories');
    const proteinInput = document.getElementById('goal-protein');
    const fatInput = document.getElementById('goal-fat');
    const carbsInput = document.getElementById('goal-carbs');

    if (calorieInput) calorieInput.value = goals.dailyCalorieGoal || 2000;
    if (proteinInput) proteinInput.value = goals.dailyProteinGoal || 150;
    if (fatInput) fatInput.value = goals.dailyFatGoal || 65;
    if (carbsInput) carbsInput.value = goals.dailyCarbsGoal || 250;
  }

  async saveGoals() {
    const goals = {
      dailyCalorieGoal: parseInt(document.getElementById('goal-calories')?.value) || 2000,
      dailyProteinGoal: parseInt(document.getElementById('goal-protein')?.value) || 150,
      dailyFatGoal: parseInt(document.getElementById('goal-fat')?.value) || 65,
      dailyCarbsGoal: parseInt(document.getElementById('goal-carbs')?.value) || 250,
    };

    saveGoals(goals);
    this.mealPlanner.updateGoals(goals);
    this.showToast('Objetivos guardados');
  }

  async loadGoals() {
    const goals = loadGoals();
    this.mealPlanner = createMealPlanner(goals);

    // Load existing meals
    const savedMeals = loadMeals();
    if (savedMeals && savedMeals.length > 0) {
      // Restore meals to planner
      for (const meal of savedMeals) {
        this.mealPlanner.createMeal(meal.name, meal.date);
        // Note: In a full app, we'd restore items too
      }
    }
  }

  renderMealList() {
    const mealListEl = document.getElementById('meal-list');
    if (!mealListEl) return;

    const meals = this.mealPlanner.getMeals().filter(m => m.date === this.currentDate);
    const products = this.mealPlanner.getProducts();

    let html = '';

    if (meals.length === 0) {
      html = '<div class="empty-state">No hay comidas registradas hoy.<br>¡Crea una nueva!</div>';
    } else {
      for (const meal of meals) {
        const nutrition = this.mealPlanner.getMealNutrition(meal);
        html += `
          <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-header">
              <h3>${meal.name}</h3>
              <button class="delete-btn" onclick="app.deleteMeal('${meal.id}')">×</button>
            </div>
            <div class="meal-nutrition">
              <span class="nutrition-item">
                <span class="nutrition-value">${Math.round(nutrition.energy)}</span>
                <span class="nutrition-label">kcal</span>
              </span>
              <span class="nutrition-item">
                <span class="nutrition-value">${Math.round(nutrition.protein)}g</span>
                <span class="nutrition-label">proteína</span>
              </span>
              <span class="nutrition-item">
                <span class="nutrition-value">${Math.round(nutrition.fat)}g</span>
                <span class="nutrition-label">grasa</span>
              </span>
              <span class="nutrition-item">
                <span class="nutrition-value">${Math.round(nutrition.carbohydrates)}g</span>
                <span class="nutrition-label">carb</span>
              </span>
            </div>
            <div class="meal-items">
              ${meal.items.map(item => `
                <div class="meal-item">
                  <span>${item.name}</span>
                  <span>${item.weight}g</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    mealListEl.innerHTML = html;
  }

  renderDailySummary() {
    const progress = this.mealPlanner.getDailyProgress(this.currentDate);

    const elements = {
      energy: document.getElementById('summary-energy'),
      protein: document.getElementById('summary-protein'),
      fat: document.getElementById('summary-fat'),
      carbs: document.getElementById('summary-carbs'),
    };

    if (elements.energy) {
      elements.energy.innerHTML = `
        <div class="progress-ring" style="--progress: ${progress.energy.percentage}">
          <span class="progress-value">${Math.round(progress.energy.current)}</span>
          <span class="progress-label">/ ${progress.energy.goal} kcal</span>
        </div>
      `;
    }

    if (elements.protein) {
      elements.protein.innerHTML = `
        <div class="progress-ring" style="--progress: ${progress.protein.percentage}">
          <span class="progress-value">${Math.round(progress.protein.current)}g</span>
          <span class="progress-label">/ ${progress.protein.goal}g</span>
        </div>
      `;
    }

    if (elements.fat) {
      elements.fat.innerHTML = `
        <div class="progress-ring" style="--progress: ${progress.fat.percentage}">
          <span class="progress-value">${Math.round(progress.fat.current)}g</span>
          <span class="progress-label">/ ${progress.fat.goal}g</span>
        </div>
      `;
    }

    if (elements.carbs) {
      elements.carbs.innerHTML = `
        <div class="progress-ring" style="--progress: ${progress.carbs.percentage}">
          <span class="progress-value">${Math.round(progress.carbs.current)}g</span>
          <span class="progress-label">/ ${progress.carbs.goal}g</span>
        </div>
      `;
    }
  }

  createMeal() {
    const mealName = prompt('Nombre de la comida (ej: Desayuno, Almuerzo):');
    if (!mealName) return;

    const meal = this.mealPlanner.createMeal(mealName, this.currentDate);
    this.currentMealId = meal.id;
    this.showToast(`Comida "${mealName}" creada`);
    this.renderMealList();
  }

  deleteMeal(mealId) {
    if (confirm('¿Eliminar esta comida?')) {
      this.mealPlanner.removeMeal(mealId);
      saveMeals(this.mealPlanner.getMeals());
      this.renderMealList();
      this.renderDailySummary();
    }
  }

  showAddFoodModal() {
    const modal = document.getElementById('add-food-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  hideAddFoodModal() {
    const modal = document.getElementById('add-food-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showScanModal() {
    const modal = document.getElementById('scan-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  hideScanModal() {
    const modal = document.getElementById('scan-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showManualFoodModal() {
    const modal = document.getElementById('manual-food-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  hideManualFoodModal() {
    const modal = document.getElementById('manual-food-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target.result;

      // Show loading state
      const loadingEl = document.getElementById('scan-loading');
      if (loadingEl) {
        loadingEl.style.display = 'block';
      }

      try {
        // In a real app, this would call the OCR service
        // For now, we'll simulate with a mock
        const nutritionData = await this.processImage(imageUrl);
        this.showParsedNutrition(nutritionData);
      } catch (error) {
        console.error('Error processing image:', error);
        this.showToast('Error al procesar la imagen');
      } finally {
        if (loadingEl) {
          loadingEl.style.display = 'none';
        }
      }
    };
    reader.readAsDataURL(file);
  }

  async processImage(imageUrl) {
    // This would call the OCR service in production
    // For now, return mock data based on the images provided
    return {
      name: 'Producto escaneado',
      nutrition: {
        energy: 549,
        fat: 33,
        saturatedFat: 13,
        carbohydrates: 55,
        sugars: 45,
        fiber: 2.4,
        protein: 6.8,
        salt: 0.18,
      },
    };
  }

  showParsedNutrition(nutritionData) {
    const resultEl = document.getElementById('scan-result');
    if (resultEl) {
      resultEl.innerHTML = `
        <h3>${nutritionData.name}</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="nutrition-value">${nutritionData.nutrition.energy}</span>
            <span class="nutrition-label">kcal</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${nutritionData.nutrition.protein}g</span>
            <span class="nutrition-label">proteína</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${nutritionData.nutrition.fat}g</span>
            <span class="nutrition-label">grasa</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${nutritionData.nutrition.carbohydrates}g</span>
            <span class="nutrition-label">carb</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="app.addScannedFood()">
          Agregar a la comida
        </button>
      `;
      resultEl.style.display = 'block';
    }
  }

  addScannedFood() {
    // In a real app, this would add the scanned food to the current meal
    this.showToast('Alimento agregado');
    this.hideScanModal();
    this.renderMealList();
  }

  changeDate(delta) {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() + delta);
    this.currentDate = date.toISOString().split('T')[0];
    this.renderHeader();
    this.renderMealList();
    this.renderDailySummary();
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new NutritionApp();
});

export default app;