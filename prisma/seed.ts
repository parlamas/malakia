//prisma/seed.ts

import { PrismaClient, Axis } from '@prisma/client';

const prisma = new PrismaClient();

const behaviors: { axis: Axis; label: string; description: string }[] = [
  // Callous
  {
    axis: 'CALLOUS',
    label: 'Dismissed or mocked visible distress',
    description: 'Responded to someone\'s clear distress with indifference, ridicule, or contempt rather than basic acknowledgment.',
  },
  {
    axis: 'CALLOUS',
    label: 'Retaliated against a subordinate or constituent',
    description: 'Used position or influence to punish someone for raising a legitimate concern, complaint, or criticism.',
  },
  {
    axis: 'CALLOUS',
    label: 'Broke a public commitment with direct harm',
    description: 'Failed to honor a stated commitment in a way that caused avoidable harm to people relying on it.',
  },
  {
    axis: 'CALLOUS',
    label: 'Used position to publicly humiliate an individual',
    description: 'Leveraged official standing to demean or embarrass a specific person in public view.',
  },
  {
    axis: 'CALLOUS',
    label: 'Ignored a duty of care resulting in avoidable harm',
    description: 'Neglected a clear responsibility to protect or assist, where the neglect directly led to harm that could have been prevented.',
  },
  // Civic
  {
    axis: 'CIVIC',
    label: 'Intervened personally with no obligation to do so',
    description: 'Took direct action to help someone in a situation with no formal duty or expectation to act.',
  },
  {
    axis: 'CIVIC',
    label: 'Took public accountability without deflecting',
    description: 'Openly acknowledged a personal or institutional error rather than shifting blame or minimizing it.',
  },
  {
    axis: 'CIVIC',
    label: 'Used position to protect someone with less power',
    description: 'Applied official standing or influence in defense of someone in a materially weaker position.',
  },
  {
    axis: 'CIVIC',
    label: 'Acted transparently where concealment was easier',
    description: 'Disclosed information or acted openly in a matter where hiding it would have been the lower-cost option.',
  },
  {
    axis: 'CIVIC',
    label: 'Upheld a commitment at personal or political cost',
    description: 'Followed through on a stated commitment despite a real cost to their own interests.',
  },
];

async function main() {
  for (const b of behaviors) {
    await prisma.behavior.upsert({
      where: { label: b.label },
      update: { description: b.description, axis: b.axis, active: true },
      create: b,
    });
  }
  console.log(`Seeded ${behaviors.length} behaviors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });