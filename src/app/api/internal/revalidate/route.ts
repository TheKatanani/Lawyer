import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.REVALIDATION_SECRET || 'dev_reval_secret';

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized revalidation' }, { status: 401 });
    }

    const { tag, tags } = await req.json();
    const tagList = tags || (tag ? [tag] : []);

    for (const t of tagList) {
      revalidateTag(t);
    }

    return NextResponse.json({ revalidated: true, tags: tagList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
