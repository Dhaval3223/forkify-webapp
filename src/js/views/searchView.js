import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
}

export const clearResult = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

// export const highlightSelected = (id) => {
//     // const resultsArr = Array.from(document.querySelectorAll(".results__link"));
//     // resultsArr.forEach((el) => {
//     // el.classList.remove("results__link--active");
//     // });
//     document.querySelector(`.results__link[href*="#${id}"]`).classList.add("results__link--active");
// };


export const limitRecipetitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        },0);

        // return the result
        return `${newTitle.join(' ')}...`;
    }
    return title;
}

const renderRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipetitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
    </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

const creatButton = (page, type) =>`
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    </button>
`

const randerButton = (page, numResults, resultPerPage) => {
    const pages = Math.ceil(numResults / resultPerPage );

    let button;
    if(page === 1 && pages > 1){
        // need only next button
        button = creatButton(page, 'next');
    }else if(page < pages){
        button = `
        ${button = creatButton(page, 'prev')}
        ${button = creatButton(page, 'next')}
        `
    } else if (page === pages && pages > 1 ) {
        // button for only prev
        button = creatButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resultPerPage = 10 ) => {
    // render results if current page
    const start = (page - 1) * resultPerPage;
    const end = page * resultPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    // rander pagination button
    randerButton(page, recipes.length, resultPerPage);
}

