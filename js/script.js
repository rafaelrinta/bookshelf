let books = [];
let categories = [];
const RENDER_EVENT = 'render-book';
const RENDER_CATEGORY_EVENT = 'render-category';
const STORAGE_KEY_BOOK = 'BOOK_APPS';
const STORAGE_KEY_CATEGORY = 'CATEGORY_APPS';
let bookToUpdate = null;

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, publisher, pages, category) {
    return {
        id,
        title,
        author,
        year,
        publisher,
        pages,
        category
    };
}

function generateCategoryObject(id, name) {
    return {
        id,
        name
    };
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    const textPublisher = document.createElement('p');
    textPublisher.innerText = `Penerbit: ${bookObject.publisher}`;

    const textPages = document.createElement('p');
    textPages.innerText = `Jumlah Halaman: ${bookObject.pages}`;

    const textCategory = document.createElement('p');
    textCategory.innerText = `Kategori: ${bookObject.category}`;

    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear, textPublisher, textPages, textCategory);

    const container = document.createElement('div');
    container.classList.add('action');
    textContainer.append(container);
    container.setAttribute('id', `book-${bookObject.id}`);

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus buku';

    trashButton.addEventListener('click', function () {
        showDeleteConfirmation(bookObject);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('yellow');
    editButton.innerText = 'Edit buku';

    editButton.addEventListener('click', function () {
        document.getElementById('updateBookTitle').value = bookObject.title;
        document.getElementById('updateBookAuthor').value = bookObject.author;
        document.getElementById('updateBookYear').value = bookObject.year;
        document.getElementById('updateBookPublisher').value = bookObject.publisher;
        document.getElementById('updateBookPages').value = bookObject.pages;
        document.getElementById('updateBookCategory').value = bookObject.category;
        bookToUpdate = bookObject;
    });

    container.append(trashButton, editButton);

    return textContainer;
}

function makeCategory(categoryObject) {
    const textName = document.createElement('p');
    textName.innerText = categoryObject.name;

    const textContainer = document.createElement('article');
    textContainer.classList.add('category_item');
    textContainer.append(textName);

    const container = document.createElement('div');
    container.classList.add('action');
    textContainer.append(container);
    container.setAttribute('id', `category-${categoryObject.id}`);

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus kategori';

    trashButton.addEventListener('click', function () {
        removeCategory(categoryObject.id);
    });

    container.append(trashButton);

    return textContainer;
}


function addBook() {
    const addTitle = document.getElementById('inputBookTitle').value;
    const addAuthor = document.getElementById('inputBookAuthor').value;
    const addYear = parseInt(document.getElementById('inputBookYear').value, 10);
    const addPublisher = document.getElementById('inputBookPublisher').value;
    const addPages = parseInt(document.getElementById('inputBookPages').value, 10);
    const addCategory = document.getElementById('inputBookCategory').value;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, addTitle, addAuthor, addYear, addPublisher, addPages, addCategory);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function updateBook() {
    if (!bookToUpdate) return;

    const updatedTitle = document.getElementById('updateBookTitle').value;
    const updatedAuthor = document.getElementById('updateBookAuthor').value;
    const updatedYear = parseInt(document.getElementById('updateBookYear').value, 10);
    const updatedPublisher = document.getElementById('updateBookPublisher').value;
    const updatedPages = parseInt(document.getElementById('updateBookPages').value, 10);
    const updatedCategory = document.getElementById('updateBookCategory').value;

    bookToUpdate.title = updatedTitle;
    bookToUpdate.author = updatedAuthor;
    bookToUpdate.year = updatedYear;
    bookToUpdate.publisher = updatedPublisher;
    bookToUpdate.pages = updatedPages;
    bookToUpdate.category = updatedCategory;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('updateBook').reset();
    bookToUpdate = null;
}

function addCategory() {
    const addCategoryName = document.getElementById('inputCategoryName').value;

    const generatedID = generateId();
    const categoryObject = generateCategoryObject(generatedID, addCategoryName);
    categories.push(categoryObject);

    document.dispatchEvent(new Event(RENDER_CATEGORY_EVENT));
    saveData();
}

function updateCategory() {
    const oldCategoryName = document.getElementById('updateCategoryOld').value;
    const newCategoryName = document.getElementById('updateCategoryNew').value;

    const categoryIndex = categories.findIndex(category => category.name === oldCategoryName);
    if (categoryIndex === -1) return;

    categories[categoryIndex].name = newCategoryName;

    books.forEach(book => {
        if (book.category === oldCategoryName) {
            book.category = newCategoryName;
        }
    });

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(RENDER_CATEGORY_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeCategory(categoryId) {
    const categoryIndex = findCategoryIndex(categoryId);

    if (categoryIndex === -1) return;

    const categoryName = categories[categoryIndex].name;

    books = books.filter(book => book.category !== categoryName);
    categories.splice(categoryIndex, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(RENDER_CATEGORY_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function findCategoryIndex(categoryId) {
    for (const index in categories) {
        if (categories[index].id === categoryId) {
            return index;
        }
    }

    return -1;
}

function loadDataFromStorage() {
    const serializedBooksData = localStorage.getItem(STORAGE_KEY_BOOK);
    const serializedCategoriesData = localStorage.getItem(STORAGE_KEY_CATEGORY);

    let dataBooks = JSON.parse(serializedBooksData);
    let dataCategories = JSON.parse(serializedCategoriesData);

    if (dataBooks !== null) {
        for (const book of dataBooks) {
            books.push(book);
        }
    }

    if (dataCategories !== null) {
        for (const category of dataCategories) {
            categories.push(category);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(RENDER_CATEGORY_EVENT));
}

function updateFilterYearOptions() {
    const filterYearSelect = document.getElementById('filterYear');
    const years = Array.from(new Set(books.map(book => book.year))).sort((a, b) => a - b);

    filterYearSelect.innerHTML = '<option value="all">Semua</option>';
    for (const year of years) {
        const optionElement = document.createElement('option');
        optionElement.value = year;
        optionElement.innerText = year;
        filterYearSelect.append(optionElement);
    }
}

function filterBooks() {
    const filterCategory = document.getElementById('filterCategory').value;
    const filterYear = document.getElementById('filterYear').value;
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const searchAuthor = document.getElementById('searchBookAuthor').value.toLowerCase();
    const searchPublisher = document.getElementById('searchBookPublisher').value.toLowerCase();
    const bookshelfList = document.getElementById('bookshelfList');
    bookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const matchesCategory = filterCategory === 'all' || bookItem.category === filterCategory;
        const matchesYear = filterYear === 'all' || bookItem.year.toString() === filterYear;
        const matchesTitle = bookItem.title.toLowerCase().includes(searchTitle);
        const matchesAuthor = bookItem.author.toLowerCase().includes(searchAuthor);
        const matchesPublisher = bookItem.publisher.toLowerCase().includes(searchPublisher);

        if (matchesCategory && matchesYear && matchesTitle && matchesAuthor && matchesPublisher) {
            const bookElement = makeBook(bookItem);
            bookshelfList.append(bookElement);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitBookForm = document.getElementById('inputBook');
    submitBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const submitCategoryForm = document.getElementById('inputCategory');
    submitCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addCategory();
    });

    const updateBookForm = document.getElementById('updateBook');
    updateBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        updateBook();
    });

    const updateCategoryForm = document.getElementById('updateCategory');
    updateCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault();
        updateCategory();
    });

    const filterCategorySelect = document.getElementById('filterCategory');
    filterCategorySelect.addEventListener('change', filterBooks);

    const filterYearSelect = document.getElementById('filterYear');
    filterYearSelect.addEventListener('change', filterBooks);

    const searchBookForm = document.getElementById('searchBookForm');
    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        filterBooks();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    filterBooks();
    updateFilterYearOptions();
});

document.addEventListener(RENDER_EVENT, function () {
    const bookshelfList = document.getElementById('bookshelfList');
    bookshelfList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        bookshelfList.append(bookElement);
    }
});

document.addEventListener(RENDER_CATEGORY_EVENT, function () {
    const categoryList = document.getElementById('categoryList');
    const inputCategorySelect = document.getElementById('inputBookCategory');
    const updateCategorySelect = document.getElementById('updateBookCategory');
    const updateCategoryOldSelect = document.getElementById('updateCategoryOld');
    const filterCategorySelect = document.getElementById('filterCategory');

    categoryList.innerHTML = '';
    inputCategorySelect.innerHTML = '';
    updateCategorySelect.innerHTML = '';
    updateCategoryOldSelect.innerHTML = '';
    filterCategorySelect.innerHTML = '<option value="all">Semua</option>';

    for (const categoryItem of categories) {
        const categoryElement = makeCategory(categoryItem);
        categoryList.append(categoryElement);

        const optionElement = document.createElement('option');
        optionElement.value = categoryItem.name;
        optionElement.innerText = categoryItem.name;
        inputCategorySelect.append(optionElement);
        updateCategorySelect.append(optionElement.cloneNode(true));
        updateCategoryOldSelect.append(optionElement.cloneNode(true));
        filterCategorySelect.append(optionElement.cloneNode(true));
    }
});

document.getElementById('filterYear').addEventListener('change', filterBooks);

document.addEventListener(RENDER_EVENT, function () {
    updateFilterYearOptions();
});

document.getElementById('searchSubmit').addEventListener('click', function (event) {
    event.preventDefault();
    filterBooks();
});
