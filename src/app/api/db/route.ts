import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { roles, levels, rate_cards } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  try {
    switch (table) {
      case 'roles':
        if (id) {
          const role = await db.select().from(roles).where(eq(roles.id, parseInt(id)));
          return NextResponse.json(role);
        }
        const allRoles = await db.select().from(roles);
        return NextResponse.json(allRoles);

      case 'levels':
        if (id) {
          const level = await db.select().from(levels).where(eq(levels.id, parseInt(id)));
          return NextResponse.json(level);
        }
        const allLevels = await db.select().from(levels);
        return NextResponse.json(allLevels);

      case 'rate_cards':
        if (id) {
          const rateCard = await db.select().from(rate_cards).where(eq(rate_cards.id, parseInt(id)));
          return NextResponse.json(rateCard);
        }
        const allRateCards = await db.select().from(rate_cards);
        return NextResponse.json(allRateCards);

      default:
        return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { table, data } = await request.json();

  try {
    switch (table) {
      case 'roles':
        const newRole = await db.insert(roles).values(data).returning();
        return NextResponse.json(newRole);

      case 'levels':
        const newLevel = await db.insert(levels).values(data).returning();
        return NextResponse.json(newLevel);

      case 'rate_cards':
        const newRateCard = await db.insert(rate_cards).values(data).returning();
        return NextResponse.json(newRateCard);

      default:
        return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { table, id, data } = await request.json();

  try {
    switch (table) {
      case 'roles':
        const updatedRole = await db.update(roles)
          .set(data)
          .where(eq(roles.id, id))
          .returning();
        return NextResponse.json(updatedRole);

      case 'levels':
        const updatedLevel = await db.update(levels)
          .set(data)
          .where(eq(levels.id, id))
          .returning();
        return NextResponse.json(updatedLevel);

      case 'rate_cards':
        const updatedRateCard = await db.update(rate_cards)
          .set(data)
          .where(eq(rate_cards.id, id))
          .returning();
        return NextResponse.json(updatedRateCard);

      default:
        return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table || !id) {
    return NextResponse.json({ error: 'Missing table or id parameter' }, { status: 400 });
  }

  try {
    switch (table) {
      case 'roles':
        await db.delete(roles).where(eq(roles.id, parseInt(id)));
        return NextResponse.json({ success: true });

      case 'levels':
        await db.delete(levels).where(eq(levels.id, parseInt(id)));
        return NextResponse.json({ success: true });

      case 'rate_cards':
        await db.delete(rate_cards).where(eq(rate_cards.id, parseInt(id)));
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 