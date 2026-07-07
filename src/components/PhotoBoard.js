import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../utilities/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const PhotoBoard = ({gameId}) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const [newPhoto, setNewPhoto] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [user] = useAuthState(auth);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect (() => {
        const photoRef = collection(db, 'games', gameId, 'photos');
        const photoQuery = query(photoRef, orderBy('timestamp'));

        const unsuscribe = onSnapshot(photoQuery, (snapshot) => {
            const photoList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPhotos(photoList);
        });
        return unsuscribe;
    }, [gameId]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return; 
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            setUserName(userSnap.data()?.name);
        }
        fetchUser();
    },[user])

    const handleUpload = async () => {
        if (!newPhoto) {
            setError('Please select file')
            return;
        }
        if (!user) {
           setError('You cannot send photos') 
           return;
        }
        const formData = new FormData();
        formData.append('file', newPhoto);
        formData.append('upload_preset', uploadPreset);

        setIsLoading(true);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            const photoMessage = {
                autor: userName,
                uid: user.uid,
                photo: data.secure_url,
                timestamp: serverTimestamp()
            } 
            await addDoc(collection(db, 'games', gameId, 'photos'), photoMessage);
            setNewPhoto('');
        } catch (error) {
            setError('Failed to upload the photo')
        } finally {
            setIsLoading(false)
        }

    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;

        if (file && file.size > maxSize) {
           setError('The file is too large, max size is 5MB') 
           return;
        }

        if (file && !file.type.startsWith('image/')) {
           setError('Please select an image file') 
           return;
        }
        
        setNewPhoto(file);
    }

    return (
        <div>
            <div>
                {
                    photos.map((photo) => (
                        <div key={photo.id}>
                            <strong>{photo.autor}</strong>
                            <img src={photo.photo} alt={`Uploaded by ${photo.autor}`}/>
                            <span className="text-muted">{photo.timestamp?.toDate().toLocaleTimeString()}</span>
                        </div>
                    ))
                }
            </div>
            <div>
                {!user ? (<p className="disclaimer">Sign In!</p>) : (
                    <>
                        <input 
                            type="file"
                            accept="image/*"
                            placeholder="Select a photo"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Send'}
                        </button>
                    </>
                )}
            </div>
            <p>{error}</p>
        </div>
    )
}

export default PhotoBoard;