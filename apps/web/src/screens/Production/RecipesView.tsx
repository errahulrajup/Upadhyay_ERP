import React, { useEffect, useState } from 'react';
import { productionApi } from '../../lib/bosApi';
import { BookOpen } from 'lucide-react';
import RecipeQcConfigModal from './RecipeQcConfigModal';

export default function RecipesView() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    const { data } = await productionApi.getRecipes();
    if (data) setRecipes(data);
    setLoading(false);
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Master Recipes</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Active production formulas promoted from R&D.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} /> New Recipe
        </button>
      </div>

      {loading ? (
        <p>Loading Recipes...</p>
      ) : (
        <div className="grid-3">
          {recipes.map(recipe => (
            <div key={recipe.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--primary-accent)' }}>{recipe.product}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Version {recipe.version}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">{recipe.status}</span>
                <button className="btn-secondary" onClick={() => setSelectedRecipe(recipe)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  QC Config
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedRecipe && (
        <RecipeQcConfigModal 
          isOpen={true} 
          onClose={() => setSelectedRecipe(null)} 
          recipeId={selectedRecipe.id} 
          recipeName={selectedRecipe.product} 
        />
      )}
    </div>
  );
}
