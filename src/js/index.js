// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe'
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * -search object
 * 
  */

const state = {};

const controlSearch = async () => {
  // 1) get query from the view
  const query = searchView.getInput();
  
  
  if(query){
    // 2) New Search object and add it to state
    state.search = new Search(query);

    // 3) prepare UI for result
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);
    try{
      
      // 4) Search recepies
      await state.search.getResults();
  
      //  5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (e) {
      console.log('something went wrong with search');
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});



elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
  }
});


/**
 * recipe constroller
 */

const controlRecipe = async () => {
  // get id from URL
  const id = window.location.hash.replace('#', ' ');

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // highlight selected search 
    // if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // get recipe data and parce the ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
  
      // calc survings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
  
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );
      
    } catch (err) {
      console.log(err); 
      alert("error processing recipe");
    }
  }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * List Controller
 */

const controlList = () => {
  // Create a new list IF there in none yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  }); 
};

// handle delete and upafate list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // delete from the state
    state.list.deleteItem(id);

    // delete from the UI
    listView.deleteItem(id);
  }
  // upadte the list
  else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value,10);
    state.list.updateCount(id, val);
  }

  // 
});

/**
 * Like Controller
 */


const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  // use has NOT liked the current recipe
  if (!state.likes.isLiked(currentID)) {
    // add like to the state
    const newLike = state.likes.addLikes(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    )

    // toggle the like button
    likesView.toggleLikeBtn(true);

    // add like to the UI list
    likesView.renderLike(newLike);
  }else {
    // remove like to the state
    state.likes.deleteLike(currentID);

    // toggle the like button
    likesView.toggleLikeBtn(false);

    // remove like to the UI list
    likesView.deleteLike(currentID);
    // console.log(state.likes);
  }
  likesView.toggleLikesMenu(state.likes.getNumLikes());
};

window.addEventListener('load', () =>{
  state.likes = new Likes();

  // Restore Likes
  state.likes.readStorage();

  // toggle like menu button
  likesView.toggleLikesMenu(state.likes.getNumLikes());

  // rander existing likes
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')){
    if(state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  }
  else if(e.target.matches('.btn-increase, .btn-increase *')){
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
    // add ingredients to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // like controller
    controlLike();
  }
});

