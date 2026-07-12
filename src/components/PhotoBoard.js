import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../utilities/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
// Import Styles and Icons
import style from '../styles/PhotoBoard.module.css'
import { Plus } from "lucide-react";

const PhotoBoard = ({gameId}) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;

        if (!file) return;
        if (file.size > maxSize) {
           setError('The file is too large, max size is 5MB') 
           return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return; 
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        setIsLoading(true)
        setError('');

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
        } catch (error) {
           setError('Failed to upload the photo') 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={style.photoSection}>
            <h2 className={style.photoTitle}>Photos</h2>

            <div className={style.photoGrid}>
                {photos.map((photo) => (
                    <div key={photo.id} className={style.imageCard}>
                        <img 
                            src={photo.photo} 
                            alt={`Uploaded by ${photo.autor}`}
                            className={style.gridImage}
                        />
                        <div className={style.imageoverlay}>
                            <span>{photo.autor}</span>
                        </div>
                    </div>
                ))}

                <div className={style.uploadCard}>
                    {isLoading ? (
                        <div className={style.loader}>Uploading...</div>
                    ) : !user ? (
                        <div className={style.disabledUpload}>
                            <span className={style.plusIcon}><Plus size={24} /></span>
                            <p className={style.uploadText}>Sign in to post photos</p>
                        </div>
                    ) : (
                        <label className={style.uploadLabel}>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={style.hiddenInput}
                            />
                            <span className={style.plusIcon}><Plus size={24} /></span>
                            <p className={style.uploadText}>Add Photo</p>
                        </label>
                    )}
                </div>
            </div>
            {error && <p className={style.errorText}>{error}</p>}
        </section>
    );
};

export default PhotoBoard;