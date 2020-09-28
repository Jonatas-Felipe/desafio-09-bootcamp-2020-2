/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const listProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      setProducts(listProducts ? JSON.parse(listProducts) : []);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productFound = products.find(prod => prod.id === product.id);
      if (productFound) {
        increment(productFound.id);
      } else {
        product.quantity = 1;
        const listProducts: Product[] = [...products, product];
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(listProducts),
        );
        setProducts(listProducts);
      }
    },
    [increment, products],
  );

  const increment = useCallback(
    async id => {
      const listProducts = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
          return product;
        }
        return product;
      });
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(listProducts),
      );
      setProducts(listProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const listProducts = products.map(product => {
        if (product.id === id) {
          product.quantity -= 1;
        }
        return product;
      });

      const newList = listProducts.filter(product => !(product.quantity <= 0));
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newList),
      );

      setProducts(newList || []);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
