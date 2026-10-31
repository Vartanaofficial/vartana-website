import {NextRequest, NextResponse} from "next/server";
import {verifyAdminSessionToken} from "@/lib/admin-auth";
import {parseResearchPaper, researchDraft, researchQuery, researchTerm, type IngredientResearch, type ResearchPaper} from "@/lib/product-research";

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET, token = request.cookies.get("vartana_admin_session")?.value;
  if (!secret || !token || !verifyAdminSessionToken(token, secret)) return NextResponse.json({message:"Sesi admin tidak valid."}, {status:401});
  try {
    const body = await request.json();
    if (!Array.isArray(body.ingredients) || !body.ingredients.length || body.ingredients.length > 15 || body.ingredients.some((v: unknown)=>typeof v !== "string" || !v.trim() || v.length > 100) || (body.topic !== undefined && (typeof body.topic !== "string" || body.topic.length > 100))) return NextResponse.json({message:"Pilih 1–15 bahan. Kata pencarian maksimal 100 karakter."},{status:400});
    const ingredients = [...new Set<string>(body.ingredients.map((v: string)=>v.trim()))];
    const results: IngredientResearch[] = [];
    for (let i=0; i<ingredients.length; i+=5) results.push(...await Promise.all(ingredients.slice(i,i+5).map(async ingredient => {
      try {
        const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
        url.search = new URLSearchParams({query:researchQuery(ingredient, body.topic || ""),format:"json",pageSize:"3",resultType:"lite"}).toString();
        const response = await fetch(url, {signal:AbortSignal.timeout(8000), next:{revalidate:86400}});
        if (!response.ok) throw new Error("search");
        const data = await response.json();
        if (!Array.isArray(data.resultList?.result)) throw new Error("response");
        const papers = data.resultList.result.map(parseResearchPaper).filter((p: ResearchPaper | null): p is ResearchPaper=>p !== null);
        return {ingredient, term:researchTerm(ingredient), papers, draft:researchDraft(ingredient,papers)};
      } catch {return {ingredient,term:researchTerm(ingredient),papers:[],draft:"",error:"Pencarian belum berhasil. Coba lagi atau isi manual."};}
    })));
    return NextResponse.json({results, searchedAt:new Date().toISOString()});
  } catch {return NextResponse.json({message:"Pencarian belum berhasil. Coba lagi atau isi manual."},{status:502});}
}
