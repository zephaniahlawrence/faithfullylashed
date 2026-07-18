// List of HTML pages to search
const pagesToSearch = ['index.html', 'services(finalized).html', 'contact.html'];

async function searchPages() {
    const query = document.getElementById('searchinput').value.toLowerCase();
    const resultsList = document.getElementById('results-list');
    resultsList.style.display = 'block';
    resultsList.innerHTML = ''; // Clear previous results

    if (query.trim() === '') {
        resultsList.innerHTML = '<li>Please enter a search term.</li>';
        return;
    }

    // Iterate over each page and fetch its content
    for (const pageUrl of pagesToSearch) {
        try {
            const response = await fetch(pageUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const htmlText = await response.text(); // Get raw HTML as text

            // Search the retrieved text for the query
            if (htmlText.toLowerCase().includes(query)) {
                // If a match is found, add a link to the results list
                const listItem = document.createElement('li');
                listItem.innerHTML = `Found "${query}" in <a href="${pageUrl}" class="hoversearchlink">&nbsp;${pageUrl}</a>`;
                resultsList.appendChild(listItem);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            const errorItem = document.createElement('li');
            errorItem.textContent = `Error loading ${pageUrl}`;
            resultsList.appendChild(errorItem);
        }
    }

    if (resultsList.children.length === 0) {
        resultsList.innerHTML = '<li>No matches found.</li>';
    }
}



    const query = document.getElementById('searchinput');
    document.querySelector('.searchform').addEventListener('submit', function(event) {
        event.preventDefault();
        const input = query.value;
        // alert(input);
        searchPages(input);
        // document.querySelector('.search').classList.remove('expand');
    });


    const searchwindow = document.querySelector('.searchwindow')
    const listItem = document.querySelector('#results-list')
    document.addEventListener('click', function(event) {
        // Check if the clicked element is not the popup itself and not a descendant of the popup
        if (!searchwindow.contains(event.target) && event.target !== document.querySelector('button')) {
            listItem.innerHTML = "";
            const resultsList = document.getElementById('results-list');
            resultsList.style.display = 'none';
            document.querySelector('.searchwindow').classList.remove('active');
            // popup.style.display = 'none';

        }
    })
