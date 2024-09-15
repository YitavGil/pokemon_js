document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const pokemonCard = document.getElementById('pokemon-card');
    const autocompleteList = document.getElementById('autocomplete-list');
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');

    prevButton.textContent = '<';
    nextButton.textContent = '>';
    prevButton.className = 'nav-button prev-button';
    nextButton.className = 'nav-button next-button';

    const cardContainer = document.querySelector('.card-container');

    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };

    let currentPokemonId = 1;
    let allPokemon = [];

    if (searchButton) {
        searchButton.addEventListener('click', searchPokemon);
    }
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleKeyDown);
    }
    prevButton.addEventListener('click', () => navigatePokemon(-1));
    nextButton.addEventListener('click', () => navigatePokemon(1));

 
    fetchAllPokemon();

    async function fetchAllPokemon() {
        try {
            // בקשה לקבל אלף פוקימונים
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
            // להמיר את הבקשה מ-JSON
            const data = await response.json();
            // מיפוי לפי שם
            allPokemon = data.results.map(pokemon => pokemon.name);

        } catch (error) {
            // שגיאה בלהביא את הפוקימונים
            console.error('Error fetching Pokémon list:', error);
        }
    }

    async function searchPokemon() {
        const pokemonNameOrId = searchInput.value.toLowerCase();
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`);
            
            if (response.status === 404) {
                displayNotFound();
            } else {
                const data = await response.json();
                displayPokemonInfo(data);
                currentPokemonId = data.id;
                updateNavButtons();
            }
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            displayNotFound();
        }
    }

    function displayPokemonInfo(pokemon) {
        if (pokemonCard) {
            pokemonCard.innerHTML = '';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'pokemon-image-container';
            const image = document.createElement('img');
            image.src = pokemon.sprites.front_default;
            image.id = 'pokemon-image';
            image.alt = pokemon.name;
            imageContainer.appendChild(image);

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const name = document.createElement('h2');
            name.id = 'pokemon-name';
            name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

            const details = document.createElement('div');
            details.id = 'pokemon-details';
            details.className = 'details-grid';

            const leftDetails = document.createElement('div');
            leftDetails.className = 'left-details';
            const type = document.createElement('p');
            type.id = 'pokemon-type';
            type.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;
            const height = document.createElement('p');
            height.id = 'pokemon-height';
            height.textContent = `Height: ${pokemon.height / 10} m`;
            leftDetails.append(type, height);

            const rightDetails = document.createElement('div');
            rightDetails.className = 'right-details';
            const weight = document.createElement('p');
            weight.id = 'pokemon-weight';
            weight.textContent = `Weight: ${pokemon.weight / 10} kg`;
            const abilities = document.createElement('p');
            abilities.id = 'pokemon-abilities';
            abilities.textContent = `Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}`;
            rightDetails.append(weight, abilities);

            details.append(leftDetails, rightDetails);

            const stats = document.createElement('div');
            stats.id = 'pokemon-stats';
            pokemon.stats.forEach(stat => {
                const statElement = document.createElement('p');
                statElement.textContent = `${stat.stat.name}: ${stat.base_stat}`;
                stats.appendChild(statElement);
            });

            cardContent.append(name, details, stats);
            pokemonCard.append(imageContainer, cardContent);
            
            const mainType = pokemon.types[0].type.name;
            const typeColor = typeColors[mainType] || '#f0f0f0';
            
            pokemonCard.classList.remove('hidden');
            document.body.style.background = `linear-gradient(to bottom right, white, ${typeColor})`;
            imageContainer.style.borderColor = typeColor;

            if (!cardContainer.contains(prevButton)) {
                cardContainer.insertBefore(prevButton, pokemonCard);
            }
            if (!cardContainer.contains(nextButton)) {
                cardContainer.appendChild(nextButton);
            }
        }
    }

    function displayNotFound() {
        if (pokemonCard) {
            pokemonCard.innerHTML = '';

            const notFoundContainer = document.createElement('div');
            notFoundContainer.className = 'not-found-container';

            const notFoundImage = document.createElement('img');
            notFoundImage.src = 'https://upload.wikimedia.org/wikipedia/en/b/b7/Missingno.png';
            notFoundImage.alt = 'Missingno';
            notFoundImage.className = 'not-found-image';

            const notFoundText = document.createElement('p');
            notFoundText.className = 'not-found-text';
            notFoundText.textContent = 'Pokemon not found';

            notFoundContainer.append(notFoundImage, notFoundText);
            pokemonCard.appendChild(notFoundContainer);

            pokemonCard.classList.remove('hidden');
            document.body.style.background = 'linear-gradient(to bottom right, white, #f0f0f0)';

            prevButton.remove();
            nextButton.remove();
        }
    }

    async function navigatePokemon(direction) {
        currentPokemonId += direction;
        if (currentPokemonId < 1) currentPokemonId = 1;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemonId}`);
            const data = await response.json();
            displayPokemonInfo(data);
            updateNavButtons();
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
            currentPokemonId -= direction;
        }
    }

    function updateNavButtons() {
        prevButton.style.visibility = currentPokemonId === 1 ? 'hidden' : 'visible';
        nextButton.style.visibility = 'visible';
    }

    function handleSearchInput() {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.length > 0) {
            const matchingPokemon = allPokemon
                .filter(pokemon => pokemon.startsWith(searchTerm))
                .slice(0, 5);
            displayAutocomplete(matchingPokemon);
        } else {
            if (autocompleteList) {
                autocompleteList.innerHTML = '';
            }
        }
    }

    function displayAutocomplete(pokemonList) {
        if (autocompleteList) {
            autocompleteList.innerHTML = '';
            pokemonList.forEach((pokemon, index) => {
                const div = document.createElement('div');
                div.textContent = pokemon;
                div.dataset.index = index;
                div.addEventListener('click', () => {
                    selectAutocompleteItem(pokemon);
                });
                autocompleteList.appendChild(div);
            });
        }
    }

    function selectAutocompleteItem(pokemon) {
        if (searchInput) {
            searchInput.value = pokemon;
        }
        autocompleteList.innerHTML = '';
        searchPokemon();
    }

    function handleKeyDown(e) {
        const items = autocompleteList.children;
        let selectedIndex = -1;

        for (let i = 0; i < items.length; i++) {
            if (items[i].classList.contains('selected')) {
                selectedIndex = i;
                break;
            }
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (selectedIndex < items.length - 1) {
                    if (selectedIndex > -1) {
                        items[selectedIndex].classList.remove('selected');
                    }
                    items[selectedIndex + 1].classList.add('selected');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (selectedIndex > 0) {
                    items[selectedIndex].classList.remove('selected');
                    items[selectedIndex - 1].classList.add('selected');
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex > -1) {
                    selectAutocompleteItem(items[selectedIndex].textContent);
                } else {
                    searchPokemon();
                }
                break;
        }
    }

    document.addEventListener('click', function(e) {
        if (autocompleteList && !autocompleteList.contains(e.target) && e.target !== searchInput) {
            autocompleteList.innerHTML = '';
        }
    });
});