import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { achievements } from "../../src/constants/achievements";
import { DEFAULT_WEALTH_SNAPSHOT } from "../../src/constants/wealth";
import { CATALOG_VERSION_ID, catalogItems } from "../../src/data/catalog";

initializeApp();

async function seed() {
  const db = getFirestore();
  const batch = db.batch();

  for (const item of catalogItems) {
    batch.set(db.doc(`catalog/${item.id}`), item, { merge: true });
  }

  for (const achievement of achievements) {
    batch.set(
      db.doc(`achievements/${achievement.id}`),
      {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
      },
      { merge: true },
    );
  }

  batch.set(
    db.doc(`catalogVersions/${CATALOG_VERSION_ID}`),
    {
      id: CATALOG_VERSION_ID,
      itemCount: catalogItems.length,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    { merge: true },
  );

  batch.set(db.doc(`wealthSnapshots/${DEFAULT_WEALTH_SNAPSHOT.id}`), DEFAULT_WEALTH_SNAPSHOT, { merge: true });
  batch.set(
    db.doc("appConfig/public"),
    {
      currentWealthSnapshotId: DEFAULT_WEALTH_SNAPSHOT.id,
      currentCatalogVersionId: CATALOG_VERSION_ID,
      banners: [],
      featureFlags: {
        friendsRanking: false,
        localNotifications: false,
        categoryChallenge: true,
      },
    },
    { merge: true },
  );

  await batch.commit();
  console.log(`Seed concluido com ${catalogItems.length} itens.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
