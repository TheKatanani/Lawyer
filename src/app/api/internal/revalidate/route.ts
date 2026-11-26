import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const RevalidateSchema = z.object({
  tag: z.string().trim().min(1).max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.REVALIDATION_SECRET?.trim();

    if (!secret) {
      return NextResponse.json({ error: 'Revalidation secret is not configured.' }, { status: 503 });
    }

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized revalidation' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = RevalidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid revalidation payload.' }, { status: 400 });
    }

    const tagList = parsed.data.tags || (parsed.data.tag ? [parsed.data.tag] : []);

    for (const t of tagList) {
      revalidateTag(t);
    }

    return NextResponse.json({ revalidated: true, tags: tagList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
