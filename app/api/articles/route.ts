import {NextResponse} from 'next/server';
import {readPublishedArticles} from '@/lib/article-server';
export const dynamic='force-dynamic';
export async function GET(){const result=await readPublishedArticles();return NextResponse.json({success:!result.unavailable,...result},{status:result.unavailable?503:200,headers:{'Cache-Control':'no-store'}});}
