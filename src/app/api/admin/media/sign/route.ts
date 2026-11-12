import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Administrative session required.' }, { status: 401 });
    }

    assertCapability(user.role, 'media.upload');

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'rma-legal';
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary server credentials are not fully configured in environment.' },
        { status: 500 }
      );
    }

    // Cloudinary signature calculation: sorted query string + API secret
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signing failed.' }, { status: 403 });
  }
}
