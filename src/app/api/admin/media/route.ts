import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { assertCapability } from '@/server/permissions/rbac';
import {
  appendAuditLog,
  deleteMediaAssetById,
  getMediaAssetById,
  listMediaAssets,
  saveMediaAsset,
} from '@/server/db/dal';
import { MediaAsset } from '@/server/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    assertCapability(user.role, 'content.edit');

    const assets = await listMediaAssets();
    return NextResponse.json({ assets });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list media assets.' },
      { status: 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    assertCapability(user.role, 'media.upload');

    const body = await req.json();
    const { publicId, secureUrl, format, width, height, bytes, altText } = body;

    if (!publicId || !secureUrl) {
      return NextResponse.json({ error: 'publicId and secureUrl are required.' }, { status: 400 });
    }

    if (!altText?.ar || !altText?.en) {
      return NextResponse.json(
        {
          error:
            'Bilingual accessibility alt text (Arabic and English) is mandatory under WCAG guidelines.',
        },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const assetId = `MEDIA-${Date.now()}`;
    const newAsset: MediaAsset = {
      id: assetId,
      publicId,
      secureUrl,
      format: format || 'webp',
      width: Number(width) || 0,
      height: Number(height) || 0,
      bytes: Number(bytes) || 0,
      altText: {
        ar: String(altText.ar).trim(),
        en: String(altText.en).trim(),
      },
      uploadedBy: user.email,
      createdAt: nowIso,
    };

    await saveMediaAsset(newAsset);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'MEDIA_ASSET_UPLOADED',
      targetType: 'mediaAsset',
      targetId: newAsset.id,
      details: {
        publicId: newAsset.publicId,
        secureUrl: newAsset.secureUrl,
        bytes: newAsset.bytes,
      },
      createdAt: nowIso,
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to record media asset.' },
      { status: 403 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    assertCapability(user.role, 'media.delete');

    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('id');

    const asset = assetId ? await getMediaAssetById(assetId) : null;
    if (!assetId || !asset) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    await deleteMediaAssetById(assetId);
    await appendAuditLog({
      actorUid: user.uid,
      actorEmail: user.email,
      action: 'MEDIA_ASSET_DELETED',
      targetType: 'mediaAsset',
      targetId: assetId,
      details: { publicId: asset.publicId },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete media asset.' },
      { status: 403 }
    );
  }
}
