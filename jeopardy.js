
const BASE_API_URL = "http://localhost:3000/api"; 
let categories = [];
const NUM_CATEGORIES = 6; 
const NUM_QUESTIONS_PER_CAT = 5
async function getCategoryIds() {
  try {
    const response = await axios.get(`${BASE_API_URL}/categories?count=100`);
    const shuffled = _.shuffle(response.data); 
    const selectedCategories = shuffled.slice(0, NUM_CATEGORIES);
    console.log(selectedCategories); 
    return selectedCategories.map(cat => cat.id);
  } catch (error) {
    console.error("Error fetching category IDs:", error);
  }
}


async function getCategory(catId) {
  try {
    const response = await axios.get(`${BASE_API_URL}/category?id=${catId}`);
    return response.data; 
  } catch (error) {
    console.error(`Error fetching category ${catId}:`, error);
  }
}
async function fillTable() {
  const categoryIds = await getCategoryIds(); 
  const categoriesDataPromises = categoryIds.map(catId => getCategory(catId)); 
  categories = await Promise.all(categoriesDataPromises); 
  console.log(categories.length);
  const thead = $('#jeopardy thead tr');
  categories.forEach((cat, catIdx) => {
    thead.append(`<th>${cat.title}</th>`);
  });
  const tbody = $('#jeopardy tbody');
  tbody.empty(); 
  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) { 
    const row = $('<tr>');
    categories.forEach((cat, catIdx) => {
      row.append(`<td data-id="${catIdx}-${i}">?</td>`); 
    });
    tbody.append(row);
  }
}

function handleClick(evt) {
  const $target = $(evt.target);
  const [catIdx, clueIdx] = $target.data('id').split('-').map(Number); 
  const clue = categories[catIdx].clues[clueIdx];
  if (!clue.showing) {
    clue.showing = "question";
    $target.text(clue.question);
  } else if (clue.showing === "question") {
    clue.showing = "answer";
    $target.text(clue.answer);
  }
}



function showLoadingView() {
  $('#loading').show();
  $("#categories").empty();
  $("#clues").empty();
}

function hideLoadingView() {
  $('#loading').hide();
}

async function setupAndStart() {
  showLoadingView();
  await fillTable();
  hideLoadingView();
  $("#start")
    .addClass("d-none");
    $("#restart")
    .removeClass("d-none")
}


$(function() {
  $('#start').on('click', setupAndStart);
  $('#jeopardy tbody').on('click', 'td', handleClick);
  
});

$('#restart').on('click', setupAndStart);