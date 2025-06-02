// API base URL
const API_BASE_URL = 'ingresso-microservice-production.up.railway.app';


// DOM Elements
const ticketForm = document.getElementById('ticketForm');
const ticketsList = document.getElementById('ticketsList');

// Utility function to format date
const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
};

// Utility function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

// Function to display messages
const showMessage = (message, type = 'success') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
};

// Function to create ticket card
const createTicketCard = (ticket) => {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.innerHTML = `
        <h3>Ingresso #${ticket.id}</h3>
        <p><strong>Filme ID:</strong> ${ticket.filmeId}</p>
        <p><strong>Sessão ID:</strong> ${ticket.sessaoId}</p>
        <p><strong>Assento:</strong> ${ticket.codigoAssento}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Data da Compra:</strong> ${formatDate(ticket.dataCompra)}</p>
        <p class="price">${formatCurrency(ticket.preco)}</p>
    `;
    return card;
};

// Function to load tickets
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

// Handle form submission
ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        sessaoId: "sessao-teste", // Temporário para teste
        filmeId: "filme-teste",   // Temporário para teste
        usuarioId: "usuario-teste", // Temporário para teste
        preco: parseFloat(document.getElementById('price').value),
        codigoAssento: document.getElementById('codigoAssento').value,
        status: "CONFIRMADO"      // Status inicial
    };

    try {
        const response = await axios.post(`${API_BASE_URL}`, formData);
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

// Load tickets when page loads
document.addEventListener('DOMContentLoaded', loadTickets); 