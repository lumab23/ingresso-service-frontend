const API_BASE_URL = 'https://ingressos-backend-production.up.railway.app';
const SESSAO_API_URL = 'https://cinemasessao-production.up.railway.app';

const ticketForm = document.getElementById('ticketForm');
const ticketsList = document.getElementById('ticketsList');
const sessaoSelect = document.getElementById('sessao');
const sessionsGrid = document.getElementById('sessionsGrid');

let sessaoMap = {};

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 200)) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const showMessage = (message, type = 'success') => {
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    const currentSection = document.querySelector('section:target, section:first-of-type');
    if (currentSection) {
        const container = currentSection.querySelector('.container');
        if (container) {
            container.insertBefore(messageDiv, container.firstChild);
        }
    }

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
};

const createTicketCard = (ticket) => {
    const card = document.createElement('div');
    card.className = 'ticket-card';

    card.innerHTML = `
        <h3>${ticket.filmeTitulo}</h3>
        <p><strong>Data da Sessão:</strong> ${formatDate(ticket.dataHoraSessao)}</p>
        <p><strong>Sala:</strong> ${ticket.sala}</p>
        <p class="price">${formatCurrency(ticket.preco)}</p>
    `;
    return card;
};

const createSessionCard = (sessao) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    

    card.innerHTML = `
        <div class="movie-card-content">
            ${sessao.filme?.titulo ? `<h3>${sessao.filme.titulo}</h3>` : ''}
            ${sessao.filme?.diretor ? `<p class="director">Diretor: ${sessao.filme.diretor}</p>` : ''}
            <p><strong>Data:</strong> ${formatDate(sessao.dataHora)}</p>
            <p><strong>Sala:</strong> ${sessao.sala}</p> 
            <p class="price">${formatCurrency(sessao.preco)}</p>
            <button class="select-movie" data-sessao-id="${sessao._id}">
                <i class="fas fa-ticket-alt"></i> Selecionar Sessão
            </button>
        </div>
    `;

    const selectButton = card.querySelector('.select-movie');
    selectButton.addEventListener('click', () => {
        // Corrigido para passar sessao._id
        selectSession(sessao._id); 
    });

    return card;
};

const selectSession = (sessaoId) => {
    sessaoSelect.value = sessaoId;
    document.getElementById('ingressos').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
};

const loadSessoes = async () => {
    try {
        // Chame diretamente a API de sessões
        const response = await axios.get(`${SESSAO_API_URL}/sessoes`); 
        const sessoes = response.data;

        sessaoSelect.innerHTML = '<option value="">Selecione uma sessão</option>';
        sessionsGrid.innerHTML = '';

        if (sessoes.length === 0) {
            sessionsGrid.innerHTML = '<p class="no-movies">Nenhuma sessão disponível no momento.</p>';
            return;
        }

        sessoes.forEach(sessao => {
            // Use os nomes corretos dos campos: sessao._id, sessao.dataHora, sessao.sala
            sessaoMap[sessao._id] = `${sessao.filme?.titulo || ''} - ${formatDate(sessao.dataHora)}`;


            const option = document.createElement('option');
            option.value = sessao._id; 
            const titulo = sessao.filme?.titulo ? `${sessao.filme.titulo} - ` : '';
            option.textContent = `${titulo}${formatDate(sessao.dataHora)} - Sala ${sessao.sala}`;
            sessaoSelect.appendChild(option);

            sessionsGrid.appendChild(createSessionCard(sessao));
        });
    } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        showMessage('Erro ao carregar sessões disponíveis.', 'error');
    }
};

const loadTickets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ingressos`);
        ticketsList.innerHTML = '';

        if (response.data.length === 0) {
            ticketsList.innerHTML = '<p>Nenhum ingresso encontrado.</p>';
            return;
        }

        response.data.forEach(ticket => {
            ticketsList.appendChild(createTicketCard(ticket));
        });
    } catch (error) {
        console.error('Erro ao carregar ingressos:', error);
        showMessage('Erro ao carregar ingressos. Tente novamente mais tarde.', 'error');
    }
};

ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        sessaoId: sessaoSelect.value
    };

    try {
        await axios.post(`${API_BASE_URL}/ingressos`, formData);
        showMessage('Ingresso comprado com sucesso!');
        ticketForm.reset();
        loadTickets();
    } catch (error) {
        console.error('Erro ao comprar ingresso:', error);
        showMessage(
            error.response?.data?.message || 'Erro ao comprar ingresso. Tente novamente.',
            'error'
        );
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links-container');
    const navLinks = document.querySelectorAll('.nav-links a');

    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // fecha o menu quando clica em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // fecha o menu quando clica fora
    document.addEventListener('click', (e) => {
        if (!hamburgerMenu.contains(e.target) && !navLinksContainer.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    await loadSessoes();
    await loadTickets();
});
