const getMockData = (entityName) => JSON.parse(localStorage.getItem(`mock_${entityName}`) || '[]');
const setMockData = (entityName, data) => localStorage.setItem(`mock_${entityName}`, JSON.stringify(data));

const createEntityStore = (entityName) => ({
    list: async (sortBy = '', limit = 100) => {
        let data = getMockData(entityName);
        if (sortBy === '-created_date' || sortBy === '-created_at') {
            data = data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (sortBy) {
            const field = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
            const dir = sortBy.startsWith('-') ? -1 : 1;
            data = data.sort((a, b) => (a[field] > b[field] ? dir : -dir));
        }
        return data.slice(0, limit);
    },
    filter: async (query, sortBy = '') => {
        let data = getMockData(entityName);
        data = data.filter(item => Object.keys(query).every(key => item[key] === query[key]));
        if (sortBy) {
            const field = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
            const dir = sortBy.startsWith('-') ? -1 : 1;
            data = data.sort((a, b) => (a[field] > b[field] ? dir : -dir));
        }
        return data;
    },
    create: async (payload) => {
        const data = getMockData(entityName);
        const newItem = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() };
        data.push(newItem);
        setMockData(entityName, data);
        return newItem;
    },
    update: async (id, payload) => {
        const data = getMockData(entityName);
        const index = data.findIndex(item => item.id === id);
        if (index > -1) {
            data[index] = { ...data[index], ...payload };
            setMockData(entityName, data);
            return data[index];
        }
        throw new Error('Not found');
    },
    delete: async (id) => {
        const data = getMockData(entityName);
        setMockData(entityName, data.filter(item => item.id !== id));
        return true;
    }
});

export const base44 = {
    entities: {
        Trip: createEntityStore('Trip'),
        Stop: createEntityStore('Stop'),
        Activity: createEntityStore('Activity'),
        ChecklistItem: createEntityStore('ChecklistItem'),
        Expense: createEntityStore('Expense'),
        TripNote: createEntityStore('TripNote')
    },
    auth: {
        me: async () => {
            const user = JSON.parse(localStorage.getItem('current_user'));
            if (!user) throw { type: 'auth_required', status: 401 };
            return user;
        },
        login: async (email, password) => {
            const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('current_user', JSON.stringify({ id: user.id, email: user.email, name: user.name }));
                return true;
            }
            throw new Error('Invalid credentials');
        },
        signup: async (name, email, password) => {
            const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
            if (users.find(u => u.email === email)) throw new Error('Email already exists');
            const newUser = { id: crypto.randomUUID(), name, email, password };
            users.push(newUser);
            localStorage.setItem('mock_users', JSON.stringify(users));
            localStorage.setItem('current_user', JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name }));
            return true;
        },
        logout: async () => {
            localStorage.removeItem('current_user');
            window.location.href = '/';
        },
        redirectToLogin: async () => { window.location.href = '/'; }
    }
};
