import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Listing } from "@/lib/types";

export async function createListing(
  data: Omit<Listing, "id" | "createdAt">,
  imageFiles: File[]
): Promise<string> {
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    imageUrls.push(url);
  }
  const docRef = await addDoc(collection(db, "listings"), {
    ...data,
    images: imageUrls,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateListing(
  id: string,
  data: Partial<Omit<Listing, "id" | "createdAt">>,
  newImageFiles?: File[]
): Promise<void> {
  let imageUrls = data.images || [];
  if (newImageFiles && newImageFiles.length > 0) {
    for (const file of newImageFiles) {
      const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      imageUrls.push(url);
    }
  }
  await updateDoc(doc(db, "listings", id), { ...data, images: imageUrls });
}

export async function deleteListing(id: string): Promise<void> {
  await deleteDoc(doc(db, "listings", id));
}

export async function getAllListings(): Promise<Listing[]> {
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Listing[];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, "listings", id));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: (snap.data().createdAt as Timestamp)?.toDate() || new Date(),
  } as Listing;
}

export async function getListingsByHost(hostId: string): Promise<Listing[]> {
  const q = query(
    collection(db, "listings"),
    where("hostId", "==", hostId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Listing[];
}
