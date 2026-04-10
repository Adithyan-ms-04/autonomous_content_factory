import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/campaign/list - Clear all campaign history
export async function DELETE() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.agentMessage.deleteMany();
    await prisma.agentStatus.deleteMany();
    await prisma.contentPiece.deleteMany();
    await prisma.campaignOutput.deleteMany();
    await prisma.factSheet.deleteMany();
    await prisma.campaignWorkflow.deleteMany();
    await prisma.sourceDocument.deleteMany();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing campaign history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
