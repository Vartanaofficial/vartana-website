import type {ReactNode} from 'react';
import AdminShell from './AdminShell';
import './admin-workspace.css';
export default function AdminLayout({children}:{children:ReactNode}){return <AdminShell>{children}</AdminShell>;}
