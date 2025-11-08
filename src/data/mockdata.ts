// Données fictives pour l'application restaurant

export interface Admin {
  username: string;
  password: string;
  name: string;
}

export interface Option {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  options?: Option[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Table {
  id: string;
  number: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'validated' | 'completed';
  total: number;
  createdAt: Date;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: Option[];
}

// Identifiants administrateur
export const ADMIN_CREDENTIALS: Admin = {
  username: "admin",
  password: "admin123",
  name: "Administrateur"
};

// Catégories de menu
export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "🍔 Hamburgers",
    icon: "burger",
    color: "text-orange-500"
  },
  {
    id: "2",
    name: "🍕 Pizzas",
    icon: "pizza",
    color: "text-red-500"
  },
  {
    id: "3",
    name: "🥗 Salades",
    icon: "salad",
    color: "text-green-500"
  },
  {
    id: "4",
    name: "🥤 Boissons",
    icon: "drink",
    color: "text-blue-500"
  },
  {
    id: "5",
    name: "🍰 Desserts",
    icon: "cake",
    color: "text-pink-500"
  }
];

// Options personnalisables
export const BURGER_OPTIONS: Option[] = [
  { id: "opt1", name: "Fromage supplémentaire", price: 1.5 },
  { id: "opt2", name: "Bacon", price: 2.0 },
  { id: "opt3", name: "Œuf", price: 1.0 },
  { id: "opt4", name: "Sans oignon", price: 0 },
  { id: "opt5", name: "Sans tomate", price: 0 },
  { id: "opt6", name: "Sauce piquante", price: 0.5 }
];

export const PIZZA_OPTIONS: Option[] = [
  { id: "opt7", name: "Fromage supplémentaire", price: 2.0 },
  { id: "opt8", name: "Olives", price: 1.0 },
  { id: "opt9", name: "Champignons", price: 1.5 },
  { id: "opt10", name: "Poivrons", price: 1.0 },
  { id: "opt11", name: "Piment", price: 0.5 }
];

export const SALAD_OPTIONS: Option[] = [
  { id: "opt12", name: "Poulet grillé", price: 3.0 },
  { id: "opt13", name: "Thon", price: 2.5 },
  { id: "opt14", name: "Avocat", price: 2.0 },
  { id: "opt15", name: "Sans croutons", price: 0 }
];

// Menu items
export const MENU_ITEMS: MenuItem[] = [
  // Hamburgers
  {
    id: "item1",
    name: "Hamburger Royal",
    description: "Pain brioché, steak haché, fromage cheddar, sauce spéciale",
    price: 12.90,
    image: "🍔",
    categoryId: "1",
    options: BURGER_OPTIONS
  },
  {
    id: "item2",
    name: "Hamburger Jambon",
    description: "Pain aux graines, steak haché, jambon fumé, emmental",
    price: 11.50,
    image: "🍔",
    categoryId: "1",
    options: BURGER_OPTIONS
  },
  {
    id: "item3",
    name: "Hamburger Végétarien",
    description: "Pain complet, galette végétale, légumes grillés",
    price: 10.90,
    image: "🍔",
    categoryId: "1",
    options: BURGER_OPTIONS.filter(o => o.id !== "opt2" && o.id !== "opt3")
  },
  
  // Pizzas
  {
    id: "item4",
    name: "Pizza Margherita",
    description: "Tomate, mozzarella, basilic frais",
    price: 9.90,
    image: "🍕",
    categoryId: "2",
    options: PIZZA_OPTIONS
  },
  {
    id: "item5",
    name: "Pizza 4 Fromages",
    description: "Mozzarella, gorgonzola, parmesan, chèvre",
    price: 13.50,
    image: "🍕",
    categoryId: "2",
    options: PIZZA_OPTIONS
  },
  {
    id: "item6",
    name: "Pizza Pepperoni",
    description: "Tomate, mozzarella, pepperoni épicé",
    price: 12.90,
    image: "🍕",
    categoryId: "2",
    options: PIZZA_OPTIONS
  },
  
  // Salades
  {
    id: "item7",
    name: "Salade César",
    description: "Laitue romaine, poulet grillé, parmesan, croutons",
    price: 11.90,
    image: "🥗",
    categoryId: "3",
    options: SALAD_OPTIONS
  },
  {
    id: "item8",
    name: "Salade Niçoise",
    description: "Thon, tomates, œufs, olives, haricots verts",
    price: 12.50,
    image: "🥗",
    categoryId: "3",
    options: SALAD_OPTIONS
  },
  
  // Boissons (sans options)
  {
    id: "item9",
    name: "Coca-Cola",
    description: "33cl",
    price: 2.50,
    image: "🥤",
    categoryId: "4"
  },
  {
    id: "item10",
    name: "Eau minérale",
    description: "50cl",
    price: 2.00,
    image: "💧",
    categoryId: "4"
  },
  {
    id: "item11",
    name: "Jus d'orange",
    description: "25cl pressé frais",
    price: 3.50,
    image: "🍊",
    categoryId: "4"
  },
  
  // Desserts
  {
    id: "item12",
    name: "Tiramisu",
    description: "Fait maison",
    price: 6.50,
    image: "🍰",
    categoryId: "5"
  },
  {
    id: "item13",
    name: "Tarte aux pommes",
    description: "Servie tiède avec crème anglaise",
    price: 5.90,
    image: "🥧",
    categoryId: "5"
  },
  {
    id: "item14",
    name: "Glace 3 boules",
    description: "Au choix: vanille, chocolat, fraise",
    price: 4.50,
    image: "🍨",
    categoryId: "5"
  }
];

// Tables du restaurant
export const TABLES: Table[] = Array.from({ length: 20 }, (_, i) => ({
  id: `table${i + 1}`,
  number: i + 1,
  isActive: true
}));

// Commandes fictives
export const MOCK_ORDERS: Order[] = [
  {
    id: "order1",
    tableNumber: 5,
    items: [
      {
        menuItem: MENU_ITEMS[0],
        quantity: 2,
        selectedOptions: [BURGER_OPTIONS[0], BURGER_OPTIONS[1]]
      },
      {
        menuItem: MENU_ITEMS[9],
        quantity: 2,
        selectedOptions: []
      }
    ],
    status: "pending",
    total: 32.80,
    createdAt: new Date()
  }
];
