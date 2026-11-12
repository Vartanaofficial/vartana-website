'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {cartSnapshot,parseCart,subscribeCart} from './cart-storage';
const emptyCart=()=> '[]';
export function useCart(){const raw=useSyncExternalStore(subscribeCart,cartSnapshot,emptyCart);return useMemo(()=>parseCart(raw),[raw]);}
