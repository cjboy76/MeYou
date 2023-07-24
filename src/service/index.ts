import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./Firebase";

const collectionName = "activeRoom"

export async function createRoom(hostId: string, onError?: (error: unknown) => void) {
    try {
        return await addDoc(collection(db, collectionName), {
            active: true,
            hostId,
        });

    } catch (error) {
        if (onError) {
            onError(error)
        }
    }
}

export async function updateGuest(roomNumber: string, guestId: string, onError?: (error: unknown) => void) {
    try {
        const roomRef = doc(db, collectionName, roomNumber);

        return await updateDoc(roomRef, {
            guestId
        });
    } catch (error) {
        if (onError) {
            onError(error)
        }
    }
}


export async function destroyRoom(roomNumber: string, onError?: (error: unknown) => void) {
    try {
        await deleteDoc(doc(db, collectionName, roomNumber));
    } catch (error) {
        if (onError) {
            onError(error)
        }
    }
}

