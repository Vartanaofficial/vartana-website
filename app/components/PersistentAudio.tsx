'use client';
import {usePathname} from 'next/navigation';
import AmbientMusic from './AmbientMusic';
import {isPaymentRoute} from '@/lib/audio-navigation';
export default function PersistentAudio(){const path=usePathname();return <AmbientMusic suspended={isPaymentRoute(path)}/>;}
