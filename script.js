const API_BASE_URL = 'https://ingressos-backend-production.up.railway.app';
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
    // Remove any existing messages first
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    // Find the current section's container
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

    const sessaoInfo = sessaoMap[ticket.sessaoId] || `Sessão ID: ${ticket.sessaoId}`;

    card.innerHTML = `
        <h3>${sessaoInfo}</h3>
        <p><strong>Assento:</strong> ${ticket.codigoAssento}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Data da Compra:</strong> ${formatDate(ticket.dataCompra)}</p>
        <p class="price">${formatCurrency(ticket.preco)}</p>
    `;
    return card;
};

const createSessionCard = (sessao) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    card.innerHTML = `
        <div class="movie-card-content">
            <h3>${sessao.filme.titulo}</h3>
            <p class="director">Diretor: ${sessao.filme.diretor}</p>
            <p><strong>Data:</strong> ${formatDate(sessao.horario)}</p>
            <p><strong>Sala:</strong> ${sessao.salaId}</p>
            <p class="price">${formatCurrency(sessao.preco)}</p>
            <button class="select-movie" data-sessao-id="${sessao.id}">
                <i class="fas fa-ticket-alt"></i> Selecionar Sessão
            </button>
        </div>
    `;

    // Add click event to the select button
    const selectButton = card.querySelector('.select-movie');
    selectButton.addEventListener('click', () => {
        selectSession(sessao.id);
    });

    return card;
};

const selectSession = (sessaoId) => {
    // Set the selected session in the form
    sessaoSelect.value = sessaoId;
    
    // Scroll to the ticket form
    document.getElementById('sessoes').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
};

const loadSessoes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ingressos/sessoes`);
        const sessoes = response.data;

        // Clear existing content
        sessaoSelect.innerHTML = '<option value="">Selecione uma sessão</option>';
        sessionsGrid.innerHTML = '';

        if (sessoes.length === 0) {
            sessionsGrid.innerHTML = '<p class="no-movies">Nenhuma sessão disponível no momento.</p>';
            return;
        }

        sessoes.forEach(sessao => {
            sessaoMap[sessao.id] = `${sessao.filme.titulo} - ${formatDate(sessao.horario)}`;

            // Add to select dropdown
            const option = document.createElement('option');
            option.value = sessao.id;
            option.textContent = `${sessao.filme.titulo} - ${formatDate(sessao.horario)} - Sala ${sessao.salaId}`;
            sessaoSelect.appendChild(option);

            // Add to sessions grid
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
        sessaoId: sessaoSelect.value,
        usuarioId: "usuario-teste",
        codigoAssento: document.getElementById('codigoAssento').value,
        status: "CONFIRMADO"
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
    await loadSessoes();
    await loadTickets();
});
