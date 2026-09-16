// تست‌های واحد سبد خرید مهمان / Unit tests for guest cart
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((_i: number) => null),
  };
})();

// Replace global localStorage
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const CART_KEY = "clubinex_guest_cart";

interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

function getGuestCart(): GuestCartItem[] {
  const raw = localStorageMock.getItem(CART_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function setGuestCart(items: GuestCartItem[]): void {
  localStorageMock.setItem(CART_KEY, JSON.stringify(items));
}

function addToGuestCart(item: GuestCartItem): GuestCartItem[] {
  const cart = getGuestCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setGuestCart(cart);
  return cart;
}

function updateGuestCartQuantity(productId: string, quantity: number): GuestCartItem[] {
  const cart = getGuestCart();
  if (quantity <= 0) {
    const filtered = cart.filter((i) => i.productId !== productId);
    setGuestCart(filtered);
    return filtered;
  }
  const item = cart.find((i) => i.productId === productId);
  if (item) item.quantity = quantity;
  setGuestCart(cart);
  return cart;
}

function clearGuestCart(): void {
  localStorageMock.removeItem(CART_KEY);
}

describe("guest cart localStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns empty cart initially", () => {
    expect(getGuestCart()).toEqual([]);
  });

  it("adds items to cart", () => {
    const item: GuestCartItem = { productId: "p1", name: "Test Product", price: 100000, quantity: 1 };
    const cart = addToGuestCart(item);
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe("Test Product");
  });

  it("increases quantity for existing items", () => {
    const item: GuestCartItem = { productId: "p1", name: "Test Product", price: 100000, quantity: 1 };
    addToGuestCart(item);
    addToGuestCart({ ...item, quantity: 2 });
    const cart = getGuestCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  it("adds different products separately", () => {
    addToGuestCart({ productId: "p1", name: "Product 1", price: 100000, quantity: 1 });
    addToGuestCart({ productId: "p2", name: "Product 2", price: 200000, quantity: 2 });
    const cart = getGuestCart();
    expect(cart).toHaveLength(2);
  });

  it("updates quantity correctly", () => {
    addToGuestCart({ productId: "p1", name: "Test Product", price: 100000, quantity: 1 });
    const cart = updateGuestCartQuantity("p1", 5);
    expect(cart[0].quantity).toBe(5);
  });

  it("removes item when quantity is 0", () => {
    addToGuestCart({ productId: "p1", name: "Test Product", price: 100000, quantity: 1 });
    const cart = updateGuestCartQuantity("p1", 0);
    expect(cart).toHaveLength(0);
  });

  it("clears entire cart", () => {
    addToGuestCart({ productId: "p1", name: "Product 1", price: 100000, quantity: 1 });
    addToGuestCart({ productId: "p2", name: "Product 2", price: 200000, quantity: 2 });
    clearGuestCart();
    expect(getGuestCart()).toEqual([]);
  });

  it("handles corrupted localStorage data gracefully", () => {
    localStorageMock.setItem(CART_KEY, "invalid json {{{");
    expect(getGuestCart()).toEqual([]);
  });
});
