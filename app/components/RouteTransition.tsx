/// <reference types="react/canary" />
'use client';
import {ViewTransition, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';

// Visual-only page transition for public routes. Admin screens keep a stable key so they never animate.
export default function RouteTransition({children}:{children:ReactNode}){
  const path=usePathname()||'/';
  const key=path.startsWith('/admin')?'admin':path;
  return <ViewTransition key={key} enter="v-page-in" exit="v-page-out" default="none">{children}</ViewTransition>;
}
