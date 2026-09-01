import latte from "@/assets/latte.jpg";
import cappuccino from "@/assets/cappuccino.jpg";
import americano from "@/assets/americano.jpg";
import flatwhite from "@/assets/flatwhite.jpg";
import croissant from "@/assets/croissant.jpg";
import almondCroissant from "@/assets/almond-croissant.jpg";
import cinnamonRoll from "@/assets/cinnamon-roll.jpg";
import painAuChocolat from "@/assets/pain-au-chocolat.jpg";

export type MenuCategory = "coffee" | "bakery";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "latte",
    name: "Latte",
    description: "Espresso with steamed milk and a light layer of foam.",
    price: 4.75,
    category: "coffee",
    image: latte,
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and milk foam.",
    price: 4.5,
    category: "coffee",
    image: cappuccino,
  },
  {
    id: "americano",
    name: "Americano",
    description: "Espresso lengthened with hot water. Clean and bold.",
    price: 3.5,
    category: "coffee",
    image: americano,
  },
  {
    id: "flat-white",
    name: "Flat White",
    description: "Smooth ristretto shots with velvety steamed milk.",
    price: 4.25,
    category: "coffee",
    image: flatwhite,
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    description: "Flaky, golden, and buttery. Baked fresh daily.",
    price: 3.75,
    category: "bakery",
    image: croissant,
  },
  {
    id: "almond-croissant",
    name: "Almond Croissant",
    description: "Filled with almond cream and topped with toasted almonds.",
    price: 4.5,
    category: "bakery",
    image: almondCroissant,
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    description: "Warm, gooey, and topped with sweet cream cheese icing.",
    price: 4.25,
    category: "bakery",
    image: cinnamonRoll,
  },
  {
    id: "pain-au-chocolat",
    name: "Pain au Chocolat",
    description: "Buttery pastry layered with rich chocolate batons.",
    price: 3.75,
    category: "bakery",
    image: painAuChocolat,
  },
];

export const COFFEE_ITEMS = MENU_ITEMS.filter((i) => i.category === "coffee");
export const BAKERY_ITEMS = MENU_ITEMS.filter((i) => i.category === "bakery");

export const getMenuItem = (id: string) => MENU_ITEMS.find((i) => i.id === id);

export const CAFE = {
  name: "Coffee Room",
  tagline: "Coffee & Bakery",
  address: "123 Maple Street, Brooklyn, NY 11201",
  phone: "(718) 123-4567",
  email: "hello@coffeeroom.com",
  instagram: "@coffeeroombk",
  hours: [
    { days: "Mon – Fri", time: "7:00am – 7:00pm" },
    { days: "Sat – Sun", time: "8:00am – 7:00pm" },
  ],
} as const;
